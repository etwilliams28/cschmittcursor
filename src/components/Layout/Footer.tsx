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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content - More Condensed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Company Info & Social Media Combined */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-3">
              {businessSettings?.business_name || 'C. Schmitt Custom Build and Renovation'}
            </h3>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              Quality craftsmanship and professional construction services in Ontario. 
              Specializing in custom sheds, garages, home additions, and exterior renovations.
            </p>
            
            {/* Social Media Links - Inline with company info */}
            <div className="flex items-center space-x-4">
              {businessSettings?.facebook_url && (
                <a 
                  href={businessSettings.facebook_url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-blue-500 transition-colors group"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Facebook</span>
                </a>
              )}
              {businessSettings?.instagram_url && (
                <a 
                  href={businessSettings.instagram_url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-pink-500 transition-colors group"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Instagram</span>
                </a>
              )}
              {!businessSettings?.facebook_url && !businessSettings?.instagram_url && (
                <p className="text-gray-400 text-sm">Social media links coming soon!</p>
              )}
            </div>
          </div>

          {/* Quick Links & Contact Combined */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-1">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/sheds" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Custom Sheds
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="#contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info - More Compact */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Contact</h4>
              <div className="space-y-2">
                {businessSettings?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3 text-orange-500" />
                    <span className="text-gray-300 text-sm">{businessSettings.phone}</span>
                  </div>
                )}
                {businessSettings?.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3 w-3 text-orange-500" />
                    <span className="text-gray-300 text-sm">{businessSettings.email}</span>
                  </div>
                )}
                {businessSettings?.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-3 w-3 text-orange-500 mt-0.5" />
                    <span className="text-gray-300 text-sm">{businessSettings.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Business Hours - Compact Single Line */}
        {businessSettings?.hours && (
          <div className="border-t border-gray-800 pt-4 mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-white">Business Hours</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-300">
              {formatDetailedHours(businessSettings.hours).map((hour, index) => (
                <span key={index} className="whitespace-nowrap">{hour}</span>
              ))}
            </div>
          </div>
        )}

        {/* Copyright & Admin - Compact */}
        <div className="border-t border-gray-800 pt-4 text-center text-gray-400">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
            <p>&copy; 2024 C. Schmitt Custom Build and Renovation. All rights reserved.</p>
            <Link
              to="/admin"
              className="text-gray-500 hover:text-gray-300 transition-colors mt-1 sm:mt-0"
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