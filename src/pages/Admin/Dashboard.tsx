import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  MessageSquare, 
  Building2,
  Calendar,
  TrendingUp,
  Mail,
  Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadSitemap } from '../../utils/sitemapGenerator';

interface DashboardStats {
  totalQuotes: number;
  totalContacts: number;
  totalProjects: number;
  totalReviews: number;
  recentQuotes: number;
  recentContacts: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotes: 0,
    totalContacts: 0,
    totalProjects: 0,
    totalReviews: 0,
    recentQuotes: 0,
    recentContacts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [
        quoteRequests,
        contactSubmissions,
        pastProjects,
        reviews
      ] = await Promise.all([
        supabase.from('quote_requests').select('created_at'),
        supabase.from('contact_submissions').select('created_at'),
        supabase.from('past_projects').select('id'),
        supabase.from('reviews').select('id')
      ]);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const recentQuotes = quoteRequests.data?.filter(
        quote => new Date(quote.created_at) > oneWeekAgo
      ).length || 0;

      const recentContacts = contactSubmissions.data?.filter(
        contact => new Date(contact.created_at) > oneWeekAgo
      ).length || 0;

      setStats({
        totalQuotes: quoteRequests.data?.length || 0,
        totalContacts: contactSubmissions.data?.length || 0,
        totalProjects: pastProjects.data?.length || 0,
        totalReviews: reviews.data?.length || 0,
        recentQuotes,
        recentContacts,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Quote Requests',
      value: stats.totalQuotes,
      icon: FileText,
      color: 'bg-blue-500',
      recent: stats.recentQuotes,
    },
    {
      title: 'Contact Submissions',
      value: stats.totalContacts,
      icon: Mail,
      color: 'bg-green-500',
      recent: stats.recentContacts,
    },
    {
      title: 'Past Projects',
      value: stats.totalProjects,
      icon: Building2,
      color: 'bg-purple-500',
      recent: 0,
    },
    {
      title: 'Customer Reviews',
      value: stats.totalReviews,
      icon: MessageSquare,
      color: 'bg-orange-500',
      recent: 0,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${card.color} rounded-lg p-3`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                {card.recent > 0 && (
                  <p className="text-sm text-green-600">+{card.recent} this week</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">View Quote Requests</span>
          </button>
          <button className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Mail className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Check Messages</span>
          </button>
          <button className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Building2 className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Add New Project</span>
          </button>
          <button className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="h-5 w-5 text-orange-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Manage Reviews</span>
          </button>
          <button 
            onClick={() => downloadSitemap(window.location.origin)}
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-5 w-5 text-indigo-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Generate Sitemap</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {stats.recentQuotes > 0 && (
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm text-blue-800">
                {stats.recentQuotes} new quote request{stats.recentQuotes > 1 ? 's' : ''} this week
              </span>
            </div>
          )}
          {stats.recentContacts > 0 && (
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-sm text-green-800">
                {stats.recentContacts} new contact{stats.recentContacts > 1 ? 's' : ''} this week
              </span>
            </div>
          )}
          {stats.recentQuotes === 0 && stats.recentContacts === 0 && (
            <p className="text-gray-500 text-sm">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;