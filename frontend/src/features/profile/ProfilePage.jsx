import { useState, useEffect } from 'react';
import userService from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import { useSecureMode } from '../../hooks/useSecureMode';
import InputField from '../../components/InputField';
import Button     from '../../components/Button';

const ProfileView = ({ profile, onEdit, secure }) => (
  <div className="flex flex-col gap-6">

    {/* Avatar + name */}
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl flex-shrink-0">
        {profile.full_name?.[0] || profile.username?.[0] || '?'}
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">{profile.full_name || profile.username}</h2>
        <p className="text-sm text-gray-400">@{profile.username} · {profile.role}</p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
        <p className="text-gray-700">{profile.email}</p>
      </div>
      {profile.phone && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Phone</p>
          <p className="text-gray-700">{profile.phone}</p>
        </div>
      )}
      {profile.institution && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Institution</p>
          <p className="text-gray-700">{profile.institution}</p>
        </div>
      )}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Member since</p>
        <p className="text-gray-700">
          {new Date(profile.created_at).toLocaleDateString('en-MY')}
        </p>
      </div>
    </div>

    {profile.bio && (
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Bio</p>
        {secure ? (
          // Secure path to render as plain text.
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {profile.bio}
          </p>
        ) : (
          // Vulnerable path: raw HTML injection sink.
          <div
            className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: profile.bio }}
          />
        )}
      </div>
    )}

    <div className="pt-2">
      <Button onClick={onEdit} variant="secondary">Edit profile</Button>
    </div>
  </div>
);


const ProfileEditForm = ({ profile, onSave, onCancel }) => {
  const [form, setForm] = useState({
    fullName:    profile.full_name    || '',
    bio:         profile.bio          || '',
    phone:       profile.phone        || '',
    institution: profile.institution  || '',
  });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await userService.updateMyProfile(form);
      onSave(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField
        id="fullName"
        label="Full name"
        value={form.fullName}
        onChange={handleChange}
        placeholder="Your full name"
      />
      <InputField
        id="phone"
        label="Phone"
        value={form.phone}
        onChange={handleChange}
        placeholder="+601X-XXXXXXX"
      />
      <InputField
        id="institution"
        label="Institution"
        value={form.institution}
        onChange={handleChange}
        placeholder="University or company"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</label>
        <textarea
          id="bio"
          value={form.bio}
          onChange={handleChange}
          rows={4}
          placeholder="Tell others about yourself…"
          className="input-field resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={saving}>Save changes</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};


const ProfilePage = () => {
  const { user } = useAuth();
  const { secure } = useSecureMode();

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await userService.getMyProfile();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = (updated) => {
    setProfile(updated);
    setEditMode(false);
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-40" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
      </div>
      <div className="h-32 bg-gray-100 rounded" />
    </div>
  );

  if (error) return (
    <div className="text-center py-20 text-red-500">{error}</div>
  );

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-400 mt-1">
          Logged in as <strong>{user?.email}</strong>
        </p>
      </div>

      <div className="card">
        {editMode ? (
          <ProfileEditForm
            profile={profile}
            onSave={handleSave}
            onCancel={() => setEditMode(false)}
          />
        ) : (
          <ProfileView
            profile={profile}
            onEdit={() => setEditMode(true)}
            secure={!!secure}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;


