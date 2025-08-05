import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Play, ChevronLeft, ChevronRight, Hammer, Home, Wrench, Building, Warehouse, Car, Plus, Layers, Droplets, Zap, X, MapPin, Calendar } from 'lucide-react';
import { supabase, getImageUrl } from '../lib/supabase';
import { HomeContent, VideoCarousel, Review, PastProject } from '../types/database';
import Modal from '../components/UI/Modal';
import ContactForm from '../components/Forms/ContactForm';
import { scrollToContact } from '../utils/scrollUtils';

const HomePage: React.FC = () => {
  const [heroContent, setHeroContent] = useState<HomeContent | null>(null);
  const [videos, setVideos] = useState<VideoCarousel[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [projects, setProjects] = useState<PastProject[]>([]);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [selectedProject, setSelectedProject] = useState<PastProject | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    // Fetch hero content
    const { data: heroData } = await supabase
      .from('home_content')
      .select('*')
      .eq('section_name', 'hero')
      .single();
    if (heroData) setHeroContent(heroData);

    // Fetch videos
    const { data: videoData } = await supabase
      .from('video_carousel')
      .select('*')
      .eq('is_active', true)
      .order('order_index');
    if (videoData) setVideos(videoData);

    // Fetch featured reviews
    const { data: reviewData } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .eq('is_featured', true)
      .limit(6);
    if (reviewData) setReviews(reviewData);

    // Fetch featured projects
    const { data: projectData } = await supabase
      .from('past_projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8);
    if (projectData) setProjects(projectData);
  };

  const services = [
    {
      icon: Warehouse,
      title: 'Shops',
      description: 'Custom workshop and storage buildings designed for your specific needs and workspace requirements.'
    },
    {
      icon: Car,
      title: 'Garages & Additions',
      description: 'Professional garage construction and home additions with quality materials and expert craftsmanship.'
    },
    {
      icon: Layers,
      title: 'Siding, Soffit & Fascia',
      description: 'Complete exterior cladding solutions including vinyl, wood, and metal siding with professional trim work.'
    },
    {
      icon: Droplets,
      title: 'Eavestrough & Roofing',
      description: 'Professional roofing services and seamless eavestrough installation for complete water management.'
    },
    {
      icon: Zap,
      title: 'Garage Doors',
      description: 'Installation and repair of residential and commercial garage doors with professional service.'
    },
    {
      icon: Building,
      title: 'Custom Sheds',
      description: 'Tailored storage solutions with various styles, sizes, and materials to meet your specific needs.'
    }
  ];

  const projectTypes = ['All', 'Garage', 'Home Addition', 'Exterior Renovation', 'Custom Shed'];

  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(project => project.project_type.includes(activeFilter));

  const nextVideo = () => {
    setCurrentVideo((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentVideo((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const nextImage = () => {
    if (selectedProject && selectedProject.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProject.images.length);
    }
  };

  const prevImage = () => {
    if (selectedProject && selectedProject.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedProject.images.length) % selectedProject.images.length);
    }
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const openProjectModal = (project: PastProject) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                {heroContent?.title || 'Quality Craftsmanship You Can Trust'}
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                {heroContent?.content || 'From custom sheds and garages to home additions and exterior renovations, we bring your vision to life with exceptional quality and attention to detail.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToContact}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  Get Your Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <Link
                  to="/sheds"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold transition-colors text-center"
                >
                  View Custom Sheds
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroContent?.image_url ? getImageUrl('images', heroContent.image_url) : "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800"}
                alt="Construction work"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Video Carousel */}
      {videos.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">See Our Work in Action</h2>
              <p className="text-lg text-gray-600">Watch our latest project videos</p>
            </div>
            
            <div className="relative">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={videos[currentVideo]?.video_url}
                  poster={videos[currentVideo]?.thumbnail_url}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
              
              {videos.length > 1 && (
                <>
                  <button
                    onClick={prevVideo}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextVideo}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-2">
                  {videos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentVideo(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentVideo ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {videos[currentVideo]?.title}
              </h3>
              <p className="text-gray-600 mt-2">
                {videos[currentVideo]?.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Do</h2>
            <p className="text-lg text-gray-600">Professional construction services delivered with excellence</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <service.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Projects Gallery */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Recent Work</h2>
            <p className="text-lg text-gray-600">Browse our portfolio of completed projects</p>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {projectTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  activeFilter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => openProjectModal(project)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={project.images[0] ? getImageUrl('images', project.images[0]) : 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={project.title}
                    className="w-full h-full object-contain bg-gray-100 hover:scale-105 transition-transform duration-300"
                  />
                  {project.is_featured && (
                    <span className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 text-xs font-semibold rounded-full shadow-lg">
                      Featured
                    </span>
                  )}
                  {project.images.length > 1 && (
                    <span className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded-full">
                      +{project.images.length - 1} more
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{project.project_type}</p>
                  <p className="text-sm text-gray-500 mb-2">{project.location}</p>
                  {project.completion_date && (
                    <p className="text-xs text-gray-400">
                      Completed: {new Date(project.completion_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
              <p className="text-lg text-gray-600">Real feedback from satisfied customers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{review.review_text}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">{review.customer_name}</p>
                    <p className="text-sm text-gray-600">{review.project_type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      

      {/* Contact Form Section */}
      <section id="contact" className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Your Free Quote</h2>
            <p className="text-lg text-gray-600">Ready to start your project? Contact us today!</p>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* Project Detail Modal */}
      <Modal
        isOpen={!!selectedProject}
        onClose={closeProjectModal}
        size="xl"
      >
        {selectedProject && (
          <div>
            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 pr-8">{selectedProject.title}</h2>
            </div>

            {/* Mobile Project Info */}
            <div className="block sm:hidden mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{selectedProject.project_type}</span>
                {selectedProject.completion_date && (
                  <span className="text-gray-500">
                    {new Date(selectedProject.completion_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              {selectedProject.location && (
                <div className="mt-1 text-sm text-gray-600">{selectedProject.location}</div>
              )}
            </div>

            {/* Photo Gallery */}
            <div className="mb-6 sm:mb-8">
              {/* Main Image */}
              <div className="relative mb-3 sm:mb-4">
                <img
                  src={selectedProject.images[currentImageIndex] ? getImageUrl('images', selectedProject.images[currentImageIndex]) : 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-64 sm:h-96 object-cover rounded-lg shadow-lg"
                />
                
                {/* Navigation Arrows */}
                {selectedProject.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                    >
                      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                {selectedProject.images.length > 1 && (
                  <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                    {currentImageIndex + 1} / {selectedProject.images.length}
                  </div>
                )}
                
                {/* Featured Badge */}
                {selectedProject.is_featured && (
                  <span className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-orange-500 text-white px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-semibold rounded-full shadow-lg">
                    Featured Project
                  </span>
                )}
              </div>
              
              {/* Thumbnail Gallery - Hidden on mobile */}
              {selectedProject.images.length > 1 && (
                <div className="hidden sm:grid grid-cols-6 gap-2">
                  {selectedProject.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => selectImage(index)}
                      className={`relative h-16 rounded-lg overflow-hidden transition-all ${
                        index === currentImageIndex 
                          ? 'ring-2 ring-blue-500 ring-offset-2' 
                          : 'hover:opacity-75'
                      }`}
                    >
                      <img
                        src={getImageUrl('images', image)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Project Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              {/* Project Details - Hidden on mobile (shown in header) */}
              <div className="hidden sm:block">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedProject.project_type}
                    </span>
                  </div>
                  
                  {selectedProject.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="font-medium">Location:</span>
                      <span className="ml-2">{selectedProject.location}</span>
                    </div>
                  )}
                  
                  {selectedProject.completion_date && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="font-medium">Completed:</span>
                      <span className="ml-2">
                        {new Date(selectedProject.completion_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Project Description */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">About This Project</h3>
                {selectedProject.description && (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{selectedProject.description}</p>
                  </div>
                ) || (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-gray-500 italic text-sm sm:text-base">
                      This {selectedProject.project_type.toLowerCase()} project showcases our commitment to quality craftsmanship and attention to detail.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Contact Request Bar */}
            <div className="border-t border-gray-200 pt-4 sm:pt-6 bg-gradient-to-r from-blue-50 to-orange-50 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 px-4 sm:px-6 pb-4 sm:pb-6 rounded-b-lg">
              <div className="text-center">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Interested in a Similar Project?
                </h4>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Get a free consultation and quote for your {selectedProject.project_type.toLowerCase()} project
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={(e) => {
                      closeProjectModal();
                      scrollToContact(e);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center text-sm sm:text-base"
                  >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Get Free Quote
                  </button>
                  <Link
                    to="/sheds"
                    onClick={closeProjectModal}
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center text-sm sm:text-base"
                  >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                    </svg>
                    Browse Custom Sheds
                  </Link>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-3">
                  📞 Call us directly or fill out our contact form for fastest response
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HomePage;