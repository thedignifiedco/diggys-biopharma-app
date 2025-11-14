"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

type OnboardingModalProps = {
  user: Record<string, unknown>;
  accessToken: string;
  fronteggBaseUrl?: string;
  initialMetadata?: Record<string, unknown>;
  onComplete: () => void;
};

export default function OnboardingModal({ user, accessToken, fronteggBaseUrl, initialMetadata, onComplete }: OnboardingModalProps) {
  const baseUrl = useMemo(() => fronteggBaseUrl || process.env.NEXT_PUBLIC_FRONTEGG_BASE_URL, [fronteggBaseUrl]);

  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [university, setUniversity] = useState("");
  const [qualification, setQualification] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postCode, setPostCode] = useState("");
  const [phone, setPhone] = useState((user?.phoneNumber as string) || "");
  const [name, setName] = useState((user?.name as string) || "");
  const [profilePictureUrl, setProfilePictureUrl] = useState((user?.profilePictureUrl as string) || "");
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Prevent closing with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const metadata = (initialMetadata ?? (user?.metadata ?? {})) as Record<string, unknown>;
    setCompany((metadata.company as string) || "");
    setJobTitle((metadata.jobTitle as string) || "");
    setUniversity((metadata.university as string) || "");
    setQualification((metadata.qualification as string) || "");
    setGraduationYear((metadata.graduationYear as string) || "");
    const addr = (metadata.address as Record<string, unknown>) || {};
    setAddress1((addr.address1 as string) || (metadata.address as string) || "");
    setCity((addr.city as string) || "");
    setState((addr.state as string) || "");
    setCountry((addr.country as string) || (metadata.country as string) || "");
    setPostCode((addr.postCode as string) || (metadata.postcode as string) || "");
    setPhone((user?.phoneNumber as string) || "");
    setName((user?.name as string) || "");
    setProfilePictureUrl((user?.profilePictureUrl as string) || "");
  }, [user, initialMetadata]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setProfilePictureFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Immediately upload the file and get the URL
      setUploadingImage(true);
      try {
        const uploadedUrl = await uploadProfilePicture(file);
        
        // Validate that we got a proper URL
        if (uploadedUrl && typeof uploadedUrl === 'string' && uploadedUrl.trim()) {
          setProfilePictureUrl(uploadedUrl.trim());
        } else {
          throw new Error('Invalid URL received from upload');
        }
      } catch (err) {
        setError((err as Error)?.message || "Failed to upload profile picture");
        setProfilePictureFile(null);
        setProfilePicturePreview("");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const uploadProfilePicture = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${baseUrl}/frontegg/team/resources/profile/me/image/v1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload profile picture: ${response.status} ${errorText}`);
    }

    // Try to parse as JSON first
    let result;
    const responseText = await response.text();
    
    try {
      result = JSON.parse(responseText);
    } catch {
      // If not JSON, return the text response directly
      return responseText;
    }
    
    const url = result.url || result.profilePictureUrl || result.imageUrl || result;
    return url;
  };

  // Validate all required fields (except profile picture)
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    }
    if (!phone.trim()) {
      errors.phone = "Phone is required";
    }
    if (!company.trim()) {
      errors.company = "Company is required";
    }
    if (!jobTitle.trim()) {
      errors.jobTitle = "Job Title is required";
    }
    if (!university.trim()) {
      errors.university = "University/College is required";
    }
    if (!qualification.trim()) {
      errors.qualification = "Qualification is required";
    }
    if (!graduationYear.trim()) {
      errors.graduationYear = "Year of Graduation is required";
    }
    if (!address1.trim()) {
      errors.address1 = "Address line 1 is required";
    }
    if (!city.trim()) {
      errors.city = "City is required";
    }
    if (!state.trim()) {
      errors.state = "State is required";
    }
    if (!country.trim()) {
      errors.country = "Country is required";
    }
    if (!postCode.trim()) {
      errors.postCode = "Post code is required";
    }

    // Validate phone format if provided
    const trimmedPhone = (phone || "").toString().trim();
    if (trimmedPhone) {
      const e164 = /^\+?[1-9]\d{6,14}$/;
      if (!e164.test(trimmedPhone)) {
        errors.phone = "Please enter a valid phone number, e.g. +441234567890";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Validate all required fields
    if (!validateForm()) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);
    setValidationErrors({});

    try {
      // Validate phone in E.164 (+ and 7-15 digits). If invalid, block submit to avoid API error.
      const trimmedPhone = (phone || "").toString().trim();
      const e164 = /^\+?[1-9]\d{6,14}$/;
      if (trimmedPhone && !e164.test(trimmedPhone)) {
        throw new Error("Please enter a valid phone number, e.g. +441234567890");
      }

      const existingMetadataRaw = (initialMetadata ?? user?.metadata ?? {}) as unknown;
      const existingMetadata = ((): Record<string, unknown> => {
        if (!existingMetadataRaw) return {};
        if (typeof existingMetadataRaw === "string") {
          try { return JSON.parse(existingMetadataRaw) as Record<string, unknown>; } catch { return {}; }
        }
        if (typeof existingMetadataRaw === "object") return existingMetadataRaw as Record<string, unknown>;
        return {};
      })();
      const updatedMetadata = {
        ...existingMetadata,
        company,
        jobTitle,
        university,
        qualification,
        graduationYear,
        onboardingComplete: true, // Set onboarding flag
        address: {
          address1,
          city,
          state,
          postCode,
          country,
        },
      };

      const body = {
        name: name || undefined,
        phoneNumber: trimmedPhone || undefined,
        profilePictureUrl: profilePictureUrl || undefined,
        // Frontegg expects metadata as a JSON string
        metadata: JSON.stringify(updatedMetadata),
      } as Record<string, unknown>;

      // First, update metadata and name
      const res = await fetch(`${baseUrl}/identity/resources/users/v2/me`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }

      onComplete();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      style={{ 
        position: "fixed", 
        inset: 0, 
        background: "rgba(0, 0, 0, 0.75)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        zIndex: 9999,
        padding: "20px"
      }}
      onClick={(e) => {
        // Prevent closing by clicking outside
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        // Prevent closing by clicking outside
        e.stopPropagation();
      }}
    >
      <div 
        style={{ 
          background: "#ffffff", 
          borderRadius: 12, 
          width: "min(92vw, 560px)", 
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)", 
          border: "1px solid #e5e7eb" 
        }}
        onClick={(e) => {
          // Prevent closing by clicking on the modal content
          e.stopPropagation();
        }}
      >
        <div style={{ 
          padding: "20px 20px 0 20px",
          borderBottom: "1px solid #f3f4f6",
          flexShrink: 0
        }}>
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>Complete Your Profile</h2>
          <p style={{ marginTop: "8px", marginBottom: 0, color: "#666", fontSize: "0.875rem" }}>
            Please complete your profile information to continue. This will only take a moment.
          </p>
        </div>
        <div style={{ 
          flex: 1,
          overflowY: "auto",
          padding: "20px"
        }}>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Name <span style={{ color: "#b00020" }}>*</span></span>
            <input 
              value={name} 
              onChange={(e) => {
                setName(e.target.value);
                if (validationErrors.name) {
                  setValidationErrors(prev => {
                    const next = { ...prev };
                    delete next.name;
                    return next;
                  });
                }
              }} 
              style={{ 
                padding: 10, 
                borderRadius: 8, 
                border: validationErrors.name ? "1px solid #b00020" : "1px solid #e5e7eb", 
                background: "#fff" 
              }} 
              required 
            />
            {validationErrors.name && (
              <span style={{ color: "#b00020", fontSize: "0.875rem" }}>{validationErrors.name}</span>
            )}
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Profile Picture</span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input 
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploadingImage}
                style={{ 
                  padding: 8, 
                  borderRadius: 8, 
                  border: "1px solid #e5e7eb", 
                  background: uploadingImage ? "#f3f4f6" : "#fff",
                  fontSize: "0.875rem",
                  opacity: uploadingImage ? 0.6 : 1
                }} 
              />
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                Max 5MB, JPG/PNG/GIF
              </div>
            </div>
            {(profilePicturePreview || profilePictureUrl) && (
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <Image 
                  src={(profilePicturePreview || profilePictureUrl) as string} 
                  alt="Profile preview" 
                  width={60}
                  height={60}
                  unoptimized
                  style={{ 
                    borderRadius: "50%", 
                    objectFit: "cover",
                    border: "2px solid #e5e7eb"
                  }} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {uploadingImage && (
                  <div style={{ fontSize: "0.75rem", color: "#3b82f6" }}>
                    ⏳ Uploading {profilePictureFile?.name}...
                  </div>
                )}
                {profilePictureFile && !uploadingImage && (
                  <div style={{ fontSize: "0.75rem", color: "#059669" }}>
                    ✓ {profilePictureFile.name} uploaded successfully
                  </div>
                )}
              </div>
            )}
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Phone <span style={{ color: "#b00020" }}>*</span></span>
            <input 
              value={phone} 
              onChange={(e) => {
                setPhone(e.target.value);
                if (validationErrors.phone) {
                  setValidationErrors(prev => {
                    const next = { ...prev };
                    delete next.phone;
                    return next;
                  });
                }
              }} 
              style={{ 
                padding: 10, 
                borderRadius: 8, 
                border: validationErrors.phone ? "1px solid #b00020" : "1px solid #e5e7eb", 
                background: "#fff" 
              }} 
              required 
            />
            {validationErrors.phone && (
              <span style={{ color: "#b00020", fontSize: "0.875rem" }}>{validationErrors.phone}</span>
            )}
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Company <span style={{ color: "#b00020" }}>*</span></span>
            <input 
              value={company} 
              onChange={(e) => {
                setCompany(e.target.value);
                if (validationErrors.company) {
                  setValidationErrors(prev => {
                    const next = { ...prev };
                    delete next.company;
                    return next;
                  });
                }
              }} 
              style={{ 
                padding: 10, 
                borderRadius: 8, 
                border: validationErrors.company ? "1px solid #b00020" : "1px solid #e5e7eb", 
                background: "#fff" 
              }} 
              required 
            />
            {validationErrors.company && (
              <span style={{ color: "#b00020", fontSize: "0.875rem" }}>{validationErrors.company}</span>
            )}
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Job Title <span style={{ color: "#b00020" }}>*</span></span>
            <input 
              value={jobTitle} 
              onChange={(e) => {
                setJobTitle(e.target.value);
                if (validationErrors.jobTitle) {
                  setValidationErrors(prev => {
                    const next = { ...prev };
                    delete next.jobTitle;
                    return next;
                  });
                }
              }} 
              style={{ 
                padding: 10, 
                borderRadius: 8, 
                border: validationErrors.jobTitle ? "1px solid #b00020" : "1px solid #e5e7eb", 
                background: "#fff" 
              }} 
              required 
            />
            {validationErrors.jobTitle && (
              <span style={{ color: "#b00020", fontSize: "0.875rem" }}>{validationErrors.jobTitle}</span>
            )}
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Name of University or College <span style={{ color: "#b00020" }}>*</span></span>
            <input 
              value={university} 
              onChange={(e) => {
                setUniversity(e.target.value);
                if (validationErrors.university) {
                  setValidationErrors(prev => {
                    const next = { ...prev };
                    delete next.university;
                    return next;
                  });
                }
              }} 
              style={{ 
                padding: 10, 
                borderRadius: 8, 
                border: validationErrors.university ? "1px solid #b00020" : "1px solid #e5e7eb", 
                background: "#fff" 
              }} 
              required 
            />
            {validationErrors.university && (
              <span style={{ color: "#b00020", fontSize: "0.875rem" }}>{validationErrors.university}</span>
            )}
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Qualifications <span style={{ color: "#b00020" }}>*</span></span>
            <select 
              value={qualification} 
              onChange={(e) => {
                setQualification(e.target.value);
                if (validationErrors.qualification) {
                  setValidationErrors(prev => {
                    const next = { ...prev };
                    delete next.qualification;
                    return next;
                  });
                }
              }} 
              style={{ 
                padding: 10, 
                borderRadius: 8, 
                border: validationErrors.qualification ? "1px solid #b00020" : "1px solid #e5e7eb", 
                background: "#fff" 
              }}
              required
            >
              <option value="">Select</option>
              <option value="Bachelors">Bachelors</option>
              <option value="Masters">Masters</option>
              <option value="PhD">PhD</option>
              <option value="Diploma">Diploma</option>
            </select>
            {validationErrors.qualification && (
              <span style={{ color: "#b00020", fontSize: "0.875rem" }}>{validationErrors.qualification}</span>
            )}
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Year of Graduation <span style={{ color: "#b00020" }}>*</span></span>
            <input 
              value={graduationYear} 
              onChange={(e) => {
                setGraduationYear(e.target.value);
                if (validationErrors.graduationYear) {
                  setValidationErrors(prev => {
                    const next = { ...prev };
                    delete next.graduationYear;
                    return next;
                  });
                }
              }} 
              placeholder="e.g. 2023" 
              style={{ 
                padding: 10, 
                borderRadius: 8, 
                border: validationErrors.graduationYear ? "1px solid #b00020" : "1px solid #e5e7eb", 
                background: "#fff" 
              }} 
              required 
            />
            {validationErrors.graduationYear && (
              <span style={{ color: "#b00020", fontSize: "0.875rem" }}>{validationErrors.graduationYear}</span>
            )}
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Address line 1 <span style={{ color: "#b00020" }}>*</span></span>
            <input 
              value={address1} 
              onChange={(e) => {
                setAddress1(e.target.value);
                if (validationErrors.address1) {
                  setValidationErrors(prev => {
                    const next = { ...prev };
                    delete next.address1;
                    return next;
                  });
                }
              }} 
              style={{ 
                padding: 10, 
                borderRadius: 8, 
                border: validationErrors.address1 ? "1px solid #b00020" : "1px solid #e5e7eb", 
                background: "#fff" 
              }} 
              required 
            />
            {validationErrors.address1 && (
              <span style={{ color: "#b00020", fontSize: "0.875rem" }}>{validationErrors.address1}</span>
            )}
          </label>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: 12 
          }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>City <span style={{ color: "#b00020" }}>*</span></span>
              <input 
                value={city} 
                onChange={(e) => {
                  setCity(e.target.value);
                  if (validationErrors.city) {
                    setValidationErrors(prev => {
                      const next = { ...prev };
                      delete next.city;
                      return next;
                    });
                  }
                }} 
                style={{ 
                  padding: 10, 
                  borderRadius: 8, 
                  border: validationErrors.city ? "1px solid #b00020" : "1px solid #e5e7eb", 
                  background: "#fff" 
                }} 
                required 
              />
              {validationErrors.city && (
                <span style={{ color: "#b00020", fontSize: "0.875rem" }}>{validationErrors.city}</span>
              )}
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>State <span style={{ color: "#b00020" }}>*</span></span>
              <input 
                value={state} 
                onChange={(e) => {
                  setState(e.target.value);
                  if (validationErrors.state) {
                    setValidationErrors(prev => {
                      const next = { ...prev };
                      delete next.state;
                      return next;
                    });
                  }
                }} 
                style={{ 
                  padding: 10, 
                  borderRadius: 8, 
                  border: validationErrors.state ? "1px solid #b00020" : "1px solid #e5e7eb", 
                  background: "#fff" 
                }} 
                required 
              />
              {validationErrors.state && (
                <span style={{ color: "#b00020", fontSize: "0.875rem" }}>{validationErrors.state}</span>
              )}
            </label>
          </div>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Country <span style={{ color: "#b00020" }}>*</span></span>
            <select 
              value={country} 
              onChange={(e) => {
                setCountry(e.target.value);
                if (validationErrors.country) {
                  setValidationErrors(prev => {
                    const next = { ...prev };
                    delete next.country;
                    return next;
                  });
                }
              }} 
              style={{ 
                padding: 10, 
                borderRadius: 8, 
                border: validationErrors.country ? "1px solid #b00020" : "1px solid #e5e7eb", 
                background: "#fff" 
              }}
              required
            >
              <option value="">Select</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Nigeria">Nigeria</option>
            </select>
            {validationErrors.country && (
              <span style={{ color: "#b00020", fontSize: "0.875rem" }}>{validationErrors.country}</span>
            )}
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Post code <span style={{ color: "#b00020" }}>*</span></span>
            <input 
              value={postCode} 
              onChange={(e) => {
                setPostCode(e.target.value);
                if (validationErrors.postCode) {
                  setValidationErrors(prev => {
                    const next = { ...prev };
                    delete next.postCode;
                    return next;
                  });
                }
              }} 
              style={{ 
                padding: 10, 
                borderRadius: 8, 
                border: validationErrors.postCode ? "1px solid #b00020" : "1px solid #e5e7eb", 
                background: "#fff" 
              }} 
              required 
            />
            {validationErrors.postCode && (
              <span style={{ color: "#b00020", fontSize: "0.875rem" }}>{validationErrors.postCode}</span>
            )}
          </label>

            {error ? <div style={{ color: "#b00020" }}>{error}</div> : null}
          </form>
        </div>
        <div style={{ 
          padding: "20px",
          borderTop: "1px solid #f3f4f6",
          flexShrink: 0
        }}>
          <div style={{ 
            display: "flex", 
            gap: 8, 
            justifyContent: "flex-end",
            flexWrap: "wrap"
          }}>
            <button 
              type="submit" 
              disabled={submitting} 
              onClick={handleSubmit} 
              style={{ 
                padding: "8px 12px", 
                borderRadius: 8, 
                background: "var(--accent)", 
                color: "var(--accent-contrast)", 
                border: "1px solid var(--accent)", 
                cursor: submitting ? "not-allowed" : "pointer",
                minWidth: "120px",
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? "Saving..." : "Complete Profile"}
            </button>
          </div>
          {Object.keys(validationErrors).length > 0 && (
            <div style={{ 
              padding: "12px", 
              marginTop: "12px", 
              background: "#fee", 
              border: "1px solid #fcc", 
              borderRadius: 8, 
              color: "#c33", 
              fontSize: "0.875rem" 
            }}>
              Please fill in all required fields marked with <span style={{ color: "#b00020" }}>*</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

