import {
  Form,
  AllowedDomain,
  User,
  Question,
  Response,
  Answer,
} from "../models/index.js";
import sequelize from "../config/db.js";

// @desc    Create a new form
// @route   POST /api/v1/forms
// @access  Private
const createForm = async (req, res) => {
  try {
    console.log("Create form request body:", req.body);
    console.log("User from request:", req.user);

    const { name, slug, description, allowedDomains, limitOneResponse } =
      req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(422).json({
        message: "Invalid field",
        errors: {
          name: !name ? ["The form name field is required."] : [],
          slug: !slug ? ["The slug field is required."] : [],
        },
      });
    }

    // Check if slug already exists
    const existingForm = await Form.findOne({ where: { slug } });
    if (existingForm) {
      return res.status(422).json({
        message: "Invalid field",
        errors: {
          slug: ["This slug is already in use."],
        },
      });
    }

    // Ensure user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "User not authenticated or user ID missing",
        debug: { user: req.user },
      });
    }

    // Create form with transaction to ensure consistency
    const form = await Form.create({
      name,
      slug,
      description,
      limit_one_response: limitOneResponse ? 1 : 0,
      creator_id: req.user.id,
    });

    console.log("Form created:", form.toJSON());

    // Add allowed domains if provided
    if (allowedDomains && allowedDomains.length > 0) {
      const domainPromises = allowedDomains.map((domain) =>
        AllowedDomain.create({
          form_id: form.id,
          domain,
        })
      );
      await Promise.all(domainPromises);
      console.log(`Added ${allowedDomains.length} allowed domains`);
    }

    // Get the form with its allowed domains
    const createdForm = await Form.findByPk(form.id, {
      include: [AllowedDomain],
    });

    res.status(201).json({
      message: "Form created successfully",
      form: createdForm,
    });
  } catch (error) {
    console.error("Create form error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Get all forms for the authenticated user
// @route   GET /api/v1/forms
// @access  Private
const getForms = async (req, res) => {
  try {
    const forms = await Form.findAll({
      where: { creator_id: req.user.id },
      include: [AllowedDomain],
    });

    res.status(200).json({
      forms,
    });
  } catch (error) {
    console.error("Get forms error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get form by slug
// @route   GET /api/v1/forms/:slug
// @access  Private
const getFormBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    console.log(`Getting form details for slug: ${slug}`);

    // Find form with questions
    const form = await Form.findOne({
      where: { slug },
      include: [{ model: Question }, { model: AllowedDomain }],
    });

    if (!form) {
      console.log("Form not found:", slug);
      return res.status(404).json({ message: "Form not found" });
    }

    // Format allowed domains
    const allowedDomains = form.AllowedDomains.map((domain) => domain.domain);

    // Format the response
    const formData = {
      id: form.id,
      name: form.name,
      slug: form.slug,
      description: form.description,
      limit_one_response: form.limit_one_response,
      creator_id: form.creator_id,
      allowed_domains: allowedDomains,
      questions: form.Questions || [],
    };

    console.log(`Form ${slug} has ${formData.questions.length} questions`);

    res.json({
      message: "Form retrieved successfully",
      form: formData,
    });
  } catch (error) {
    console.error("Error retrieving form:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add this function to your formController.js file

// @desc    Get form by slug for public viewing/submission
// @route   GET /api/v1/forms/:slug/public
// @access  Public
const getPublicFormBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    console.log(`Fetching public form details for slug: ${slug}`);

    // Find the form with its questions
    const form = await Form.findOne({
      where: { slug },
      include: [
        {
          model: Question,
          attributes: [
            "id",
            "form_id",
            "name",
            "choice_type",
            "choices",
            "is_required",
          ],
        },
        {
          model: AllowedDomain,
          attributes: ["domain"],
        },
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Format the response
    const formData = form.toJSON();
    const formattedForm = {
      id: formData.id,
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      limit_one_response: formData.limit_one_response,
      creator_id: formData.creator_id,
      creator: {
        id: formData.User.id,
        name: formData.User.name,
      },
      allowed_domains: formData.AllowedDomains.map((domain) => domain.domain),
      questions: formData.Questions,
      created_at: formData.created_at,
    };

    res.json({
      message: "Form retrieved successfully",
      form: formattedForm,
    });
  } catch (error) {
    console.error("Error retrieving public form:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Make sure to export the new function
// @desc    Submit a response to a form
// @route   POST /api/v1/forms/:slug/submit
// @access  Public
const submitFormResponse = async (req, res) => {
  try {
    const { slug } = req.params;
    const { answers } = req.body;

    console.log(`Submitting response for form: ${slug}`);

    // Find the form
    const form = await Form.findOne({ where: { slug } });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Get user ID from auth token if available
    // This is the key change - properly extract user from request
    const userId = req.headers.authorization ? 
      // If there's an auth token, extract the user ID from the request
      (req.user ? req.user.id : null) : 
      // Otherwise, it's an anonymous submission
      null;
    
    console.log('Creating response with user_id:', userId);

    // Create the response record
    const response = await Response.create({
      form_id: form.id,
      user_id: userId,
    });

    // Create answers
    if (Array.isArray(answers) && answers.length > 0) {
      const answerPromises = answers.map((answer) =>
        Answer.create({
          response_id: response.id,
          question_id: answer.question_id,
          value: answer.value,
        })
      );
      await Promise.all(answerPromises);
    }

    res.status(201).json({
      message: "Response submitted successfully",
      response_id: response.id,
    });
  } catch (error) {
    console.error("Error submitting form response:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add this function to your formController.js if it doesn't exist already

// @desc    Get all public forms
// @route   GET /api/v1/forms/public
// @access  Public
const getPublicForms = async (req, res) => {
  try {
    console.log("Fetching public forms");

    // Find all forms with their creators and question count
    const forms = await Form.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: Question,
          attributes: [],
          required: true, // This ensures only forms with at least one question are returned
        },
      ],
      attributes: [
        "id",
        "name",
        "slug",
        "description",
        "created_at",
        [sequelize.fn("COUNT", sequelize.col("Questions.id")), "questionCount"],
      ],
      group: ["Form.id", "User.id"],
      order: [["created_at", "DESC"]],
      // Remove the having clause that was causing the error
    });

    // Format the response
    const formattedForms = forms.map((form) => {
      const formData = form.toJSON();
      return {
        id: formData.id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        creator: {
          id: formData.User.id,
          name: formData.User.name,
        },
        questionCount: parseInt(formData.questionCount || 0),
        created_at: formData.created_at,
      };
    });

    res.json({
      message: "Public forms retrieved successfully",
      forms: formattedForms,
    });
  } catch (error) {
    console.error("Error retrieving public forms:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all responses for a form
// @route   GET /api/v1/forms/:slug/responses
// @access  Private (only form creator)
const getFormResponses = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Find the form
    const form = await Form.findOne({ 
      where: { slug },
      include: [{ model: Question }]
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Check if user is the form creator
    if (form.creator_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view responses for this form" });
    }

    // Get all responses with their answers
    const responses = await Response.findAll({
      where: { form_id: form.id },
      include: [
        {
          model: Answer,
          include: [{ model: Question }]
        },
        {
          model: User,
          attributes: ['id', 'name', 'email', 'email_verified_at']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Format the responses
    const formattedResponses = responses.map(response => {
      const responseData = response.toJSON();
      
      // Create an answers object with question_id as keys
      const formattedAnswers = {};
      responseData.Answers.forEach(answer => {
        formattedAnswers[answer.question_id] = answer.value;
      });

      return {
        id: responseData.id,
        date: responseData.created_at,
        user: responseData.User ? {
          id: responseData.User.id,
          name: responseData.User.name,
          email: responseData.User.email,
          email_verified_at: responseData.User.email_verified_at
        } : {
          id: null,
          name: 'Anonymous',
          email: 'Anonymous',
          email_verified_at: null
        },
        answers: formattedAnswers
      };
    });

    res.json({
      message: "Responses retrieved successfully",
      responses: formattedResponses
    });
  } catch (error) {
    console.error("Error retrieving form responses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Make sure to export the function
export {
  createForm,
  getForms,
  getFormBySlug,
  getPublicFormBySlug,
  submitFormResponse,
  getPublicForms,
  getFormResponses
};
