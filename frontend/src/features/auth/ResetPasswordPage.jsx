import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import InputField from '../../components/InputField';
import Button from '../../components/Button';

const ResetPasswordPage = () => {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const [form, setForm] = useState({
    token:    params.get('token') || '',
    password: '',
    confirm:  '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const t = params.get('token');
    if (t) setForm((p) => ({ ...p, token: t }));
  }, [params]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(form.token, form.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
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
          <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
          <p className="text-sm text-gray-500 mt-1">Choose a new password for your account.</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {success ? (
          <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 text-center">
            Password reset. Redirecting to sign in…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              id="token"
              label="Reset token"
              value={form.token}
              onChange={handleChange}
              placeholder="Paste the token from the forgot-password step"
              required
            />
            <InputField
              id="password"
              label="New password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <InputField
              id="confirm"
              label="Confirm new password"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <Button type="submit" fullWidth loading={loading} className="mt-2">
              Reset password
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

export default ResetPasswordPage;
