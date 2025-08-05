import React, { useState, useEffect } from 'react';
import { Save, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { BusinessSettings } from '../../types/database';
import LoadingSpinner from '../UI/LoadingSpinner';

const businessSettingsSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  address: z.string().optional(),
  hours: z.record(z.string()).optional(),
});

type BusinessSettingsFormData = z.infer<typeof businessSettingsSchema>;

const BusinessSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState({
    monday: '7:00 AM - 6:00 PM',
    tuesday: '7:00 AM - 6:00 PM',
    wednesday: '7:00 AM - 6:00 PM',
    thursday: '7:00 AM - 6:00 PM',
    friday: '7:00 AM - 6:00 PM',
    saturday: '8:00 AM - 4:00 PM',
    sunday: 'Closed',
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<BusinessSettingsFormData>({
    resolver: zodResolver(businessSettingsSchema)
  });

  useEffect(() => {
    fetchBusinessSettings();
  }, []);

  const fetchBusinessSettings = async () => {
    const { data } = await supabase
      .from('business_settings')
      .select('*')
      .single();
    
    if (data) {
      setSettings(data);
      setValue('business_name', data.business_name);
      setValue('phone', data.phone || '');
      setValue('email', data.email || '');
      setValue('address', data.address || '');
      
      if (data.hours && typeof data.hours === 'object') {
        setHours({ ...hours, ...data.hours });
      }
    }
    setLoading(false);
  };

  const onSubmit = async (data: BusinessSettingsFormData) => {
    try {
      const settingsData = {
        ...data,
        hours,
      };

      if (settings) {
        const { error } = await supabase
          .from('business_settings')
          .update(settingsData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_settings')
          .insert([settingsData]);

        if (error) throw error;
      }

      await fetchBusinessSettings();
      
      // Show success message
      alert('Business settings updated successfully!');
    } catch (error) {
      console.error('Error saving business settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  const updateHours = (day: string, value: string) => {
    setHours(prev => ({ ...prev, [day]: value }));
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
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
      <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    Business Name *
                  </span>
                </label>
                <input
                  type="text"
                  {...register('business_name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="C. Schmitt Custom Build and Renovation"
                />
                {errors.business_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.business_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Phone Number
                  </span>
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(123) 456-7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Email Address
                  </span>
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="info@cschmittconstruction.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Business Address
                  </span>
                </label>
                <input
                  type="text"
                  {...register('address')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main St, City, Province"
                />
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Business Hours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="flex items-center space-x-4">
                  <label className="w-20 text-sm font-medium text-gray-700">
                    {day.label}:
                  </label>
                  <input
                    type="text"
                    value={hours[day.key as keyof typeof hours]}
                    onChange={(e) => updateHours(day.key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="9:00 AM - 5:00 PM or Closed"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>

        {/* Information Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Where This Information Appears
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Business name appears in the header and footer</li>
            <li>• Contact information is displayed in the header and contact section</li>
            <li>• Business hours are shown in the header and footer</li>
            <li>• Address appears in the footer and contact forms</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettingsManager;