import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../services/api";

interface QuestionFormProps {
  formSlug: string | undefined;
  onQuestionAdded: (question: any) => void;
}

const QuestionSchema = Yup.object().shape({
  name: Yup.string().required("Question text is required"),
  choice_type: Yup.string().required("Question type is required"),
  is_required: Yup.boolean()
});

const QuestionForm: React.FC<QuestionFormProps> = ({
  formSlug,
  onQuestionAdded,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (
    values: any,
    { resetForm, setSubmitting }: any
  ) => {
    try {
      setError(null);
      setSuccess(null);

      // Add debugging to check the formSlug
      console.log('Form slug being used for question:', formSlug);

      // Format choices properly for the API
      let formattedChoices = null;
      if (["multiple choice", "dropdown", "checkboxes"].includes(values.choice_type)) {
        if (values.choicesText && values.choicesText.trim() !== "") {
          formattedChoices = values.choicesText
            .split("\n")
            .map((choice: string) => choice.trim())
            .filter((choice: string) => choice !== "");
        }
      }

      const payload = {
        name: values.name,
        choice_type: values.choice_type,
        choices: formattedChoices,
        is_required: values.is_required
      };

      console.log('Sending question payload:', payload);

      // Check if formSlug is defined before making the request
      if (!formSlug) {
        setError("Form slug is missing. Cannot add question.");
        setSubmitting(false);
        return;
      }

      const response = await api.post(
        `/api/v1/forms/${formSlug}/questions`,
        payload
      );

      console.log('Question added response:', response.data);

      setSuccess("Question added successfully");
      onQuestionAdded(response.data.question);
      resetForm();

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error adding question:', err);
      if (err.response?.status === 422) {
        setError("Invalid question data. Please check your inputs.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to add questions to this form");
      } else if (err.response?.status === 404) {
        setError("Form not found");
      } else {
        setError("An error occurred. Please try again later");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Add Question</h2>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <Formik
        initialValues={{
          name: "",
          choice_type: "short answer",
          choicesText: "",
          is_required: false,
        }}
        validationSchema={QuestionSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Question Text
              </label>
              <Field
                type="text"
                name="name"
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Enter your question"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            <div>
              <label
                htmlFor="choice_type"
                className="block text-sm font-medium text-gray-700"
              >
                Question Type
              </label>
              <Field
                as="select"
                name="choice_type"
                id="choice_type"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="short answer">Short Answer</option>
                <option value="paragraph">Paragraph</option>
                <option value="date">Date</option>
                <option value="multiple choice">Multiple Choice</option>
                <option value="dropdown">Dropdown</option>
                <option value="checkboxes">Checkboxes</option>
              </Field>
              <ErrorMessage
                name="choice_type"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {["multiple choice", "dropdown", "checkboxes"].includes(
              values.choice_type
            ) && (
              <div>
                <label
                  htmlFor="choicesText"
                  className="block text-sm font-medium text-gray-700"
                >
                  Choices (one per line)
                </label>
                <Field
                  as="textarea"
                  name="choicesText"
                  id="choicesText"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  placeholder="Enter choices, one per line"
                />
                <ErrorMessage
                  name="choicesText"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>
            )}

            <div className="flex items-center">
              <Field
                type="checkbox"
                name="is_required"
                id="is_required"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="is_required"
                className="ml-2 block text-sm text-gray-700"
              >
                Required Question
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isSubmitting ? "Adding..." : "Add Question"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default QuestionForm;
