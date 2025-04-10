import React from 'react';

interface Question {
  id: number;
  name: string;
  choice_type: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Response {
  date: string;
  user: User;
  answers: Record<string, string>;
}

interface ResponseTableProps {
  responses: Response[];
  questions: Question[];
}

const ResponseTable: React.FC<ResponseTableProps> = ({ responses, questions }) => {
  if (responses.length === 0) {
    return <p className="text-gray-500">No responses yet</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            {questions.map(question => (
              <th key={question.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {question.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {responses.map((response, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(response.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{response.user.name}</div>
                <div className="text-sm text-gray-500">{response.user.email}</div>
              </td>
              {questions.map(question => (
                <td key={question.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {response.answers[question.id.toString()] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResponseTable;
