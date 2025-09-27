"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@frontegg/nextjs";
import { AdminPortal } from "@frontegg/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProfileEditModal from "@/components/ProfileEditModal";

export default function ProfilePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
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

  type JwtClaims = {
    name?: string;
    email?: string;
    phone_number?: string;
    picture?: string;
    metadata?: Record<string, unknown>;
  } | null;

  const decoded: JwtClaims = useMemo(() => {
    if (!accessToken) return null;
    try {
      const parts = accessToken.split(".");
      if (parts.length < 2) return null;
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = typeof window === "undefined"
        ? Buffer.from(base64, "base64").toString("utf-8")
        : decodeURIComponent(atob(base64).split("").map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`).join(""));
      return JSON.parse(json) as JwtClaims;
    } catch {
      return null;
    }
  }, [accessToken]);

  const jwtUser = useMemo(() => {
    const claims = decoded || {};
    const name = claims?.name ?? userLite.name;
    const email = claims?.email ?? userLite.email;
    const phoneNumber = claims?.phone_number ?? userLite.phoneNumber;
    const profilePictureUrl = claims?.picture ?? userLite.profilePictureUrl;
    const parseMaybeJson = (val: unknown): Record<string, unknown> | undefined => {
      if (!val) return undefined;
      if (typeof val === "string") {
        try { return JSON.parse(val) as Record<string, unknown>; } catch { return undefined; }
      }
      if (typeof val === "object") return val as Record<string, unknown>;
      return undefined;
    };
    const claimsObj = claims as Record<string, unknown>;
    const metadataFromClaims = parseMaybeJson((claimsObj as Record<string, unknown>)?.metadata) || parseMaybeJson((claimsObj as Record<string, unknown>)?.vendorMetadata);
    const metadataFromUser = parseMaybeJson(userLite.metadata) || parseMaybeJson((user as unknown as Record<string, unknown>)?.vendorMetadata);
    const userMetadata: Record<string, unknown> = metadataFromClaims || metadataFromUser || {};

    return { name, email, phoneNumber, profilePictureUrl, metadata: userMetadata };
  }, [decoded, userLite.name, userLite.email, userLite.phoneNumber, userLite.profilePictureUrl, userLite.metadata, user]);

  // Resolve authoritative profile via API to ensure fresh metadata
  const [resolvedMetadata, setResolvedMetadata] = useState<Record<string, unknown>>({});
  const [resolvedPhone, setResolvedPhone] = useState<string>("");
  const [resolvedProfilePictureUrl, setResolvedProfilePictureUrl] = useState<string>("");
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSecuritySettings = useCallback(() => {
    AdminPortal.show();
  }, []);

  // Redirect unauthenticated users to homepage
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const parseMaybeJson = (val: unknown): Record<string, unknown> | undefined => {
      if (!val) return undefined;
      if (typeof val === "string") {
        try { return JSON.parse(val) as Record<string, unknown>; } catch { return undefined; }
      }
      if (typeof val === "object") return val as Record<string, unknown>;
      return undefined;
    };
    // Start with what we have locally
    const localMd = parseMaybeJson(jwtUser?.metadata) || {};
    setResolvedMetadata(localMd);
    setResolvedPhone((jwtUser?.phoneNumber as string) || "");
    setResolvedProfilePictureUrl((jwtUser?.profilePictureUrl as string) || "");
    if (!isAuthenticated || !accessToken) return;
    let aborted = false;
    const load = async () => {
      try {
        const res = await fetch(`${baseUrl}/identity/resources/users/v2/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return; // keep local if fails
        const data: Record<string, unknown> = await res.json();
        const md = parseMaybeJson(data?.metadata) || {};
        const phone = (data?.phoneNumber as string) || "";
        const profilePictureUrl = (data?.profilePictureUrl as string) || "";
        if (!aborted) {
          setResolvedMetadata(md);
          setResolvedPhone(phone);
          setResolvedProfilePictureUrl(profilePictureUrl);
        }
      } catch {
        // ignore, keep local
      }
    };
    load();
    return () => { aborted = true; };
  }, [isAuthenticated, accessToken, baseUrl, jwtUser?.metadata, jwtUser?.phoneNumber, jwtUser?.profilePictureUrl, refreshCounter]);

  return (
    <div style={{ 
      padding: "24px", 
      maxWidth: "800px", 
      margin: "0 auto"
    }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: "0 0 8px 0", fontSize: "2rem", fontWeight: 700, color: "#333" }}>Your Profile</h1>
        <p style={{ margin: 0, color: "#666" }}>Manage your personal information and preferences</p>
      </div>

      <div style={{ 
        background: "#fff", 
        border: "1px solid #e5e7eb", 
        borderRadius: 12, 
        padding: 24, 
        marginBottom: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <Image 
            src={resolvedProfilePictureUrl || (jwtUser?.profilePictureUrl as string) || "/vercel.svg"} 
            alt={(jwtUser?.name as string) || "User"} 
            width={80} 
            height={80} 
            unoptimized 
            style={{ borderRadius: "50%", border: "3px solid var(--accent)" }}
          />
          <div>
            <h2 style={{ margin: "0 0 4px 0", fontSize: "1.5rem", fontWeight: 600 }}>{(jwtUser?.name as string) || ""}</h2>
            <p style={{ margin: 0, color: "#666" }}>{(jwtUser?.email as string) || ""}</p>
          </div>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: 16 
        }}>
          <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
            <strong style={{ color: "#333" }}>Phone:</strong>
            <div style={{ marginTop: 4, color: "#666" }}>{resolvedPhone || "-"}</div>
          </div>
          <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
            <strong style={{ color: "#333" }}>Company:</strong>
            <div style={{ marginTop: 4, color: "#666" }}>{String(resolvedMetadata.company ?? "-")}</div>
          </div>
          <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
            <strong style={{ color: "#333" }}>Job Title:</strong>
            <div style={{ marginTop: 4, color: "#666" }}>{String(resolvedMetadata.jobTitle ?? "-")}</div>
          </div>
          <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
            <strong style={{ color: "#333" }}>University/College:</strong>
            <div style={{ marginTop: 4, color: "#666" }}>{String(resolvedMetadata.university ?? "-")}</div>
          </div>
          <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
            <strong style={{ color: "#333" }}>Qualifications:</strong>
            <div style={{ marginTop: 4, color: "#666" }}>{String(resolvedMetadata.qualification ?? "-")}</div>
          </div>
          <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
            <strong style={{ color: "#333" }}>Year of Graduation:</strong>
            <div style={{ marginTop: 4, color: "#666" }}>{String(resolvedMetadata.graduationYear ?? "-")}</div>
          </div>
          {(() => {
            const addr = (resolvedMetadata.address as Record<string, unknown>) || {};
            const line = [addr.address1, addr.city, addr.state].filter(Boolean).join(", ");
            return (
              <>
                <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
                  <strong style={{ color: "#333" }}>Address:</strong>
                  <div style={{ marginTop: 4, color: "#666" }}>{line || "-"}</div>
                </div>
                <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
                  <strong style={{ color: "#333" }}>Country:</strong>
                  <div style={{ marginTop: 4, color: "#666" }}>{String(addr.country ?? "-")}</div>
                </div>
                <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
                  <strong style={{ color: "#333" }}>Post code:</strong>
                  <div style={{ marginTop: 4, color: "#666" }}>{String(addr.postCode ?? "-")}</div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      <div style={{ 
        display: "flex", 
        gap: 16, 
        justifyContent: "center",
        flexWrap: "wrap"
      }}>
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            background: "var(--accent)",
            color: "var(--accent-contrast)",
            border: "none",
            padding: "12px 24px",
            borderRadius: 8,
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
        >
          Edit Profile Information
        </button>
        <button 
          onClick={handleSecuritySettings}
          style={{
            background: "#fff",
            color: "var(--accent)",
            border: "2px solid var(--accent)",
            padding: "12px 24px",
            borderRadius: 8,
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          Security Settings
        </button>
      </div>

      {successMessage && (
        <div style={{ 
          padding: "16px 20px", 
          background: "#d4edda", 
          color: "#155724", 
          border: "1px solid #c3e6cb", 
          borderRadius: 8,
          marginTop: 24,
          textAlign: "center",
          fontWeight: 500
        }}>
          {successMessage}
        </div>
      )}

      <ProfileEditModal isOpen={isOpen} onClose={() => setIsOpen(false)} onUpdated={() => { 
        setRefreshCounter((c) => c + 1); 
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      }} user={userLite as unknown as Record<string, unknown>} accessToken={accessToken} initialMetadata={resolvedMetadata} />
    </div>
  );
}


