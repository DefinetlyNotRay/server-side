import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface PublicForm {
  id: number;
  name: string;
  slug: string;
  description: string;
  creator: {
    id: number;
    name: string;
  };
  questionCount: number;
  created_at: string;
}

const PublicForms = () => {
  const [forms, setForms] = useState<PublicForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPublicForms = async () => {
      try {
        const response = await api.get('/api/v1/forms/public');
        setForms(response.data.forms);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching public forms:', err);
        setError('Failed to load public forms. Please try again later.');
        setLoading(false);
      }
    };

    fetchPublicForms();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading public forms...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Public Forms</h1>
        <p className="text-gray-600">No public forms available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Public Forms</h1>
      <p className="mb-6 text-gray-600">Browse and answer forms created by other users</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div key={form.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{form.name}</h2>
              {form.description && (
                <p className="text-gray-600 mb-4">{form.description}</p>
              )}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span className="mr-4">By: {form.creator?.name || 'Unknown'}</span>
                <span>{form.questionCount} questions</span>
              </div>
              <Link
                to={`/forms/${form.slug}/submit`}
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
              >
                Answer Form
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicForms;