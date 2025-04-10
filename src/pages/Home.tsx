import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; // Use the API service instead of axios

interface Form {
  id: number;
  name: string;
  slug: string;
  description: string;
  limit_one_response: number;
  creator_id: number;
}

const Home = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await api.get('/api/v1/forms');
        setForms(response.data.forms);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching forms:', err);
        setError('Failed to load forms. Please try again later.');
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Forms</h1>
        <Link
          to="/forms/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You haven't created any forms yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{form.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{form.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {form.limit_one_response ? 'Limited to 1 response' : 'Multiple responses allowed'}
                  </span>
                  <Link
                    to={`/forms/${form.slug}`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;