import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { supabase, getImageUrl } from '../lib/supabase';
import { ShedListing, HomeContent } from '../types/database';
import Modal from '../components/UI/Modal';
import QuoteRequestForm from '../components/Forms/QuoteRequestForm';

const CustomSheds: React.FC = () => {
  const [sheds, setSheds] = useState<ShedListing[]>([]);
  const [filteredSheds, setFilteredSheds] = useState<ShedListing[]>([]);
  const [heroContent, setHeroContent] = useState<HomeContent | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    material_type: '',
    color: '',
    size: '',
    shed_style: ''
  });
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedShed, setSelectedShed] = useState<ShedListing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Color swatches mapping
  const colorSwatches = {
    'Black': '#000000',
    'Charcoal': '#36454F',
    'Navy Blue': '#000080',
    'Red': '#DC2626',
    'White': '#FFFFFF',
    'Brown': '#8B4513',
    'Green': '#22C55E',
    'Gray': '#6B7280',
    'Natural': '#D2B48C'
  };

  useEffect(() => {
    fetchSheds();
    fetchHeroContent();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sheds, filters]);

  const fetchSheds = async () => {
    const { data } = await supabase
      .from('shed_listings')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false });
    
    if (data) {
      setSheds(data);
    }
  };

  const fetchHeroContent = async () => {
    const { data } = await supabase
      .from('home_content')
      .select('*')
      .eq('section_name', 'sheds_hero')
      .single();
    
    if (data) setHeroContent(data);
  };

  const applyFilters = () => {
    let filtered = sheds;

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(shed => 
          shed[key as keyof typeof filters]?.toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    setFilteredSheds(filtered);
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key as keyof typeof filters] === value ? '' : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      material_type: '',
      color: '',
      size: '',
      shed_style: ''
    });
  };

  const getUniqueValues = (key: keyof ShedListing) => {
    return [...new Set(sheds.map(shed => shed[key]).filter(Boolean))];
  };

  const handleQuoteRequest = (shed?: ShedListing) => {
    setSelectedShed(shed || null);
    setShowQuoteModal(true);
  };

  const handleShedDetails = (shed: ShedListing) => {
    setSelectedShed(shed);
    setCurrentImageIndex(0);
    setShowDetailsModal(true);
  };

  const nextImage = () => {
    if (selectedShed && selectedShed.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedShed.images.length);
    }
  };

  const prevImage = () => {
    if (selectedShed && selectedShed.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedShed.images.length) % selectedShed.images.length);
    }
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const sizeCategories = {
    'Small': ['8x8', '8x10', '8x12'],
    'Medium': ['10x10', '10x12', '10x16'],
    'Large': ['12x12', '12x16', '12x20', '14x20'],
    'Other': ['Other']
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Full-Width Background */}
      <section 
        className="relative h-96 bg-cover bg-center bg-gray-900"
        style={{
          backgroundImage: heroContent?.image_url 
            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${getImageUrl('images', heroContent.image_url)})`
            : `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://www.facebook.com/reel/981571796949682')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {heroContent?.title || 'Custom-Built Sheds Designed for Your Lifestyle'}
            </h1>
            {heroContent?.subtitle && (
              <p className="text-xl md:text-2xl mb-8 text-gray-200">
                {heroContent.subtitle}
              </p>
            )}
            <button
              onClick={() => handleQuoteRequest()}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              {heroContent?.cta_text || 'Request a Custom Build'}
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-72 lg:flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full bg-white rounded-lg shadow-lg p-4 flex items-center justify-between"
              >
                <span className="font-medium text-gray-900">Filters</span>
                <div className="flex items-center space-x-2">
                  {Object.values(filters).some(f => f) && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                  <Filter className="h-5 w-5 text-gray-500" />
                </div>
              </button>
            </div>

            {/* Filter Panel */}
            <div className={`bg-white rounded-lg shadow-lg p-4 lg:sticky lg:top-4 ${
              showMobileFilters ? 'block' : 'hidden lg:block'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {/* Material Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Material</label>
                  <div className="space-y-1">
                    {getUniqueValues('material_type').map(type => (
                      <label key={type} className="flex items-center cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="material_type"
                          checked={filters.material_type === type}
                          onChange={() => updateFilter('material_type', type)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                        />
                        <span className="ml-2 text-xs text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Color Filter with Swatches */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Color</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-1">
                    {getUniqueValues('color').map(color => (
                      <button
                        key={color}
                        onClick={() => updateFilter('color', color)}
                        className={`flex flex-col items-center p-1 rounded border transition-all ${
                          filters.color === color 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300 mb-1"
                          style={{ backgroundColor: colorSwatches[color as keyof typeof colorSwatches] || '#9CA3AF' }}
                        />
                        <span className="text-xs text-gray-700 text-center leading-tight">{color}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Size</label>
                  <div className="space-y-1">
                    {Object.entries(sizeCategories).map(([category, sizes]) => (
                      <div key={category}>
                        <div className="text-xs font-medium text-gray-500 mb-0.5">{category}</div>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-0.5">
                          {sizes.filter(size => getUniqueValues('size').includes(size)).map(size => (
                            <label key={size} className="flex items-center cursor-pointer text-sm">
                              <input
                                type="radio"
                                name="size"
                                checked={filters.size === size}
                                onChange={() => updateFilter('size', size)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                              />
                              <span className="ml-2 text-xs text-gray-700">{size}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shed Style Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Style</label>
                  <div className="space-y-1">
                    {getUniqueValues('shed_style').map(style => (
                      <label key={style} className="flex items-center cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="shed_style"
                          checked={filters.shed_style === style}
                          onChange={() => updateFilter('shed_style', style)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                        />
                        <span className="ml-2 text-xs text-gray-700">{style}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Request Quote Button */}
              <div className="mt-4 pt-4 border-t lg:block">
                <button
                  onClick={() => handleQuoteRequest()}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 lg:py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Request Custom Quote
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Results Header */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredSheds.length} of {sheds.length} sheds
              </p>
              {Object.values(filters).some(f => f) && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Results */}
            {filteredSheds.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    No sheds match your current filters
                  </h3>
                  <p className="text-gray-600 mb-6">
                    But don't worry! We can build a custom shed to meet your exact specifications.
                  </p>
                  <button
                    onClick={() => handleQuoteRequest()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Request Custom Quote
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="hidden lg:flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    Showing {filteredSheds.length} of {sheds.length} sheds
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                  {filteredSheds.map((shed) => (
                    <div key={shed.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="relative">
                        <img
                          src={shed.images[0] ? getImageUrl('images', shed.images[0]) : 'https://images.pexels.com/photos/1396123/pexels-photo-1396123.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={shed.title}
                          className="w-full h-48 object-contain bg-gray-100 cursor-pointer"
                          onClick={() => handleShedDetails(shed)}
                        />
                        {shed.is_featured && (
                          <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 text-xs font-semibold rounded">
                            Featured
                          </span>
                        )}
                        {shed.images.length > 1 && (
                          <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
                            +{shed.images.length - 1} more
                          </span>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{shed.title}</h3>
                        
                        {/* Specs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3 mb-4 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700">Material:</span>
                            <span className="text-gray-600 ml-1">{shed.material_type}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700">Size:</span>
                            <span className="text-gray-600 ml-1">{shed.size}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700">Color:</span>
                            <div className="flex items-center ml-1">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300 mr-1"
                                style={{ backgroundColor: colorSwatches[shed.color as keyof typeof colorSwatches] || '#9CA3AF' }}
                              />
                              <span className="text-gray-600">{shed.color}</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700">Style:</span>
                            <span className="text-gray-600 ml-1">{shed.shed_style}</span>
                          </div>
                        </div>

                        {/* Standard Features */}
                        {shed.specifications?.standard_features && (
                          <div className="mb-4 hidden sm:block">
                            <h4 className="font-medium text-gray-700 mb-2">Standard Features:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {shed.specifications.standard_features.slice(0, 3).map((feature: string, index: number) => (
                                <li key={index} className="flex items-center">
                                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                                  {feature}
                                </li>
                              ))}
                              {shed.specifications.standard_features.length > 3 && (
                                <li className="text-blue-600 cursor-pointer" onClick={() => handleShedDetails(shed)}>
                                  +{shed.specifications.standard_features.length - 3} more features
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Mobile Features Summary */}
                        {shed.specifications?.standard_features && (
                          <div className="mb-4 sm:hidden">
                            <p className="text-sm text-gray-600">
                              {shed.specifications.standard_features.length} standard features
                              <button
                                onClick={() => handleShedDetails(shed)}
                                className="text-blue-600 ml-1"
                              >
                                View all
                              </button>
                            </p>
                          </div>
                        )}

                        {shed.price && (
                          <div className="text-2xl font-bold text-blue-600 mb-4">
                            ${shed.price.toLocaleString()}
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => handleShedDetails(shed)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 sm:py-2 px-4 rounded-lg font-medium transition-colors text-center"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleQuoteRequest(shed)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-2 px-4 rounded-lg font-semibold transition-colors text-center"
                          >
                            Get Quote
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quote Request Modal */}
        <Modal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          title="Request a Quote"
          size="lg"
        >
          <QuoteRequestForm
            selectedShed={selectedShed}
            preselectedFilters={filters}
            onSubmit={() => {
              setShowQuoteModal(false);
              setSelectedShed(null);
            }}
          />
        </Modal>

        {/* Shed Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          size="xl"
        >
          {selectedShed && (
            <div>
              {/* Header */}
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 pr-8">{selectedShed.title}</h2>
              </div>

              {/* Mobile Shed Info */}
              <div className="block sm:hidden mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Material:</span> {selectedShed.material_type}</div>
                  <div><span className="font-medium">Size:</span> {selectedShed.size}</div>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">Color:</span>
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-300 mr-1"
                      style={{ backgroundColor: colorSwatches[selectedShed.color as keyof typeof colorSwatches] || '#9CA3AF' }}
                    />
                    <span>{selectedShed.color}</span>
                  </div>
                  <div><span className="font-medium">Style:</span> {selectedShed.shed_style}</div>
                </div>
                {selectedShed.price && (
                  <div className="mt-2 text-lg font-bold text-blue-600">
                    ${selectedShed.price.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Photo Gallery */}
              <div className="mb-6 sm:mb-8">
                {/* Main Image */}
                <div className="relative mb-3 sm:mb-4">
                  <img
                    src={selectedShed.images[currentImageIndex] ? getImageUrl('images', selectedShed.images[currentImageIndex]) : 'https://images.pexels.com/photos/1396123/pexels-photo-1396123.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={`${selectedShed.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-64 sm:h-96 object-contain bg-gray-100 rounded-lg shadow-lg"
                  />
                  
                  {/* Navigation Arrows */}
                  {selectedShed.images.length > 1 && (
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
                  {selectedShed.images.length > 1 && (
                    <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                      {currentImageIndex + 1} / {selectedShed.images.length}
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {selectedShed.is_featured && (
                    <span className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-orange-500 text-white px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-semibold rounded-full shadow-lg">
                      Featured Shed
                    </span>
                  )}
                </div>
                
                {/* Thumbnail Gallery - Hidden on mobile */}
                {selectedShed.images.length > 1 && (
                  <div className="hidden sm:grid grid-cols-6 gap-2">
                    {selectedShed.images.map((image, index) => (
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

              {/* Detailed Specs and Features */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                {/* Specifications */}
                <div className="hidden sm:block">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Material:</span>
                      <span className="text-gray-900">{selectedShed.material_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Size:</span>
                      <span className="text-gray-900">{selectedShed.size}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Color:</span>
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                          style={{ backgroundColor: colorSwatches[selectedShed.color as keyof typeof colorSwatches] || '#9CA3AF' }}
                        />
                        <span className="text-gray-900">{selectedShed.color}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Style:</span>
                      <span className="text-gray-900">{selectedShed.shed_style}</span>
                    </div>
                    {selectedShed.price && (
                      <div className="flex justify-between border-t pt-3">
                        <span className="font-medium text-gray-700">Starting Price:</span>
                        <span className="text-2xl font-bold text-blue-600">${selectedShed.price.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Standard Features */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Standard Features</h3>
                  {selectedShed.specifications?.standard_features ? (
                    <ul className="space-y-1 sm:space-y-2">
                      {selectedShed.specifications.standard_features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center text-gray-700 text-sm sm:text-base">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic text-sm sm:text-base">Standard features will be detailed in your custom quote.</p>
                  )}
                </div>
              </div>

              {/* Optional Upgrades */}
              {selectedShed.specifications?.optional_upgrades && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Optional Upgrades</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {selectedShed.specifications.optional_upgrades.map((upgrade: string, index: number) => (
                      <div key={index} className="flex items-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        <span className="text-gray-700 text-sm sm:text-base">{upgrade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedShed.description && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">About This Shed</h3>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{selectedShed.description}</p>
                  </div>
                </div>
              )}
              
              {/* Contact Request Bar */}
              <div className="border-t border-gray-200 pt-4 sm:pt-6 bg-gradient-to-r from-blue-50 to-orange-50 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 px-4 sm:px-6 pb-4 sm:pb-6 rounded-b-lg">
                <div className="text-center">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    Ready to Build Your {selectedShed.title}?
                  </h4>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Get a personalized quote with your preferred options and upgrades
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleQuoteRequest(selectedShed);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center text-sm sm:text-base"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Get Custom Quote
                    </button>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center text-sm sm:text-base"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Continue Browsing
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-3">
                    📞 Call us directly for fastest response and expert consultation
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default CustomSheds;