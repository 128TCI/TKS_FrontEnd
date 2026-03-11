import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-6">
        <FileQuestion className="w-10 h-10 text-gray-400" />
      </div>

      <h1 className="text-6xl font-bold text-gray-200 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate('/home')}
          className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}