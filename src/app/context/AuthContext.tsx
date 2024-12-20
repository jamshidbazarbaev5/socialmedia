'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface DecodedToken {
  profile_id: string;
  username: string;
  first_name: string;
  exp: number;
  last_name: string;
  url: string;
  avatar: string;
  
}

interface AuthContextType {
  user: DecodedToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  profileId: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  profileId: null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp && decoded.exp < currentTime) {
            // Instead of logging out immediately, try to refresh the token
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              try {
                const response = await axios.post('https://bondify.uz/auth/token/refresh/', {
                  refresh: refreshToken
                });
                const newToken = response.data.access;
                localStorage.setItem('token', newToken);
                const newDecoded = jwtDecode<DecodedToken>(newToken);
                setUser(newDecoded);
                setIsAuthenticated(true);
                setProfileId(newDecoded.profile_id);
                return;
              } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                logout();
                return;
              }
            }
          }
          
          setUser(decoded);
          setIsAuthenticated(true);
          setProfileId(decoded.profile_id);
        } catch (error) {
          console.error('Invalid token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string) => {
    try {
      localStorage.setItem('token', token);
      const decoded = jwtDecode<DecodedToken>(token);
      setUser(decoded);
      setIsAuthenticated(true);
      setProfileId(decoded.profile_id);
    } catch (error) {
      console.error('Invalid token:', error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    setProfileId(null);
    router.push('/login');
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, profileId }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);