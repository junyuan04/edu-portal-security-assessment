import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import InputField from '../../components/InputField';
import Button from '../../components/Button';

const ForgotPasswordPage = () => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await authService.forgotPassword(email);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Forgot password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email to receive a password reset token.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {result ? (
          <div className="flex flex-col gap-4">
            <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              {result.message}
            </div>
            <div className="text-xs text-gray-500 break-all bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-700 mb-1">Reset token (demo):</p>
              <code>{result.token}</code>
            </div>
            <Link
              to={`/reset-password?token=${encodeURIComponent(result.token)}`}
              className="btn-primary text-sm text-center"
            >
              Continue to reset password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Button type="submit" fullWidth loading={loading} className="mt-2">
              Send reset token
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
