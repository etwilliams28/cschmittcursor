import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BusinessSettings } from '../../types/database';
import { scrollToContact } from '../../utils/scrollUtils';
import { formatBusinessHours } from '../../utils/formatHours';
import Logo from '../UI/Logo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchBusinessSettings = async () => {
      const { data } = await supabase
        .from('business_settings')
        .select('*')
        .single();
      
      if (data) setBusinessSettings(data);
    };

    fetchBusinessSettings();
    
    // Mobile debugging
    console.log('User Agent:', navigator.userAgent);
    console.log('Viewport Width:', window.innerWidth);
    console.log('Is Mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Custom Sheds', href: '/sheds' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="bg-white shadow-lg">
      {/* Top bar with contact info */}
      <div className="bg-blue-900 text-white py-2 sm:py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop layout - horizontal */}
          <div className="hidden md:flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              {businessSettings?.phone && (
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{businessSettings.phone}</span>
                </div>
              )}
              {businessSettings?.email && (
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{businessSettings.email}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatBusinessHours(businessSettings?.hours)}</span>
            </div>
          </div>
          
          {/* Mobile layout - vertical stack */}
          <div className="md:hidden space-y-1">
            <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm">
              {businessSettings?.phone && (
                <div className="flex items-center space-x-1">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">{businessSettings.phone}</span>
                </div>
              )}
              {businessSettings?.email && (
                <div className="flex items-center space-x-1">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">{businessSettings.email}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center space-x-1 text-xs sm:text-sm">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-center">{formatBusinessHours(businessSettings?.hours)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Logo className="text-gray-700" />
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.name === 'Contact' ? (
                  <button
                    onClick={scrollToContact}
                    className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                      location.pathname === '/' ? 'text-blue-600 border-b-2 border-blue-600' : ''
                    }`}
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors ${
                      location.pathname === item.href ? 'text-blue-600 border-b-2 border-blue-600' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={scrollToContact}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Get Free Quote
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.name === 'Contact' ? (
                    <button
                      onClick={(e) => {
                        setIsMenuOpen(false);
                        scrollToContact(e);
                      }}
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium cursor-pointer text-left w-full"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              <button
                onClick={(e) => {
                  setIsMenuOpen(false);
                  scrollToContact(e);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium text-center mt-4 transition-colors"
              >
                Get Free Quote
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;