import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BusinessSettings } from '../../types/database';
import { formatDetailedHours } from '../../utils/formatHours';

const Footer: React.FC = () => {
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    const fetchBusinessSettings = async () => {
      const { data } = await supabase
        .from('business_settings')
        .select('*')
        .single();
      
      if (data) setBusinessSettings(data);
    };

    fetchBusinessSettings();
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-4">
              {businessSettings?.business_name || 'C. Schmitt Custom Build and Renovation'}
            </h3>
            <p className="text-gray-300 mb-4">
              Quality craftsmanship and professional construction services in Ontario. 
              Specializing in custom sheds, garages, home additions, and exterior renovations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/sheds" className="text-gray-300 hover:text-white transition-colors">
                  Custom Sheds
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="#contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              {businessSettings?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-300">{businessSettings.phone}</span>
                </div>
              )}
              {businessSettings?.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-300">{businessSettings.email}</span>
                </div>
              )}
              {businessSettings?.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-300">{businessSettings.address}</span>
                </div>
              )}
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-orange-500 mt-0.5" />
                <div className="text-gray-300 text-sm">
                  {formatDetailedHours(businessSettings?.hours).map((hour, index) => (
                    <div key={index}>{hour}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p>&copy; 2024 C. Schmitt Custom Build and Renovation. All rights reserved.</p>
            <Link
              to="/admin"
              className="text-gray-500 hover:text-gray-300 text-xs mt-2 sm:mt-0 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;