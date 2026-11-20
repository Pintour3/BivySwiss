// Contexte d'authentification, prêt pour le futur login (Google + email).
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../../api/apiClient.js';

const AuthContext = createContext({ user: null, status: null });

export function AuthProvider({ children }) {
  const [status, setStatus] = useState(null);
  useEffect(() => { api.authStatus().then(setStatus).catch(() => setStatus(null)); }, []);
  const value = useMemo(() => ({ user: status?.user ?? null, status }), [status]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
