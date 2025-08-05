import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase, uploadImage, getImageUrl } from '../../lib/supabase';
import { ShedListing } from '../../types/database';
import Modal from '../UI/Modal';
import LoadingSpinner from '../UI/LoadingSpinner';

const shedSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  material_type: z.string().min(1, 'Material type is required'),
  color: z.string().min(1, 'Color is required'),
  size: z.string().min(1, 'Size is required'),
  shed_style: z.string().min(1, 'Shed style is required'),
  price: z.number().min(0, 'Price must be positive').optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type ShedFormData = z.infer<typeof shedSchema>;

const ShedsManager: React.FC = () => {
  const [sheds, setSheds] = useState<ShedListing[]>([]);
  const [selectedShed, setSelectedShed] = useState<ShedListing | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [standardFeatures, setStandardFeatures] = useState<string[]>([]);
  const [optionalUpgrades, setOptionalUpgrades] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [newUpgrade, setNewUpgrade] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ShedFormData>({
    resolver: zodResolver(shedSchema)
  });

  useEffect(() => {
    fetchSheds();
  }, []);

  const fetchSheds = async () => {
    const { data } = await supabase
      .from('shed_listings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setSheds(data);
    setLoading(false);
  };

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    console.log('Starting shed image upload...');
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      try {
        console.log(`Processing shed image: ${file.name}`);
        const fileName = `sheds/${Date.now()}-${file.name}`;
        const imagePath = await uploadImage('images', fileName, file);
        console.log(`Shed image uploaded successfully: ${imagePath}`);
        newImages.push(imagePath);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`Shed upload complete. ${newImages.length} images uploaded successfully.`);
    setUploadedImages(prev => [...prev, ...newImages]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ShedFormData) => {
    try {
      const shedData = {
        ...data,
        images: uploadedImages,
        price: data.price || null,
        specifications: {
          standard_features: standardFeatures,
          optional_upgrades: optionalUpgrades,
        },
      };

      if (selectedShed) {
        const { error } = await supabase
          .from('shed_listings')
          .update(shedData)
          .eq('id', selectedShed.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shed_listings')
          .insert([shedData]);

        if (error) throw error;
      }

      await fetchSheds();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving shed:', error);
    }
  };

  const deleteShed = async (id: string) => {
    if (confirm('Are you sure you want to delete this shed listing?')) {
      const { error } = await supabase
        .from('shed_listings')
        .delete()
        .eq('id', id);

      if (!error) {
        setSheds(sheds.filter(s => s.id !== id));
      }
    }
  };

  const toggleShedStatus = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('shed_listings')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (!error) {
      setSheds(sheds.map(shed => 
        shed.id === id ? { ...shed, is_active: !isActive } : shed
      ));
    }
  };

  const handleEditShed = (shed: ShedListing) => {
    setSelectedShed(shed);
    setUploadedImages(shed.images || []);
    setStandardFeatures(shed.specifications?.standard_features || []);
    setOptionalUpgrades(shed.specifications?.optional_upgrades || []);
    setValue('title', shed.title);
    setValue('description', shed.description || '');
    setValue('material_type', shed.material_type);
    setValue('color', shed.color);
    setValue('size', shed.size);
    setValue('shed_style', shed.shed_style);
    setValue('price', shed.price || undefined);
    setValue('is_featured', shed.is_featured || false);
    setValue('is_active', shed.is_active || true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedShed(null);
    setUploadedImages([]);
    setStandardFeatures([]);
    setOptionalUpgrades([]);
    setNewFeature('');
    setNewUpgrade('');
    reset();
  };

  const addStandardFeature = () => {
    if (newFeature.trim()) {
      setStandardFeatures(prev => [...prev, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeStandardFeature = (index: number) => {
    setStandardFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const addOptionalUpgrade = () => {
    if (newUpgrade.trim()) {
      setOptionalUpgrades(prev => [...prev, newUpgrade.trim()]);
      setNewUpgrade('');
    }
  };

  const removeOptionalUpgrade = (index: number) => {
    setOptionalUpgrades(prev => prev.filter((_, i) => i !== index));
  };

  const materialTypes = ['Wood', 'Metal', 'Vinyl', 'Composite'];
  const colors = ['Natural', 'White', 'Brown', 'Gray', 'Green', 'Blue', 'Red', 'Black', 'Charcoal', 'Navy Blue'];
  const sizes = ['8x8', '8x10', '8x12', '10x10', '10x12', '10x16', '12x12', '12x16', '12x20'];
  const shedStyles = ['A-Frame', 'Dutch Barn', 'Dormer', 'Porch', 'Modern Farmhouse', 'Gable', 'Gambrel'];

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
        <h1 className="text-2xl font-bold text-gray-900">Shed Listings</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Shed
        </button>
      </div>

      {/* Sheds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sheds.map((shed) => (
          <div key={shed.id} className={`bg-white rounded-lg shadow-lg overflow-hidden ${!shed.is_active ? 'opacity-60' : ''}`}>
            <div className="relative">
              <img
                src={shed.images?.[0] ? getImageUrl('images', shed.images[0]) : 'https://images.pexels.com/photos/1396123/pexels-photo-1396123.jpeg?auto=compress&cs=tinysrgb&w=400'}
                alt={shed.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 left-2 flex space-x-1">
                {shed.is_featured && (
                  <span className="bg-orange-500 text-white px-2 py-1 text-xs font-semibold rounded">
                    Featured
                  </span>
                )}
                {!shed.is_active && (
                  <span className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                    Inactive
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{shed.title}</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div>Material: {shed.material_type}</div>
                <div>Color: {shed.color}</div>
                <div>Size: {shed.size}</div>
                <div>Style: {shed.shed_style}</div>
              </div>
              {shed.price && (
                <div className="text-lg font-bold text-blue-600 mb-3">
                  ${shed.price.toLocaleString()}
                </div>
              )}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => toggleShedStatus(shed.id, shed.is_active)}
                  className={`text-xs px-2 py-1 rounded ${
                    shed.is_active 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {shed.is_active ? 'Active' : 'Inactive'}
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditShed(shed)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteShed(shed.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Shed Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedShed ? 'Edit Shed Listing' : 'Add New Shed Listing'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shed Title *
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter shed title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Type *
              </label>
              <select
                {...register('material_type')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select material</option>
                {materialTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.material_type && (
                <p className="mt-1 text-sm text-red-600">{errors.material_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color *
              </label>
              <select
                {...register('color')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select color</option>
                {colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
              {errors.color && (
                <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size *
              </label>
              <select
                {...register('size')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select size</option>
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors.size && (
                <p className="mt-1 text-sm text-red-600">{errors.size.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shed Style *
              </label>
              <select
                {...register('shed_style')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select style</option>
                {shedStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
              {errors.shed_style && (
                <p className="mt-1 text-sm text-red-600">{errors.shed_style.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Shed description..."
            />
          </div>

          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('is_featured')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Featured Shed</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('is_active')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active Listing</span>
            </label>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shed Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                id="shed-image-upload"
              />
              <label
                htmlFor="shed-image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload images</span>
              </label>
            </div>

            {/* Image Preview */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={getImageUrl('images', image)}
                      alt=""
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploading && (
              <div className="flex items-center justify-center mt-4">
                <LoadingSpinner size="sm" className="mr-2" />
                <span className="text-sm text-gray-600">Uploading images...</span>
              </div>
            )}
          </div>

          {/* Standard Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Standard Features
            </label>
            <div className="space-y-2">
              {standardFeatures.map((feature, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeStandardFeature(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add standard feature"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStandardFeature())}
                />
                <button
                  type="button"
                  onClick={addStandardFeature}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Optional Upgrades */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Optional Upgrades
            </label>
            <div className="space-y-2">
              {optionalUpgrades.map((upgrade, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{upgrade}</span>
                  <button
                    type="button"
                    onClick={() => removeOptionalUpgrade(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newUpgrade}
                  onChange={(e) => setNewUpgrade(e.target.value)}
                  placeholder="Add optional upgrade"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOptionalUpgrade())}
                />
                <button
                  type="button"
                  onClick={addOptionalUpgrade}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
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
              disabled={isSubmitting || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                selectedShed ? 'Update Shed' : 'Add Shed'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShedsManager;