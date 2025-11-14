"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@frontegg/nextjs";
import OnboardingModal from "./OnboardingModal";

export default function OnboardingGuard() {
  const { isAuthenticated, user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [userMetadata, setUserMetadata] = useState<Record<string, unknown>>({});

  type FronteggUserLite = {
    accessToken?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
    metadata?: Record<string, unknown>;
  };

  const userLite = (user || {}) as FronteggUserLite;
  const accessToken = useMemo(() => userLite.accessToken || "", [userLite.accessToken]);
  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_FRONTEGG_BASE_URL || "https://dignifiedlabs-dev.frontegg.com", []);

  // Parse metadata from various sources
  const parseMaybeJson = (val: unknown): Record<string, unknown> | undefined => {
    if (!val) return undefined;
    if (typeof val === "string") {
      try { return JSON.parse(val) as Record<string, unknown>; } catch { return undefined; }
    }
    if (typeof val === "object") return val as Record<string, unknown>;
    return undefined;
  };

  // Check onboarding status
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setIsChecking(false);
      return;
    }

    const checkOnboarding = async () => {
      try {
        // First, try to get metadata from JWT/user object
        const jwtMetadata = parseMaybeJson(userLite.metadata) || 
                          parseMaybeJson((user as unknown as Record<string, unknown>)?.vendorMetadata);
        
        // If we have metadata with onboardingComplete, check it
        if (jwtMetadata && jwtMetadata.onboardingComplete === true) {
          setShowOnboarding(false);
          setIsChecking(false);
          return;
        }

        // Fetch fresh metadata from API
        const res = await fetch(`${baseUrl}/identity/resources/users/v2/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.ok) {
          const data: Record<string, unknown> = await res.json();
          const metadata = parseMaybeJson(data?.metadata) || {};
          setUserMetadata(metadata);

          // Check if onboarding is complete
          if (metadata.onboardingComplete === true) {
            setShowOnboarding(false);
          } else {
            setShowOnboarding(true);
          }
        } else {
          // If API call fails but we have JWT metadata, use that
          if (jwtMetadata) {
            setUserMetadata(jwtMetadata);
            if (jwtMetadata.onboardingComplete !== true) {
              setShowOnboarding(true);
            }
          } else {
            // No metadata found, show onboarding
            setShowOnboarding(true);
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // On error, check JWT metadata
        const jwtMetadata = parseMaybeJson(userLite.metadata);
        if (jwtMetadata) {
          setUserMetadata(jwtMetadata);
          if (jwtMetadata.onboardingComplete !== true) {
            setShowOnboarding(true);
          }
        } else {
          // No metadata, show onboarding to be safe
          setShowOnboarding(true);
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboarding();
  }, [isAuthenticated, accessToken, baseUrl, user, userLite.metadata]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Refresh the page or trigger a metadata refresh
    window.location.reload();
  };

  // Don't render anything while checking or if not authenticated
  if (!isAuthenticated || isChecking) {
    return null;
  }

  // Show onboarding modal if needed
  if (showOnboarding && isAuthenticated && accessToken) {
    return (
      <OnboardingModal
        user={userLite as unknown as Record<string, unknown>}
        accessToken={accessToken}
        initialMetadata={userMetadata}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return null;
}





