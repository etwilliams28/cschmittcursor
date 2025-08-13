import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Upload, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase, uploadImage, getImageUrl } from '../../lib/supabase';
import { PastProject } from '../../types/database';
import Modal from '../UI/Modal';
import LoadingSpinner from '../UI/LoadingSpinner';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  project_type: z.string().min(1, 'Project type is required'),
  location: z.string().optional(),
  completion_date: z.string().optional(),
  is_featured: z.boolean().default(false),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const ProjectsManager: React.FC = () => {
  const [projects, setProjects] = useState<PastProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PastProject | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema)
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('past_projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProjects(data);
    setLoading(false);
  };

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    console.log('Starting image upload process...');
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      try {
        console.log(`Processing file: ${file.name}`);
        const fileName = `projects/${Date.now()}-${file.name}`;
        const imagePath = await uploadImage('images', fileName, file);
        console.log(`Successfully uploaded: ${imagePath}`);
        newImages.push(imagePath);
      } catch (error) {
        console.error('Error uploading image:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Show a more user-friendly alert for bucket creation issues
        if (errorMessage.includes('does not exist')) {
          alert(`Storage Setup Required:\n\n${errorMessage}\n\nThis is a one-time setup step.`);
        } else {
          alert(`Failed to upload ${file.name}: ${errorMessage}`);
        }
      }
    }

    console.log(`Upload complete. ${newImages.length} images uploaded successfully.`);
    setUploadedImages(prev => [...prev, ...newImages]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const projectData = {
        ...data,
        images: uploadedImages,
        completion_date: data.completion_date || null,
      };

      if (selectedProject) {
        const { error } = await supabase
          .from('past_projects')
          .update(projectData)
          .eq('id', selectedProject.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('past_projects')
          .insert([projectData]);

        if (error) throw error;
      }

      await fetchProjects();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const deleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const { error } = await supabase
        .from('past_projects')
        .delete()
        .eq('id', id);

      if (!error) {
        setProjects(projects.filter(p => p.id !== id));
      }
    }
  };

  const handleEditProject = (project: PastProject) => {
    setSelectedProject(project);
    setUploadedImages(project.images || []);
    setValue('title', project.title);
    setValue('description', project.description || '');
    setValue('project_type', project.project_type);
    setValue('location', project.location || '');
    setValue('completion_date', project.completion_date ? project.completion_date.split('T')[0] : '');
    setValue('is_featured', project.is_featured || false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject(null);
    setUploadedImages([]);
    reset();
  };

  const projectTypes = [
    'Custom Shed',
    'Garage Addition',
    'Home Addition',
    'Exterior Renovation',
    'Roofing',
    'Siding',
    'Other'
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Past Projects</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-lg">
            <div className="relative min-h-[150px]">
              <img
                src={project.images?.[0] ? getImageUrl('images', project.images[0]) : 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400'}
                alt={project.title}
                className="w-full h-auto max-h-[200px] object-contain bg-gray-100"
              />
              {project.is_featured && (
                <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 text-xs font-semibold rounded">
                  Featured
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{project.project_type}</p>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {project.completion_date ? new Date(project.completion_date).toLocaleDateString() : 'No date'}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditProject(project)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
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

      {/* Add/Edit Project Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedProject ? 'Edit Project' : 'Add New Project'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Type *
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
              {errors.project_type && (
                <p className="mt-1 text-sm text-red-600">{errors.project_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                {...register('location')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Project location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Date
              </label>
              <input
                type="date"
                {...register('completion_date')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
              placeholder="Project description..."
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('is_featured')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Featured Project</span>
            </label>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
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
                selectedProject ? 'Update Project' : 'Add Project'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsManager;