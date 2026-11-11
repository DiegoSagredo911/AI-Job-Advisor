"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CandidateProfile, ProfileMetadata } from "@/types/profile";
import {
  getAllProfiles,
  getProfilesMetadata,
  getProfileBySlug,
  saveProfile,
  deleteProfile,
  initLocalStorageIfEmpty,
  DEFAULT_INITIAL_PROFILE,
  ACTIVE_SLUG_KEY,
} from "@/lib/storage/local-database";

interface ProfileContextType {
  activeSlug: string;
  setActiveSlug: (slug: string) => void;
  profiles: ProfileMetadata[];
  activeProfile: CandidateProfile | null;
  isLoading: boolean;
  refreshProfiles: () => Promise<void>;
  reloadActiveProfile: () => Promise<void>;
  updateCurrentProfile: (profile: CandidateProfile) => void;
  removeProfile: (slug: string) => boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [activeSlug, setActiveSlugState] = useState<string>("mi-perfil");
  const [profiles, setProfiles] = useState<ProfileMetadata[]>([]);
  const [activeProfile, setActiveProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfiles = async () => {
    try {
      const list = getProfilesMetadata();
      setProfiles(list);
    } catch (err) {
      console.error("Error refreshing profiles from local database:", err);
    }
  };

  const fetchActiveProfile = async (slug: string) => {
    setIsLoading(true);
    try {
      let prof = getProfileBySlug(slug);
      if (!prof) {
        prof = DEFAULT_INITIAL_PROFILE;
      }
      setActiveProfile(prof);
    } catch (err) {
      console.error(`Error fetching profile ${slug} from local database:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await initLocalStorageIfEmpty();
      const saved = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_SLUG_KEY) : null;
      const initialSlug = saved && saved !== "diego-sagredo" ? saved : "mi-perfil";
      setActiveSlugState(initialSlug);
      await refreshProfiles();
      await fetchActiveProfile(initialSlug);
    };

    init();
  }, []);

  const setActiveSlug = (slug: string) => {
    setActiveSlugState(slug);
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_SLUG_KEY, slug);
    }
    fetchActiveProfile(slug);
  };

  const reloadActiveProfile = async () => {
    await fetchActiveProfile(activeSlug);
  };

  const updateCurrentProfile = (profile: CandidateProfile) => {
    const saved = saveProfile(profile);
    setActiveProfile(saved);
    refreshProfiles();
  };

  const removeProfile = (slug: string): boolean => {
    const success = deleteProfile(slug);
    if (success) {
      const remaining = getProfilesMetadata();
      setProfiles(remaining);
      if (activeSlug === slug && remaining.length > 0) {
        setActiveSlug(remaining[0].slug);
      }
    }
    return success;
  };

  return (
    <ProfileContext.Provider
      value={{
        activeSlug,
        setActiveSlug,
        profiles,
        activeProfile,
        isLoading,
        refreshProfiles,
        reloadActiveProfile,
        updateCurrentProfile,
        removeProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
