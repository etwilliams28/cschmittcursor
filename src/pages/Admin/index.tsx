import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  FileText, 
  MessageSquare, 
  Settings,
  LogOut,
  Users,
  Image,
  Play,
  Mail,
  Quote
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AdminDashboard from './Dashboard';
import AdminLogin from './Login';
import QuoteRequestsManager from '../../components/Admin/QuoteRequestsManager';
import ContactsManager from '../../components/Admin/ContactsManager';
import ProjectsManager from '../../components/Admin/ProjectsManager';
import ShedsManager from '../../components/Admin/ShedsManager';
import ReviewsManager from '../../components/Admin/ReviewsManager';
import BlogManager from '../../components/Admin/BlogManager';
import HomeContentManager from '../../components/Admin/HomeContentManager';
import BusinessSettingsManager from '../../components/Admin/BusinessSettingsManager';

const AdminPanel: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Quote Requests', href: '/admin/quotes', icon: Quote },
    { name: 'Contact Messages', href: '/admin/contacts', icon: Mail },
    { name: 'Past Projects', href: '/admin/projects', icon: Building2 },
    { name: 'Shed Listings', href: '/admin/sheds', icon: Building2 },
    { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
    { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
    { name: 'Home Content', href: '/admin/home-content', icon: Image },
    { name: 'Video Carousel', href: '/admin/videos', icon: Play },
    { name: 'Business Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-600 mt-1">C. Schmitt Custom Build</p>
          </div>
          
          <nav className="mt-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 w-64 p-6">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="quotes" element={<QuoteRequestsManager />} />
            <Route path="contacts" element={<ContactsManager />} />
            <Route path="projects" element={<ProjectsManager />} />
            <Route path="sheds" element={<ShedsManager />} />
            <Route path="reviews" element={<ReviewsManager />} />
            <Route path="blog" element={<BlogManager />} />
            <Route path="home-content" element={<HomeContentManager />} />
            <Route path="videos" element={<HomeContentManager />} />
            <Route path="settings" element={<BusinessSettingsManager />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;