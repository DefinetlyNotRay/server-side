import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import QuestionForm from "../components/QuestionForm";
import QuestionList from "../components/QuestionList";
import ResponseTable from "../components/ResponseTable";

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

interface Response {
  date: string;
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
  };
  answers: Record<string, string>;
}

const DetailForm = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [formLink, setFormLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    console.log("Token in DetailForm:", token);

    if (!token) {
      console.error("No authentication token found");

      // Check if we have user data but no token (inconsistent state)
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.accessToken) {
            // Restore token from user data
            localStorage.setItem("token", parsedUser.accessToken);
            console.log(
              "Restored token from user data:",
              parsedUser.accessToken
            );
            // Reload the page to apply the token
            window.location.reload();
            return;
          }
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }

      setError("You must be logged in to view this form");
      setLoading(false);
      return;
    }

    // Inside fetchFormDetails function
    const fetchFormDetails = async () => {
      try {
        console.log(`Fetching form details for slug: ${slug}`);
        const response = await api.get(`/api/v1/forms/${slug}`);
        console.log("Form details response:", response.data);

        // Check the exact structure of the response
        console.log(
          "Response structure:",
          JSON.stringify(response.data, null, 2)
        );

        // Try to access the form data regardless of structure
        const formData = response.data.form || response.data;

        if (!formData || typeof formData !== "object") {
          console.error("Form data is missing or invalid:", response.data);
          setError("Invalid form data structure");
          setLoading(false);
          return;
        }

        console.log("Form data to be set:", formData);
        setForm(formData);
        setFormLink(`${window.location.origin}/forms/${slug}/submit`);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching form details:", err);
        // Error handling remains the same
        if (err.response?.status === 404) {
          setError("Form not found");
        } else if (err.response?.status === 403) {
          setError("You do not have permission to view this form");
        } else {
          setError(`An error occurred: ${err.message}`);
        }
        setLoading(false);
      }
    };

    fetchFormDetails();
  }, [slug, navigate]);

  // Add debugging for user and creator ID
  useEffect(() => {
    if (form && user) {
      console.log("User ID:", user.id);
      console.log("Form creator ID:", form.creator_id);
      console.log("Is creator:", form.creator_id === user.id);
    }
  }, [form, user]);

  // fetchResponses function
  const fetchResponses = async () => {
    try {
      const response = await api.get(`/api/v1/forms/${slug}/responses`);
      setResponses(response.data.responses);
    } catch (err) {
      console.error("Failed to fetch responses:", err);
    }
  };

  useEffect(() => {
    if (form && form.creator_id === user?.id && activeTab === "responses") {
      fetchResponses(); // Use the already defined fetchResponses function
    }
  }, [slug, form, user, activeTab]); // Make sure to include the dependency array

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleAddQuestion = () => {
    setActiveTab("questions");
  };

  const handleQuestionAdded = (newQuestion: Question) => {
    if (form) {
      setForm({
        ...form,
        questions: [...form.questions, newQuestion],
      });
    }
  };

  const handleQuestionRemoved = (questionId: number) => {
    if (form) {
      setForm({
        ...form,
        questions: form.questions.filter((q) => q.id !== questionId),
      });
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!form) {
    return <div className="text-center py-10">Form not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Form Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{form.name}</h1>
            {form.creator_id === user?.id && (
              <button
                onClick={() => navigate(`/forms/${form.slug}/edit`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Edit Form
              </button>
            )}
          </div>
          <p className="text-gray-600 mt-2">{form.description}</p>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "general"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "questions"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Questions
            </button>
            {form.creator_id === user?.id && (
              <button
                onClick={() => setActiveTab("responses")}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === "responses"
                    ? "border-b-2 border-indigo-500 text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Responses
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "general" && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Form Link</h2>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={formLink}
                    readOnly
                    className="flex-1 border rounded-l-md py-2 px-3 text-gray-700 bg-gray-100"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-md"
                  >
                    {linkCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Settings</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="mb-2">
                    <span className="font-medium">
                      Limit one response per user:
                    </span>{" "}
                    {form.limit_one_response ? "Yes" : "No"}
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Allowed domains:</span>{" "}
                    {form.allowed_domains && form.allowed_domains.length > 0
                      ? form.allowed_domains.join(", ")
                      : "All domains allowed"}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">Actions</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddQuestion}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                  >
                    Add Question
                  </button>
                  {form.creator_id === user?.id && (
                    <button
                      onClick={() => navigate(`/forms/${form.slug}/submit`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      Preview Form
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Make sure the questions tab content looks like this: */}
          {activeTab === "questions" && (
            <div>
              {form.creator_id === user?.id ? (
                <>
                  <QuestionForm
                    formSlug={form.slug}
                    onQuestionAdded={handleQuestionAdded}
                  />
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">
                      Form Questions
                    </h2>
                    <QuestionList
                      questions={form.questions || []}
                      formSlug={form.slug}
                      onQuestionRemoved={handleQuestionRemoved}
                    />
                  </div>
                </>
              ) : (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">
                    You do not have permission to edit questions for this form.
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === "responses" && form.creator_id === user?.id && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Form Responses</h2>
              <ResponseTable responses={responses} questions={form.questions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailForm;
