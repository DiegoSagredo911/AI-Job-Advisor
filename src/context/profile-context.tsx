"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CandidateProfile, ProfileMetadata } from "@/types/profile";

interface ProfileContextType {
  activeSlug: string;
  setActiveSlug: (slug: string) => void;
  profiles: ProfileMetadata[];
  activeProfile: CandidateProfile | null;
  isLoading: boolean;
  refreshProfiles: () => Promise<void>;
  reloadActiveProfile: () => Promise<void>;
}

import axios from "axios";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [activeSlug, setActiveSlugState] = useState<string>("mi-perfil");
  const [profiles, setProfiles] = useState<ProfileMetadata[]>([]);
  const [activeProfile, setActiveProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfiles = async () => {
    try {
      const { data } = await axios.get("/api/profiles");
      if (data.success && data.profiles) {
        setProfiles(data.profiles);
      }
    } catch (err) {
      console.error("Error fetching profiles with axios:", err);
    }
  };

  const fetchActiveProfile = async (slug: string) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/api/profiles/${slug}`);
      if (data.success && data.profile) {
        setActiveProfile(data.profile);
      }
    } catch (err) {
      console.error(`Error fetching profile ${slug} with axios:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("activeProfileSlug") : null;
    const initialSlug = (saved && saved !== "diego-sagredo") ? saved : "mi-perfil";
    setActiveSlugState(initialSlug);
    fetchProfiles();
    fetchActiveProfile(initialSlug);
  }, []);

  const setActiveSlug = (slug: string) => {
    setActiveSlugState(slug);
    if (typeof window !== "undefined") {
      localStorage.setItem("activeProfileSlug", slug);
    }
    fetchActiveProfile(slug);
  };

  const reloadActiveProfile = async () => {
    await fetchActiveProfile(activeSlug);
  };

  return (
    <ProfileContext.Provider
      value={{
        activeSlug,
        setActiveSlug,
        profiles,
        activeProfile,
        isLoading,
        refreshProfiles: fetchProfiles,
        reloadActiveProfile,
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
