import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth, User } from './AuthContext';

export interface Profile {
  id?: string | number;
  name?: string;
  last_name?: string;
  email?: string;
  grade?: string;
  language?: string;
  area_interes?: string | null;
  carrera_interes?: string | null;
  token?: string;
  // Add any extended profile fields here
  [extra: string]: any;
}

interface ProfileContextType {
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;
  refreshFromUser: () => void; // syncs from AuthContext user
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshFromUser = () => {
    if (user) {
      // Map/normalize keys if backend uses different naming
      const mapped: Profile = {
        ...user, // spread original first
        id: (user as any).id,
        name: (user as any).name || (user as any).nombres,
        last_name: (user as any).last_name || (user as any).apellidos,
        email: (user as any).email || (user as any).correo,
        grade: (user as any).grade || (user as any).grado_escolar,
        language: (user as any).language || (user as any).idioma,
        area_interes: (user as any).area_interes ?? null,
        carrera_interes: (user as any).carrera_interes ?? null,
        token: (user as any).token,
      };
      setProfile(mapped);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    refreshFromUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, refreshFromUser }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
};
