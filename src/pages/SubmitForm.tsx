import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../services/api'; // Use the API service instead of axios
import { useAuth } from '../contexts/AuthContext';

interface Question {
  id: number;
  form_id: number;
  name: string;
  choice_type: string;
  choices: string | null;
  is_required: number;
}

interface Form {
  id: number;
  name: string;
  slug: string;
  description: string;
  limit_one_response: number;
  creator_id: number;
  allowed_domains: string[];
  questions: Question[];
}

const SubmitForm = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    const fetchFormDetails = async () => {
      try {
        // Try to fetch the form as a public form first
        const response = await api.get(`/api/v1/forms/${slug}/public`);
        setForm(response.data.form);
        setLoading(false);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Form not found');
        } else {
          // If public access fails, try authenticated access
          try {
            const authResponse = await api.get(`/api/v1/forms/${slug}`);
            setForm(authResponse.data.form);
            setLoading(false);
          } catch (authErr: any) {
            if (authErr.response?.status === 401) {
              setRequiresLogin(true);
              setError('You need to log in to access this form');
            } else if (authErr.response?.status === 404) {
              setError('Form not found');
            } else if (authErr.response?.status === 403) {
              setError('You do not have permission to access this form');
            } else {
              setError('An error occurred. Please try again later');
            }
            setLoading(false);
          }
        }
      }
    };

    fetchFormDetails();
  }, [slug, user]);

  const generateValidationSchema = (questions: Question[]) => {
    const schema: Record<string, any> = {};
    
    questions.forEach(question => {
      if (question.is_required) {
        schema[`question_${question.id}`] = Yup.string().required(`This question is required`);
      }
    });
    
    return Yup.object().shape(schema);
  };

  const handleSubmit = async (values: any, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      setError(null);
      
      // Format the answers for submission
      const formattedAnswers = Object.keys(values)
        .filter(key => key.startsWith('question_'))
        .map(key => {
          const questionId = parseInt(key.replace('question_', ''));
          return {
            question_id: questionId,
            value: values[key]
          };
        });
      
      // Submit the form response
      const response = await api.post(`/api/v1/forms/${slug}/submit`, {
        answers: formattedAnswers
      });
      
      setSubmitSuccess(true);
      setSubmitting(false);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      if (err.response?.status === 401) {
        setError('You need to log in to submit this form');
      } else {
        setError('An error occurred while submitting your response. Please try again.');
      }
      setSubmitting(false);
    }
  };

  // Render logic
  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
        <div className="mt-4">
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Add the login required check here, before the submitSuccess check
  if (requiresLogin) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Login Required</h1>
        <p className="mb-4">You need to log in to access this form.</p>
        <button 
          onClick={() => navigate('/login', { state: { from: `/forms/${slug}/submit` } })}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Log In
        </button>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">Your response has been submitted successfully!</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!form) {
    return <div className="text-center py-10">Form not found</div>;
  }

  // Main form rendering
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-2">{form.name}</h1>
      {form.description && <p className="text-gray-600 mb-6">{form.description}</p>}

      <Formik
        initialValues={form.questions.reduce((acc, question) => {
          acc[`question_${question.id}`] = '';
          return acc;
        }, {} as Record<string, string>)}
        validationSchema={generateValidationSchema(form.questions)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {form.questions.map((question) => (
              <div key={question.id} className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`question_${question.id}`}>
                  {question.name} {question.is_required ? <span className="text-red-500">*</span> : null}
                </label>
                
                {renderQuestionInput(question)}
                
                <ErrorMessage
                  name={`question_${question.id}`}
                  component="p"
                  className="text-red-500 text-xs italic mt-1"
                />
              </div>
            ))}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

// Don't forget to include the renderQuestionInput function if it's not already defined
const renderQuestionInput = (question: Question) => {
  switch (question.choice_type) {
    case 'paragraph':
      return (
        <Field
          as="textarea"
          id={`question_${question.id}`}
          name={`question_${question.id}`}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows={4}
        />
      );
    case 'multiple choice':
    case 'dropdown':
    case 'checkboxes':
      const choices = question.choices ? JSON.parse(question.choices) : [];
      if (question.choice_type === 'dropdown') {
        return (
          <Field
            as="select"
            id={`question_${question.id}`}
            name={`question_${question.id}`}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select an option</option>
            {choices.map((choice: string, index: number) => (
              <option key={index} value={choice}>
                {choice}
              </option>
            ))}
          </Field>
        );
      } else {
        return (
          <div className="mt-2">
            {choices.map((choice: string, index: number) => (
              <div key={index} className="flex items-center mb-2">
                <Field
                  type={question.choice_type === 'multiple choice' ? 'radio' : 'checkbox'}
                  id={`question_${question.id}_${index}`}
                  name={`question_${question.id}`}
                  value={choice}
                  className="mr-2"
                />
                <label htmlFor={`question_${question.id}_${index}`}>{choice}</label>
              </div>
            ))}
          </div>
        );
      }
    default:
      return (
        <Field
          type="text"
          id={`question_${question.id}`}
          name={`question_${question.id}`}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      );
  }
};

export default SubmitForm;