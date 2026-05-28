import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import InputField from '../../components/InputField';
import Button from '../../components/Button';

const RegisterPage = () => {
  const { register, loading, error } = useAuth();

  const [form, setForm] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.id]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!form.fullName.trim())           errors.fullName = 'Full name is required';
    if (!form.username.trim())           errors.username = 'Username is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email';
    if (form.password.length < 6)        errors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    register(form.email, form.username, form.password, form.fullName);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Join thousands of Malaysian learners</p>
        </div>

        {/* Server error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            id="fullName"
            label="Full name"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Ali Hassan bin Ibrahim"
            error={fieldErrors.fullName}
            required
          />
          <InputField
            id="username"
            label="Username"
            value={form.username}
            onChange={handleChange}
            placeholder="ali.hassan"
            error={fieldErrors.username}
            required
          />
          <InputField
            id="email"
            label="Email address"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={fieldErrors.email}
            required
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 6 characters"
            error={fieldErrors.password}
            required
          />
          <InputField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            error={fieldErrors.confirmPassword}
            required
          />

          <Button type="submit" fullWidth loading={loading} className="mt-2">
            Create account
          </Button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;


