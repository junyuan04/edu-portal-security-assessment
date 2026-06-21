import { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/admin.service';

// Corner badge for flipping SECURE_MODE on demand.
const SecureModeBadge = () => {
  const { isAuthenticated, replaceToken } = useAuth();
  const [secure,  setSecure]  = useState(null);  
  const [pending, setPending] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setSecure(null);
      return;
    }
    let alive = true;
    adminService.getSecureMode()
      .then((v) => { if (alive) setSecure(v); })
      .catch((e) => { if (alive) setError(e.message); });
    return () => { alive = false; };
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const flip = async () => {
    if (secure === null || pending) return;
    setPending(true);
    setError(null);
    try {
      const { secure: next, token } = await adminService.setSecureMode(!secure);
      // Swap in the freshly re-signed token before any other component fires its next authenticated request
      if (token) replaceToken(token);
      setSecure(next);
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  };

  const Icon = secure ? ShieldCheck : ShieldAlert;
  const tone = secure
    ? 'border-green-300 bg-green-50 text-green-800'
    : 'border-red-300 bg-red-50 text-red-800';
  const label = secure === null
    ? 'Loading…'
    : (secure ? 'Secure mode' : 'Vulnerable mode');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        type="button"
        onClick={flip}
        disabled={secure === null || pending}
        title="Click to toggle secure / vulnerable mode"
        className={`flex items-center gap-2 px-3 py-2 rounded-full border shadow-md text-xs font-semibold transition-colors ${tone} ${
          pending ? 'opacity-60 cursor-wait' : 'hover:shadow-lg'
        }`}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
        <span
          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
            secure ? 'bg-green-600' : 'bg-red-500'
          }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              secure ? 'translate-x-3.5' : 'translate-x-0.5'
            }`}
          />
        </span>
      </button>
      {error && (
        <p className="mt-1 text-[10px] text-red-600 bg-white px-2 py-1 rounded shadow">{error}</p>
      )}
    </div>
  );
};

export default SecureModeBadge;


