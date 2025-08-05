import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, Check, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { Review } from '../../types/database';
import Modal from '../UI/Modal';
import LoadingSpinner from '../UI/LoadingSpinner';

const reviewSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating cannot exceed 5'),
  review_text: z.string().min(10, 'Review text must be at least 10 characters'),
  project_type: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_approved: z.boolean().default(false),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const ReviewsManager: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema)
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setReviews(data);
    setLoading(false);
  };

  const onSubmit = async (data: ReviewFormData) => {
    try {
      if (selectedReview) {
        const { error } = await supabase
          .from('reviews')
          .update(data)
          .eq('id', selectedReview.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reviews')
          .insert([data]);

        if (error) throw error;
      }

      await fetchReviews();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  const deleteReview = async (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (!error) {
        setReviews(reviews.filter(r => r.id !== id));
      }
    }
  };

  const toggleReviewStatus = async (id: string, field: 'is_approved' | 'is_featured', currentValue: boolean) => {
    const { error } = await supabase
      .from('reviews')
      .update({ [field]: !currentValue })
      .eq('id', id);

    if (!error) {
      setReviews(reviews.map(review => 
        review.id === id ? { ...review, [field]: !currentValue } : review
      ));
    }
  };

  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setValue('customer_name', review.customer_name);
    setValue('rating', review.rating);
    setValue('review_text', review.review_text);
    setValue('project_type', review.project_type || '');
    setValue('is_featured', review.is_featured || false);
    setValue('is_approved', review.is_approved || false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReview(null);
    reset();
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'approved') return review.is_approved;
    if (filter === 'pending') return !review.is_approved;
    return true;
  });

  const projectTypes = ['Custom Shed', 'Garage Addition', 'Home Addition', 'Exterior Renovation', 'Roofing', 'Siding'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Review
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All', count: reviews.length },
          { key: 'approved', label: 'Approved', count: reviews.filter(r => r.is_approved).length },
          { key: 'pending', label: 'Pending', count: reviews.filter(r => !r.is_approved).length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map((review) => (
          <div key={review.id} className={`bg-white rounded-lg shadow-lg p-6 ${!review.is_approved ? 'border-l-4 border-yellow-400' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex space-x-1">
                {review.is_featured && (
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
                {review.is_approved ? (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Approved
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Pending
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">"{review.review_text}"</p>

            <div className="border-t pt-4">
              <p className="font-semibold text-gray-900">{review.customer_name}</p>
              {review.project_type && (
                <p className="text-sm text-gray-600">{review.project_type}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleReviewStatus(review.id, 'is_approved', review.is_approved)}
                  className={`p-1 rounded ${
                    review.is_approved 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={review.is_approved ? 'Approved' : 'Approve'}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleReviewStatus(review.id, 'is_featured', review.is_featured)}
                  className={`p-1 rounded ${
                    review.is_featured 
                      ? 'text-orange-600 hover:bg-orange-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={review.is_featured ? 'Featured' : 'Feature'}
                >
                  <Star className="h-4 w-4" />
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditReview(review)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Review Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedReview ? 'Edit Review' : 'Add New Review'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                {...register('customer_name')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Customer name"
              />
              {errors.customer_name && (
                <p className="mt-1 text-sm text-red-600">{errors.customer_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <select
                {...register('rating', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select rating</option>
                {[1, 2, 3, 4, 5].map(rating => (
                  <option key={rating} value={rating}>
                    {rating} Star{rating > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              {errors.rating && (
                <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Type
              </label>
              <select
                {...register('project_type')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select project type</option>
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Text *
            </label>
            <textarea
              {...register('review_text')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Customer review..."
            />
            {errors.review_text && (
              <p className="mt-1 text-sm text-red-600">{errors.review_text.message}</p>
            )}
          </div>

          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('is_featured')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Featured Review</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('is_approved')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Approved</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                selectedReview ? 'Update Review' : 'Add Review'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReviewsManager;