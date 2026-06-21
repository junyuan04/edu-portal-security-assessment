import { useEffect, useState } from 'react';
import api from '../services/api';

// Lightweight hook for components that need to branch on SECURE_MODE.
// Calls /api/system/secure-mode once on mount.
export const useSecureMode = () => {
  const [secure, setSecure]   = useState(null); 
  const [error,  setError]    = useState(null);

  useEffect(() => {
    let alive = true;
    api.get('/system/secure-mode')
      .then((r) => { if (alive) setSecure(!!r.data?.secure); })
      .catch((e) => { if (alive) setError(e); });
    return () => { alive = false; };
  }, []);

  return { secure, loading: secure === null && !error, error };
};

export default useSecureMode;


