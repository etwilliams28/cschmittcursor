import React, { useState, useEffect } from 'react';
import { Save, Upload, X, Play, Plus, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase, uploadImage, getImageUrl } from '../../lib/supabase';
import { HomeContent, VideoCarousel } from '../../types/database';
import Modal from '../UI/Modal';
import LoadingSpinner from '../UI/LoadingSpinner';

const homeContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  cta_text: z.string().optional(),
  cta_link: z.string().optional(),
  is_active: z.boolean().default(true),
});

const videoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  video_url: z.string().url('Please enter a valid video URL'),
  thumbnail_url: z.string().optional(),
  order_index: z.number().min(0).default(0),
  is_active: z.boolean().default(true),
});

type HomeContentFormData = z.infer<typeof homeContentSchema>;
type VideoFormData = z.infer<typeof videoSchema>;

const HomeContentManager: React.FC = () => {
  const [heroContent, setHeroContent] = useState<HomeContent | null>(null);
  const [videos, setVideos] = useState<VideoCarousel[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoCarousel | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [heroImage, setHeroImage] = useState<string>('');
  const [thumbnailImage, setThumbnailImage] = useState<string>('');

  const {
    register: registerHero,
    handleSubmit: handleHeroSubmit,
    setValue: setHeroValue,
    formState: { errors: heroErrors, isSubmitting: heroSubmitting }
  } = useForm<HomeContentFormData>({
    resolver: zodResolver(homeContentSchema)
  });

  const {
    register: registerVideo,
    handleSubmit: handleVideoSubmit,
    reset: resetVideo,
    setValue: setVideoValue,
    formState: { errors: videoErrors, isSubmitting: videoSubmitting }
  } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema)
  });

  useEffect(() => {
    fetchHomeContent();
    fetchVideos();
  }, []);

  const fetchHomeContent = async () => {
    const { data } = await supabase
      .from('home_content')
      .select('*')
      .eq('section_name', 'hero')
      .single();
    
    if (data) {
      setHeroContent(data);
      setHeroImage(data.image_url || '');
      setHeroValue('title', data.title || '');
      setHeroValue('subtitle', data.subtitle || '');
      setHeroValue('content', data.content || '');
      setHeroValue('cta_text', data.cta_text || '');
      setHeroValue('cta_link', data.cta_link || '');
      setHeroValue('is_active', data.is_active || true);
    }

    // Also fetch sheds hero content
    const { data: shedsHeroData } = await supabase
      .from('home_content')
      .select('*')
      .eq('section_name', 'sheds_hero')
      .single();
    
    // Store sheds hero data for potential editing
    if (shedsHeroData) {
      // You can add state for sheds hero if needed
    }

    setLoading(false);
  };

  const fetchVideos = async () => {
    const { data } = await supabase
      .from('video_carousel')
      .select('*')
      .order('order_index');
    
    if (data) setVideos(data);
  };

  const handleHeroImageUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    setUploading(true);
    console.log('Starting hero image upload...');
    try {
      const file = files[0];
      console.log(`Uploading hero image: ${file.name}`);
      const fileName = `hero/${Date.now()}-${file.name}`;
      const imagePath = await uploadImage('images', fileName, file);
      console.log(`Hero image uploaded successfully: ${imagePath}`);
      setHeroImage(imagePath);
    } catch (error) {
      console.error('Error uploading hero image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Show a more user-friendly alert for bucket creation issues
      if (errorMessage.includes('does not exist')) {
        alert(`Storage Setup Required:\n\n${errorMessage}\n\nThis is a one-time setup step.`);
      } else {
        alert(`Failed to upload image: ${errorMessage}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    setUploading(true);
    console.log('Starting thumbnail upload...');
    try {
      const file = files[0];
      console.log(`Uploading thumbnail: ${file.name}`);
      const fileName = `thumbnails/${Date.now()}-${file.name}`;
      const imagePath = await uploadImage('images', fileName, file);
      console.log(`Thumbnail uploaded successfully: ${imagePath}`);
      setThumbnailImage(imagePath);
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Show a more user-friendly alert for bucket creation issues
      if (errorMessage.includes('does not exist')) {
        alert(`Storage Setup Required:\n\n${errorMessage}\n\nThis is a one-time setup step.`);
      } else {
        alert(`Failed to upload thumbnail: ${errorMessage}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const onHeroSubmit = async (data: HomeContentFormData) => {
    try {
      const heroData = {
        ...data,
        section_name: 'hero',
        image_url: heroImage,
      };

      if (heroContent) {
        const { error } = await supabase
          .from('home_content')
          .update(heroData)
          .eq('id', heroContent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('home_content')
          .insert([heroData]);

        if (error) throw error;
      }

      await fetchHomeContent();
    } catch (error) {
      console.error('Error saving hero content:', error);
    }
  };

  const onVideoSubmit = async (data: VideoFormData) => {
    try {
      const videoData = {
        ...data,
        thumbnail_url: thumbnailImage,
      };

      if (selectedVideo) {
        const { error } = await supabase
          .from('video_carousel')
          .update(videoData)
          .eq('id', selectedVideo.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('video_carousel')
          .insert([videoData]);

        if (error) throw error;
      }

      await fetchVideos();
      handleCloseVideoModal();
    } catch (error) {
      console.error('Error saving video:', error);
    }
  };

  const deleteVideo = async (id: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      const { error } = await supabase
        .from('video_carousel')
        .delete()
        .eq('id', id);

      if (!error) {
        setVideos(videos.filter(v => v.id !== id));
      }
    }
  };

  const toggleVideoStatus = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('video_carousel')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (!error) {
      setVideos(videos.map(video => 
        video.id === id ? { ...video, is_active: !isActive } : video
      ));
    }
  };

  const handleEditVideo = (video: VideoCarousel) => {
    setSelectedVideo(video);
    setThumbnailImage(video.thumbnail_url || '');
    setVideoValue('title', video.title);
    setVideoValue('description', video.description || '');
    setVideoValue('video_url', video.video_url);
    setVideoValue('order_index', video.order_index || 0);
    setVideoValue('is_active', video.is_active || true);
    setShowVideoModal(true);
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
    setThumbnailImage('');
    resetVideo();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Home Page Content</h1>

      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Hero Section</h2>
        
        <form onSubmit={handleHeroSubmit(onHeroSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Title *
              </label>
              <input
                type="text"
                {...registerHero('title')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Quality Craftsmanship You Can Trust"
              />
              {heroErrors.title && (
                <p className="mt-1 text-sm text-red-600">{heroErrors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                {...registerHero('subtitle')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Professional Construction Services"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Button Text
              </label>
              <input
                type="text"
                {...registerHero('cta_text')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Get Your Free Quote"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Button Link
              </label>
              <input
                type="text"
                {...registerHero('cta_link')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#contact"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...registerHero('content')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="From custom sheds and garages to home additions and exterior renovations..."
            />
          </div>

          {/* Hero Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleHeroImageUpload(e.target.files)}
                className="hidden"
                id="hero-image-upload"
              />
              <label
                htmlFor="hero-image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {heroImage ? (
                  <div className="relative">
                    <img
                      src={getImageUrl('images', heroImage)}
                      alt="Hero"
                      className="h-32 w-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setHeroImage('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload hero image</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...registerHero('is_active')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={heroSubmitting || uploading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {heroSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Hero Section
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Video Carousel */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Video Carousel</h2>
          <button
            onClick={() => setShowVideoModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Video
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className={`bg-gray-50 rounded-lg p-4 ${!video.is_active ? 'opacity-60' : ''}`}>
              <div className="relative mb-4">
                {video.thumbnail_url ? (
                  <img
                    src={getImageUrl('images', video.thumbnail_url)}
                    alt={video.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Play className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                {!video.is_active && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                    Inactive
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{video.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Order: {video.order_index}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleVideoStatus(video.id, video.is_active)}
                    className={`text-xs px-2 py-1 rounded ${
                      video.is_active 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {video.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleEditVideo(video)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteVideo(video.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <Modal
        isOpen={showVideoModal}
        onClose={handleCloseVideoModal}
        title={selectedVideo ? 'Edit Video' : 'Add New Video'}
        size="lg"
      >
        <form onSubmit={handleVideoSubmit(onVideoSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Title *
              </label>
              <input
                type="text"
                {...registerVideo('title')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Video title"
              />
              {videoErrors.title && (
                <p className="mt-1 text-sm text-red-600">{videoErrors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Index
              </label>
              <input
                type="number"
                {...registerVideo('order_index', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video URL *
            </label>
            <input
              type="url"
              {...registerVideo('video_url')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/video.mp4"
            />
            {videoErrors.video_url && (
              <p className="mt-1 text-sm text-red-600">{videoErrors.video_url.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...registerVideo('description')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Video description..."
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleThumbnailUpload(e.target.files)}
                className="hidden"
                id="thumbnail-upload"
              />
              <label
                htmlFor="thumbnail-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {thumbnailImage ? (
                  <div className="relative">
                    <img
                      src={getImageUrl('images', thumbnailImage)}
                      alt="Thumbnail"
                      className="h-24 w-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setThumbnailImage('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload thumbnail</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...registerVideo('is_active')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCloseVideoModal}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={videoSubmitting || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center"
            >
              {videoSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                selectedVideo ? 'Update Video' : 'Add Video'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HomeContentManager;