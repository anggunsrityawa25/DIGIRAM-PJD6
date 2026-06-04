// FILE: src/contexts/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://digiram-pjd6-production.up.railway.app';

interface HospitalData {
  id: number;
  name: string;
  address?: string;
  city?: string;
  province?: string;
  type?: string;
  bed_capacity?: number;
  current_emram_stage: number;
  last_assessment_date?: string;
}

export interface AuthUser extends User {
  hospital_data?: HospitalData | null;
  organizationName?: string; // alias untuk hospital name
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (userId: string) => void;
  loginWithCredentials: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updated: Partial<AuthUser>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<AuthUser | null>(null);
  const [token, setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-restore session dari localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('digiram_token');
    const storedUser  = localStorage.getItem('digiram_user');
    if (storedToken && storedUser) {
      try {
        const parsedUser: AuthUser = JSON.parse(storedUser);
        // Tambahkan organizationName sebagai alias
        if (parsedUser.hospital_data?.name && !parsedUser.organizationName) {
          parsedUser.organizationName = parsedUser.hospital_data.name;
        }
        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('digiram_token');
        localStorage.removeItem('digiram_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (_userId: string) => {};

  const loginWithCredentials = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Login gagal!');
        return false;
      }

      const receivedToken = data.access_token;
      if (!receivedToken) {
        alert('Token tidak diterima dari server! Cek F12 → Console.');
        return false;
      }

      // Tambahkan organizationName dari hospital_data
      const userData: AuthUser = {
        ...data.user,
        organizationName: data.user.hospital_data?.name ?? null,
      };

      setToken(receivedToken);
      setUser(userData);
      localStorage.setItem('digiram_token', receivedToken);
      localStorage.setItem('digiram_user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error login:', error);
      alert('Tidak dapat terhubung ke server Laravel. Pastikan php artisan serve berjalan di port 8000!');
      return false;
    }
  };

  // Update user (nama, email, dll) setelah simpan profil
  // Dipanggil dari PengaturanAkses setelah API berhasil
  const updateUser = (updated: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const merged: AuthUser = {
        ...prev,
        ...updated,
        // Jaga agar organizationName tetap sinkron jika hospital_data berubah
        organizationName: updated.hospital_data?.name ?? updated.organizationName ?? prev.organizationName,
      };
      localStorage.setItem('digiram_user', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = async () => {
    const currentToken = localStorage.getItem('digiram_token');
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentToken}`, 'Accept': 'application/json' },
      });
    } catch (error) {
      console.error('Gagal logout di backend:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('digiram_token');
      localStorage.removeItem('digiram_user');
    }
  };

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{ user, token, login, loginWithCredentials, logout, updateUser, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
