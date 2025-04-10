import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import api from '../services/api'; // Use the API service instead of axios

const CreateFormSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  slug: Yup.string()
    .required('Slug is required')
    .matches(/^[a-zA-Z0-9.-]+$/, 'Slug can only contain alphanumeric characters, dashes, and dots')
    .test('no-spaces', 'Slug cannot contain spaces', value => !value || !value.includes(' ')),
  description: Yup.string(),
  allowed_domains: Yup.array().of(Yup.string()),
  limit_one_response: Yup.boolean()
});

const CreateForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: any, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      const response = await api.post('/api/v1/forms', values);
      navigate(`/forms/${response.data.form.slug}`);
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError('Invalid form data. Please check your inputs.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Form</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <Formik
        initialValues={{
          name: '',
          slug: '',
          description: '',
          allowed_domains: [''],
          limit_one_response: false
        }}
        validationSchema={CreateFormSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                Form Name *
              </label>
              <Field
                type="text"
                name="name"
                id="name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter form name"
              />
              <ErrorMessage name="name" component="p" className="text-red-500 text-xs italic mt-1" />
            </div>

            <div className="mb-4">
              <label htmlFor="slug" className="block text-gray-700 text-sm font-bold mb-2">
                Slug *
              </label>
              <Field
                type="text"
                name="slug"
                id="slug"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="form-slug"
              />
              <ErrorMessage name="slug" component="p" className="text-red-500 text-xs italic mt-1" />
              <p className="text-gray-500 text-xs mt-1">
                The slug will be used in the form URL: /forms/your-slug
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <Field
                as="textarea"
                name="description"
                id="description"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter form description"
                rows={3}
              />
              <ErrorMessage name="description" component="p" className="text-red-500 text-xs italic mt-1" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Allowed Domains
              </label>
              <FieldArray name="allowed_domains">
                {({ remove, push }) => (
                  <div>
                    {values.allowed_domains.length > 0 &&
                      values.allowed_domains.map((domain, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <Field
                            name={`allowed_domains.${index}`}
                            placeholder="example.com"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                          />
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    <button
                      type="button"
                      onClick={() => push('')}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                      Add Domain
                    </button>
                    <p className="text-gray-500 text-xs mt-1">
                      Leave empty to allow all domains. Add domains to restrict form access.
                    </p>
                  </div>
                )}
              </FieldArray>
            </div>

            <div className="mb-6">
              <div className="flex items-center">
                <Field
                  type="checkbox"
                  name="limit_one_response"
                  id="limit_one_response"
                  className="mr-2"
                />
                <label htmlFor="limit_one_response" className="text-gray-700 text-sm font-bold">
                  Limit to one response per user
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-indigo-300"
              >
                {isSubmitting ? 'Creating...' : 'Create Form'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateForm;