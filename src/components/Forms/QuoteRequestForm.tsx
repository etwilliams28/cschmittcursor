import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase, uploadImage, getImageUrl } from '../../lib/supabase';
import { ShedListing } from '../../types/database';
import LoadingSpinner from '../UI/LoadingSpinner';
import { Upload, X } from 'lucide-react';

const quoteSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  project_type: z.string().min(1, 'Please select a project type'),
  material_type: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  shed_style: z.string().optional(),
  description: z.string().min(10, 'Please provide more details about your project'),
  budget_range: z.string().optional(),
  timeline: z.string().optional(),
  custom_message: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteRequestFormProps {
  selectedShed?: ShedListing | null;
  preselectedFilters?: {
    material_type: string;
    color: string;
    size: string;
    shed_style: string;
  };
  onSubmit?: () => void;
}

const QuoteRequestForm: React.FC<QuoteRequestFormProps> = ({
  selectedShed,
  preselectedFilters,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [inspirationImages, setInspirationImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      project_type: selectedShed ? 'Custom Shed' : '',
      material_type: selectedShed?.material_type || preselectedFilters?.material_type || '',
      color: selectedShed?.color || preselectedFilters?.color || '',
      size: selectedShed?.size || preselectedFilters?.size || '',
      shed_style: selectedShed?.shed_style || preselectedFilters?.shed_style || '',
      description: selectedShed ? `I'm interested in the ${selectedShed.title}` : '',
      custom_message: '',
    }
  });

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const fileName = `inspiration/${Date.now()}-${file.name}`;
        const imagePath = await uploadImage('images', fileName, file);
        newImages.push(imagePath);
      } catch (error) {
        console.error('Error uploading inspiration image:', error);
        alert(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    setInspirationImages(prev => [...prev, ...newImages]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setInspirationImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmitForm = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const quoteData = {
        ...data,
        inspiration_images: inspirationImages,
      };

      const { error } = await supabase
        .from('quote_requests')
        .insert([quoteData]);

      if (error) throw error;

      setSubmitStatus('success');
      reset();
      
      if (onSubmit) {
        setTimeout(() => {
          onSubmit();
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting quote request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectTypes = [
    'Custom Shed',
    'Garage Addition',
    'Home Addition',
    'Exterior Renovation',
    'Other'
  ];

  const budgetRanges = [
    'Under $2,000',
    '$2,000 - $5,000',
    '$5,000 - $10,000',
    '$10,000 - $20,000',
    '$20,000 - $50,000',
    'Over $50,000'
  ];

  const timelines = [
    'ASAP',
    'Within 1 month',
    '2-3 months',
    '3-6 months',
    'More than 6 months',
    'Flexible'
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {selectedShed && (
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Selected Shed:</h4>
          <p className="text-blue-800 text-sm sm:text-base">{selectedShed.title}</p>
          <p className="text-xs sm:text-sm text-blue-600">
            {selectedShed.size} • {selectedShed.material_type} • {selectedShed.color}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="customer_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="customer_name"
            {...register('customer_name')}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Your full name"
          />
          {errors.customer_name && (
            <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.customer_name.message}</p>
          )}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email.message}</p>
          )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            {...register('phone')}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="(123) 456-7890"
          />
          </div>

          <div>
            <label htmlFor="project_type" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Project Type *
          </label>
          <select
            id="project_type"
            {...register('project_type')}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">Select project type</option>
            {projectTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.project_type && (
            <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.project_type.message}</p>
          )}
          </div>

          <div>
            <label htmlFor="material_type" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Preferred Material
          </label>
          <select
            id="material_type"
            {...register('material_type')}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">Any material</option>
            <option value="Wood">Wood</option>
            <option value="Metal">Metal</option>
            <option value="Vinyl">Vinyl</option>
          </select>
          </div>

          <div>
            <label htmlFor="size" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Desired Size
          </label>
          <input
            type="text"
            id="size"
            {...register('size')}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="e.g., 10x12, 8x10"
          />
          </div>

          <div>
            <label htmlFor="budget_range" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Budget Range
          </label>
          <select
            id="budget_range"
            {...register('budget_range')}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">Select budget range</option>
            {budgetRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
          </div>

          <div>
            <label htmlFor="timeline" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Timeline
          </label>
          <select
            id="timeline"
            {...register('timeline')}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">Select timeline</option>
            {timelines.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Project Description *
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          placeholder="Please describe your project requirements, any special features needed, or questions you have..."
        />
        {errors.description && (
          <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.description.message}</p>
        )}
        </div>

        <div>
          <label htmlFor="custom_message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Additional Message
        </label>
        <textarea
          id="custom_message"
          rows={3}
          {...register('custom_message')}
          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          placeholder="Any additional details, special requests, or questions..."
        />
        </div>

        {/* Inspiration Image Upload */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Inspiration Images (Optional)
        </label>
        <p className="text-xs sm:text-sm text-gray-500 mb-3">
          Upload photos of sheds or features you like for inspiration
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            className="hidden"
            id="inspiration-upload"
          />
          <label
            htmlFor="inspiration-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-2" />
            <span className="text-xs sm:text-sm text-gray-600">Click to upload inspiration images</span>
          </label>
        </div>

        {/* Image Preview */}
        {inspirationImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
            {inspirationImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={getImageUrl('images', image)}
                  alt={`Inspiration ${index + 1}`}
                  className="w-full h-20 sm:h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-2 w-2 sm:h-3 sm:w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <div className="flex items-center justify-center mt-4">
            <LoadingSpinner size="sm" className="mr-2" />
            <span className="text-xs sm:text-sm text-gray-600">Uploading images...</span>
          </div>
        )}
        </div>

        {submitStatus === 'success' && (
          <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium text-sm sm:text-base">
            Thank you for your quote request! We'll review your requirements and get back to you within 24 hours with a detailed estimate.
          </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium text-sm sm:text-base">
            Sorry, there was an error submitting your quote request. Please try again or call us directly.
          </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 sm:px-6 rounded-lg font-semibold transition-colors flex items-center justify-center text-sm sm:text-base"
        >
          {isSubmitting || uploading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {uploading ? 'Uploading Images...' : 'Submitting Request...'}
            </>
          ) : (
            'Submit Quote Request'
          )}
        </button>
      </form>
    </div>
  );
};

export default QuoteRequestForm;