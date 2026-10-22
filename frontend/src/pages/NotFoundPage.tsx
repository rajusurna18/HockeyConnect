import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl font-black text-blue-600 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">Go to Home</Link>
      </div>
    </div>
  );
}
