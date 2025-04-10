import { Form, Question } from '../models/index.js';

// @desc    Add a question to a form
// @route   POST /api/v1/forms/:slug/questions
// @access  Private
const addQuestion = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, choice_type, choices, is_required } = req.body;
    
    console.log('Adding question to form with slug:', slug);
    console.log('User ID from request:', req.user.id);
    console.log('Question data:', { name, choice_type, choices, is_required });

    // Find the form
    const form = await Form.findOne({ where: { slug } });
    
    if (!form) {
      console.log('Form not found with slug:', slug);
      return res.status(404).json({ message: 'Form not found' });
    }
    
    console.log('Form found:', form.id, form.name, 'Creator ID:', form.creator_id);

    // Check if user is the form creator
    if (form.creator_id !== req.user.id) {
      console.log('User not authorized:', req.user.id, 'vs', form.creator_id);
      return res.status(403).json({ message: 'Not authorized to modify this form' });
    }

    // Format choices if provided
    let formattedChoices = null;
    if (choices && Array.isArray(choices) && choices.length > 0) {
      formattedChoices = JSON.stringify(choices);
    }

    // Create the question
    const question = await Question.create({
      form_id: form.id,
      name,
      choice_type,
      choices: formattedChoices,
      is_required: is_required ? 1 : 0
    });

    console.log('Question created:', question.id);

    res.status(201).json({
      message: 'Question added successfully',
      question
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove a question from a form
// @route   DELETE /api/v1/forms/:slug/questions/:id
// @access  Private
const removeQuestion = async (req, res) => {
  try {
    const { slug, id } = req.params;

    // Find the form
    const form = await Form.findOne({ where: { slug } });
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if user is the form creator
    if (form.creator_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this form' });
    }

    // Find and delete the question
    const question = await Question.findOne({ 
      where: { 
        id,
        form_id: form.id
      } 
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.destroy();

    res.json({ message: 'Question removed successfully' });
  } catch (error) {
    console.error('Error removing question:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get form questions
// @route   GET /api/v1/forms/:slug/questions
// @access  Private
const getFormQuestions = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find the form with questions
    const form = await Form.findOne({
      where: { slug },
      include: [{ model: Question }]
    });

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.json({
      message: 'Questions retrieved successfully',
      questions: form.Questions
    });
  } catch (error) {
    console.error('Error getting form questions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { addQuestion, removeQuestion, getFormQuestions };