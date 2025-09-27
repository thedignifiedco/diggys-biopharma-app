"use client";
import { useEffect, useMemo, useState } from "react";

type UserEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (updatedUser: Record<string, unknown>) => void;
  user: { id: string; name?: string; phoneNumber?: string; metadata?: Record<string, unknown> | string; tenantId?: string };
  vendorToken: string;
  fronteggApiUrl?: string;
};

export default function UserEditModal({ isOpen, onClose, onUpdated, user, vendorToken, fronteggApiUrl }: UserEditModalProps) {
  const apiBaseUrl = useMemo(() => fronteggApiUrl || process.env.NEXT_PUBLIC_FRONTEGG_API_URL || "https://api.frontegg.com", [fronteggApiUrl]);


  const parseMaybeJson = (val: unknown): Record<string, unknown> => {
    if (!val) return {};
    if (typeof val === "string") { try { return JSON.parse(val) as Record<string, unknown>; } catch { return {}; } }
    if (typeof val === "object") return val as Record<string, unknown>;
    return {};
  };

  const initialMd = useMemo(() => parseMaybeJson(user?.metadata), [user]);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [company, setCompany] = useState(String(initialMd.company ?? ""));
  const [jobTitle, setJobTitle] = useState(String(initialMd.jobTitle ?? ""));
  const [university, setUniversity] = useState(String(initialMd.university ?? ""));
  const [qualification, setQualification] = useState(String(initialMd.qualification ?? ""));
  const [graduationYear, setGraduationYear] = useState(String(initialMd.graduationYear ?? ""));
  const addressObj = (initialMd.address as Record<string, unknown>) || {};
  const [address1, setAddress1] = useState(String(addressObj.address1 ?? (initialMd.address as unknown as string) ?? ""));
  const [city, setCity] = useState(String(addressObj.city ?? ""));
  const [state, setState] = useState(String(addressObj.state ?? ""));
  const [country, setCountry] = useState(String(addressObj.country ?? (initialMd.country as unknown as string) ?? ""));
  const [postCode, setPostCode] = useState(String(addressObj.postCode ?? (initialMd.postcode as unknown as string) ?? ""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(user?.name || "");
    setPhone(user?.phoneNumber || "");
    const md = parseMaybeJson(user?.metadata);
    setCompany(String(md.company ?? ""));
    setJobTitle(String(md.jobTitle ?? ""));
    setUniversity(String(md.university ?? ""));
    setQualification(String(md.qualification ?? ""));
    setGraduationYear(String(md.graduationYear ?? ""));
    const addr = (md.address as Record<string, unknown>) || {};
    setAddress1(String(addr.address1 ?? (md.address as unknown as string) ?? ""));
    setCity(String(addr.city ?? ""));
    setState(String(addr.state ?? ""));
    setCountry(String(addr.country ?? (md.country as unknown as string) ?? ""));
    setPostCode(String(addr.postCode ?? (md.postcode as unknown as string) ?? ""));
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const trimmedPhone = (phone || "").trim();
      const e164 = /^\+?[1-9]\d{6,14}$/;
      if (trimmedPhone && !e164.test(trimmedPhone)) {
        throw new Error("Please enter a valid phone number, e.g. +441234567890");
      }

      const mergedMetadata = {
        ...parseMaybeJson(user?.metadata),
        company,
        jobTitle,
        university,
        qualification,
        graduationYear,
        address: {
          address1,
          city,
          state,
          postCode,
          country,
        },
      };

      // Update user via identity users v1 endpoint
      const res = await fetch(`${apiBaseUrl}/identity/resources/users/v1`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${vendorToken}`,
          "Content-Type": "application/json",
          "frontegg-tenant-id": user.tenantId || "",
          "frontegg-user-id": user.id,
        },
        body: JSON.stringify({ 
          name: name || undefined, 
          phoneNumber: trimmedPhone || undefined,
          metadata: JSON.stringify(mergedMetadata)
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Failed to update user: ${res.status}`);
      }
      const updatedUser = await res.json() as Record<string, unknown>;

      onUpdated?.(updatedUser);
      onClose();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(13,110,253,0.15)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#ffffff", borderRadius: 12, width: "min(92vw, 560px)", padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb" }}>
        <h2 style={{ marginTop: 0 }}>Edit user</h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Company</span>
            <input value={company} onChange={(e) => setCompany(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Job Title</span>
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Name of University or College</span>
            <input value={university} onChange={(e) => setUniversity(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Qualifications</span>
            <select value={qualification} onChange={(e) => setQualification(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }}>
              <option value="">Select</option>
              <option value="Bachelors">Bachelors</option>
              <option value="Masters">Masters</option>
              <option value="PhD">PhD</option>
              <option value="Diploma">Diploma</option>
            </select>
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Year of Graduation</span>
            <input value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="e.g. 2023" style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Address line 1</span>
            <input value={address1} onChange={(e) => setAddress1(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>City</span>
              <input value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>State</span>
              <input value={state} onChange={(e) => setState(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }} />
            </label>
          </div>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Country</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }}>
              <option value="">Select</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Nigeria">Nigeria</option>
            </select>
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Post code</span>
            <input value={postCode} onChange={(e) => setPostCode(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }} />
          </label>

          {error ? <div style={{ color: "#b00020" }}>{error}</div> : null}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" onClick={onClose} disabled={submitting} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: "8px 12px", borderRadius: 8, background: "var(--accent)", color: "var(--accent-contrast)", border: "1px solid var(--accent)", cursor: "pointer" }}>{submitting ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


