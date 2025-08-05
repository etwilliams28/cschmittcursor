import React, { useState, useEffect } from 'react';
import { Eye, Download, Check, Clock, Mail, Phone, User, Calendar, DollarSign, MessageSquare, Image } from 'lucide-react';
import { supabase, getImageUrl } from '../../lib/supabase';
import { QuoteRequest } from '../../types/database';
import Modal from '../UI/Modal';
import LoadingSpinner from '../UI/LoadingSpinner';

const QuoteRequestsManager: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded'>('all');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    const { data } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setQuotes(data);
    setLoading(false);
  };

  const updateQuoteStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('quote_requests')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setQuotes(quotes.map(quote => 
        quote.id === id ? { ...quote, status } : quote
      ));
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Name', 'Email', 'Phone', 'Project Type', 'Material', 'Size', 'Budget', 'Status', 'Custom Message', 'Has Images'];
    const csvData = quotes.map(quote => [
      new Date(quote.created_at).toLocaleDateString(),
      quote.customer_name,
      quote.email,
      quote.phone || '',
      quote.project_type,
      quote.material_type || '',
      quote.size || '',
      quote.budget_range || '',
      quote.status,
      quote.custom_message || '',
      quote.inspiration_images?.length > 0 ? 'Yes' : 'No'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredQuotes = quotes.filter(quote => {
    if (filter === 'all') return true;
    return quote.status === filter;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All', count: quotes.length },
          { key: 'pending', label: 'Pending', count: quotes.filter(q => q.status === 'pending').length },
          { key: 'responded', label: 'Responded', count: quotes.filter(q => q.status === 'responded').length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{quote.customer_name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {quote.email}
                      </div>
                      {quote.phone && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {quote.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{quote.project_type}</div>
                    {quote.material_type && (
                      <div className="text-sm text-gray-500">{quote.material_type}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quote.size && <div>Size: {quote.size}</div>}
                    {quote.budget_range && <div>Budget: {quote.budget_range}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      quote.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : quote.status === 'responded'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedQuote(quote)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {quote.status === 'pending' && (
                      <button
                        onClick={() => updateQuoteStatus(quote.id, 'responded')}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Detail Modal */}
      <Modal
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
        title="Quote Request Details"
        size="lg"
      >
        {selectedQuote && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium">{selectedQuote.customer_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{selectedQuote.email}</span>
                    </div>
                    {selectedQuote.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{selectedQuote.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{new Date(selectedQuote.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Details</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Type:</span> {selectedQuote.project_type}</div>
                    {selectedQuote.material_type && (
                      <div><span className="font-medium">Material:</span> {selectedQuote.material_type}</div>
                    )}
                    {selectedQuote.color && (
                      <div><span className="font-medium">Color:</span> {selectedQuote.color}</div>
                    )}
                    {selectedQuote.size && (
                      <div><span className="font-medium">Size:</span> {selectedQuote.size}</div>
                    )}
                    {selectedQuote.shed_style && (
                      <div><span className="font-medium">Style:</span> {selectedQuote.shed_style}</div>
                    )}
                    {selectedQuote.budget_range && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span>{selectedQuote.budget_range}</span>
                      </div>
                    )}
                    {selectedQuote.timeline && (
                      <div><span className="font-medium">Timeline:</span> {selectedQuote.timeline}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {selectedQuote.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Description
                </h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedQuote.description}</p>
              </div>
            )}

            {selectedQuote.custom_message && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Message</h3>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{selectedQuote.custom_message}</p>
              </div>
            )}

            {selectedQuote.inspiration_images && selectedQuote.inspiration_images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Image className="h-5 w-5 mr-2" />
                  Inspiration Images ({selectedQuote.inspiration_images.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedQuote.inspiration_images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getImageUrl('images', image)}
                        alt={`Inspiration ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedQuote.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Notes</h3>
                <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg">{selectedQuote.notes}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex space-x-2">
                <button
                  onClick={() => updateQuoteStatus(selectedQuote.id, 'pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedQuote.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-800'
                  }`}
                >
                  <Clock className="h-4 w-4 mr-1 inline" />
                  Pending
                </button>
                <button
                  onClick={() => updateQuoteStatus(selectedQuote.id, 'responded')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedQuote.status === 'responded'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800'
                  }`}
                >
                  <Check className="h-4 w-4 mr-1 inline" />
                  Responded
                </button>
              </div>
              <a
                href={`mailto:${selectedQuote.email}?subject=Re: Your Quote Request&body=Hi ${selectedQuote.customer_name},%0D%0A%0D%0AThank you for your interest in our ${selectedQuote.project_type} services.`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuoteRequestsManager;