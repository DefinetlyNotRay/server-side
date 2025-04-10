import React from 'react';
import api from '../services/api';

interface Question {
  id: number;
  form_id: number;
  name: string;
  choice_type: string;
  choices: string | null;
  is_required: number;
}

interface QuestionListProps {
  questions: Question[];
  formSlug: string | undefined;
  onQuestionRemoved: (questionId: number) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  formSlug,
  onQuestionRemoved,
}) => {
  const handleRemoveQuestion = async (questionId: number) => {
    if (!window.confirm("Are you sure you want to remove this question?")) {
      return;
    }

    try {
      await api.delete(`/api/v1/forms/${formSlug}/questions/${questionId}`);
      onQuestionRemoved(questionId);
    } catch (error) {
      console.error("Error removing question:", error);
      alert("Failed to remove question");
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'short answer': 'Short Answer',
      'paragraph': 'Paragraph',
      'date': 'Date',
      'multiple choice': 'Multiple Choice',
      'dropdown': 'Dropdown',
      'checkboxes': 'Checkboxes'
    };
    return types[type] || type;
  };

  if (!questions || questions.length === 0) {
    return <div className="text-gray-500 text-center py-4">No questions added yet.</div>;
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <div key={question.id} className="bg-white shadow-md rounded p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{question.name}</h3>
              <div className="text-sm text-gray-600 mt-1">
                <span className="bg-gray-200 px-2 py-1 rounded mr-2">
                  {getQuestionTypeLabel(question.choice_type)}
                </span>
                {question.is_required === 1 && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                    Required
                  </span>
                )}
              </div>
              
              {question.choices && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 font-semibold">Choices:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                    {(() => {
                      try {
                        // Try to parse as JSON
                        const parsedChoices = JSON.parse(question.choices);
                        if (Array.isArray(parsedChoices)) {
                          return parsedChoices.map((choice, index) => (
                            <li key={index}>{choice}</li>
                          ));
                        }
                        return null;
                      } catch (e) {
                        // If JSON parsing fails, try comma-separated string
                        return question.choices.split(',').map((choice, index) => (
                          <li key={index}>{choice.trim()}</li>
                        ));
                      }
                    })()}
                  </ul>
                </div>
              )}
            </div>
            
            <button
              onClick={() => handleRemoveQuestion(question.id)}
              className="text-red-500 hover:text-red-700"
              title="Remove Question"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionList;
