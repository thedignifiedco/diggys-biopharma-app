"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@frontegg/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ClinicalTrial = {
  id: string;
  name: string;
  status: "Active" | "Recruiting" | "Completed" | "Suspended";
  phase: string;
  indication: string;
  startDate: string;
  enrollment: number;
  targetEnrollment: number;
  principalInvestigator: string;
};

type ResearchDocument = {
  id: string;
  title: string;
  type: "Protocol" | "Study Report" | "Data Analysis" | "Regulatory Submission";
  uploadDate: string;
  size: string;
  accessLevel: "approved_user" | "admin";
};

export default function ResearchPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Check if user has approved_user or admin role
  const hasAccess = useMemo(() => {
    if (!user) return false;
    const userRoles = (user as unknown as { roles?: Array<{ name: string }> })?.roles || [];
    return userRoles.some((role) => 
      role.name === "approved_user" || 
      role.name === "Approved User" ||
      role.name === "Admin" || 
      role.name === "admin"
    );
  }, [user]);

  // Filter documents based on user role - must be called before any conditional returns
  const userRole = useMemo(() => {
    if (!user) return "";
    const userRoles = (user as unknown as { roles?: Array<{ name: string }> })?.roles || [];
    const adminRole = userRoles.find((role) => role.name === "Admin" || role.name === "admin");
    return adminRole ? "admin" : "approved_user";
  }, [user]);

  // Mock clinical trials data
  const clinicalTrials: ClinicalTrial[] = [
    {
      id: "CT-2024-001",
      name: "Phase III Trial: Novel Immunotherapy for Metastatic Melanoma",
      status: "Active",
      phase: "Phase III",
      indication: "Metastatic Melanoma",
      startDate: "2024-01-15",
      enrollment: 247,
      targetEnrollment: 300,
      principalInvestigator: "Dr. Sarah Chen, MD, PhD"
    },
    {
      id: "CT-2024-002",
      name: "Phase II Study: Targeted Therapy for Non-Small Cell Lung Cancer",
      status: "Recruiting",
      phase: "Phase II",
      indication: "NSCLC with EGFR Mutations",
      startDate: "2024-03-01",
      enrollment: 89,
      targetEnrollment: 150,
      principalInvestigator: "Dr. Michael Rodriguez, MD"
    },
    {
      id: "CT-2023-045",
      name: "Phase I/II Trial: CAR-T Cell Therapy for Acute Lymphoblastic Leukemia",
      status: "Active",
      phase: "Phase I/II",
      indication: "Relapsed/Refractory ALL",
      startDate: "2023-11-20",
      enrollment: 42,
      targetEnrollment: 60,
      principalInvestigator: "Dr. Emily Watson, MD"
    },
    {
      id: "CT-2023-038",
      name: "Phase III Study: Monoclonal Antibody for Rheumatoid Arthritis",
      status: "Completed",
      phase: "Phase III",
      indication: "Rheumatoid Arthritis",
      startDate: "2022-06-10",
      enrollment: 512,
      targetEnrollment: 500,
      principalInvestigator: "Dr. James Anderson, MD"
    }
  ];

  // Mock research documents
  const researchDocuments: ResearchDocument[] = [
    {
      id: "DOC-001",
      title: "Protocol v3.2 - Melanoma Immunotherapy Study",
      type: "Protocol",
      uploadDate: "2024-02-15",
      size: "2.4 MB",
      accessLevel: "approved_user"
    },
    {
      id: "DOC-002",
      title: "Interim Analysis Report - NSCLC Targeted Therapy",
      type: "Study Report",
      uploadDate: "2024-04-20",
      size: "5.8 MB",
      accessLevel: "approved_user"
    },
    {
      id: "DOC-003",
      title: "FDA IND Submission - CAR-T Cell Therapy",
      type: "Regulatory Submission",
      uploadDate: "2023-10-05",
      size: "12.3 MB",
      accessLevel: "admin"
    },
    {
      id: "DOC-004",
      title: "Biomarker Analysis - Phase II Study Data",
      type: "Data Analysis",
      uploadDate: "2024-05-10",
      size: "8.1 MB",
      accessLevel: "approved_user"
    },
    {
      id: "DOC-005",
      title: "Safety Monitoring Plan - All Active Trials",
      type: "Protocol",
      uploadDate: "2024-01-30",
      size: "3.2 MB",
      accessLevel: "admin"
    }
  ];

  // Filter documents based on user role - must be computed before conditional returns
  const accessibleDocuments = useMemo(() => {
    return researchDocuments.filter(doc => 
      doc.accessLevel === "approved_user" || userRole === "admin"
    );
  }, [userRole]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div style={{ 
        padding: 40, 
        textAlign: "center",
        maxWidth: 600,
        margin: "0 auto"
      }}>
        <h1>Access Denied</h1>
        <p>Please sign in to access the Clinical Research Portal.</p>
        <Link href="/" style={{
          display: "inline-block",
          marginTop: 16,
          padding: "12px 24px",
          background: "var(--accent)",
          color: "var(--accent-contrast)",
          textDecoration: "none",
          borderRadius: 8
        }}>
          Go to Home
        </Link>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div style={{ 
        padding: 40, 
        textAlign: "center",
        maxWidth: 600,
        margin: "0 auto"
      }}>
        <h1>🔒 Unauthorized Access</h1>
        <p style={{ fontSize: "1.125rem", color: "#666", marginBottom: 8 }}>
          This content is restricted to approved users and administrators.
        </p>
        <p style={{ color: "#888", marginBottom: 24 }}>
          The Clinical Research Portal contains sensitive research data and regulatory information 
          that requires appropriate authorization to access.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/profile" style={{
            padding: "12px 24px",
            background: "var(--accent)",
            color: "var(--accent-contrast)",
            textDecoration: "none",
            borderRadius: 8,
            fontWeight: 600
          }}>
            View Profile
          </Link>
          <Link href="/" style={{
            padding: "12px 24px",
            background: "#fff",
            color: "var(--accent)",
            border: "2px solid var(--accent)",
            textDecoration: "none",
            borderRadius: 8,
            fontWeight: 600
          }}>
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        padding: 40, 
        textAlign: "center",
        maxWidth: 600,
        margin: "0 auto"
      }}>
        <div style={{ fontSize: "1.5rem", marginBottom: 16 }}>⏳</div>
        <p>Loading Clinical Research Portal...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "#10b981";
      case "Recruiting":
        return "#3b82f6";
      case "Completed":
        return "#6b7280";
      case "Suspended":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getEnrollmentProgress = (enrollment: number, target: number) => {
    return Math.min((enrollment / target) * 100, 100);
  };

  return (
    <div style={{ 
      padding: "24px", 
      maxWidth: "1400px", 
      margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: 32,
        paddingBottom: 24,
        borderBottom: "2px solid #e5e7eb"
      }}>
        <h1 style={{ 
          margin: "0 0 8px 0", 
          fontSize: "2.5rem", 
          fontWeight: 700, 
          color: "#333",
          background: "linear-gradient(135deg, #3b82f6, #10b981)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          🧬 Clinical Research Portal
        </h1>
        <p style={{ margin: 0, color: "#666", fontSize: "1.125rem" }}>
          Access to clinical trial data, research documents, and regulatory submissions
        </p>
      </div>

      {/* Stats Overview */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: 16,
        marginBottom: 32
      }}>
        <div style={{ 
          padding: 20, 
          background: "#f0f9ff", 
          border: "1px solid #bae6fd", 
          borderRadius: 12 
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#0369a1" }}>
            {clinicalTrials.filter(t => t.status === "Active").length}
          </div>
          <div style={{ color: "#075985", fontWeight: 600 }}>Active Trials</div>
        </div>
        <div style={{ 
          padding: 20, 
          background: "#ecfdf5", 
          border: "1px solid #86efac", 
          borderRadius: 12 
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#047857" }}>
            {clinicalTrials.filter(t => t.status === "Recruiting").length}
          </div>
          <div style={{ color: "#065f46", fontWeight: 600 }}>Recruiting</div>
        </div>
        <div style={{ 
          padding: 20, 
          background: "#fef3c7", 
          border: "1px solid #fde68a", 
          borderRadius: 12 
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#92400e" }}>
            {clinicalTrials.reduce((sum, t) => sum + t.enrollment, 0)}
          </div>
          <div style={{ color: "#78350f", fontWeight: 600 }}>Total Enrolled</div>
        </div>
        <div style={{ 
          padding: 20, 
          background: "#f3f4f6", 
          border: "1px solid #d1d5db", 
          borderRadius: 12 
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#374151" }}>
            {accessibleDocuments.length}
          </div>
          <div style={{ color: "#4b5563", fontWeight: 600 }}>Available Documents</div>
        </div>
      </div>

      {/* Clinical Trials Section */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ 
          margin: "0 0 24px 0", 
          fontSize: "1.75rem", 
          fontWeight: 600, 
          color: "#333" 
        }}>
          Active Clinical Trials
        </h2>
        <div style={{ 
          display: "grid", 
          gap: 16 
        }}>
          {clinicalTrials.map((trial) => (
            <div 
              key={trial.id}
              style={{ 
                padding: 24, 
                background: "#fff", 
                border: "1px solid #e5e7eb", 
                borderRadius: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 16
              }}>
                <div style={{ flex: 1, minWidth: 300 }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 12, 
                    marginBottom: 8 
                  }}>
                    <span style={{ 
                      padding: "4px 12px", 
                      borderRadius: 6, 
                      fontSize: "0.75rem", 
                      fontWeight: 600,
                      background: getStatusColor(trial.status) + "20",
                      color: getStatusColor(trial.status)
                    }}>
                      {trial.status}
                    </span>
                    <span style={{ 
                      padding: "4px 12px", 
                      borderRadius: 6, 
                      fontSize: "0.75rem", 
                      fontWeight: 600,
                      background: "#f3f4f6",
                      color: "#4b5563"
                    }}>
                      {trial.phase}
                    </span>
                  </div>
                  <h3 style={{ 
                    margin: "0 0 8px 0", 
                    fontSize: "1.25rem", 
                    fontWeight: 600,
                    color: "#111"
                  }}>
                    {trial.name}
                  </h3>
                  <div style={{ 
                    display: "flex", 
                    flexWrap: "wrap", 
                    gap: 16, 
                    color: "#666",
                    fontSize: "0.875rem"
                  }}>
                    <span><strong>Trial ID:</strong> {trial.id}</span>
                    <span><strong>Indication:</strong> {trial.indication}</span>
                    <span><strong>PI:</strong> {trial.principalInvestigator}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: 16 }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  marginBottom: 8,
                  fontSize: "0.875rem",
                  color: "#666"
                }}>
                  <span>Enrollment Progress</span>
                  <span><strong>{trial.enrollment}</strong> / {trial.targetEnrollment} participants</span>
                </div>
                <div style={{ 
                  width: "100%", 
                  height: 8, 
                  background: "#e5e7eb", 
                  borderRadius: 4,
                  overflow: "hidden"
                }}>
                  <div style={{ 
                    width: `${getEnrollmentProgress(trial.enrollment, trial.targetEnrollment)}%`,
                    height: "100%",
                    background: getStatusColor(trial.status),
                    transition: "width 0.3s"
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Research Documents Section */}
      <div>
        <h2 style={{ 
          margin: "0 0 24px 0", 
          fontSize: "1.75rem", 
          fontWeight: 600, 
          color: "#333" 
        }}>
          Research Documents
        </h2>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
          gap: 16 
        }}>
          {accessibleDocuments.map((doc) => (
            <div 
              key={doc.id}
              style={{ 
                padding: 20, 
                background: "#fff", 
                border: "1px solid #e5e7eb", 
                borderRadius: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{ 
                display: "flex", 
                alignItems: "flex-start", 
                gap: 12,
                marginBottom: 12
              }}>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 8,
                  background: doc.type === "Protocol" ? "#dbeafe" : 
                              doc.type === "Study Report" ? "#d1fae5" :
                              doc.type === "Regulatory Submission" ? "#fef3c7" : "#e9d5ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  flexShrink: 0
                }}>
                  {doc.type === "Protocol" ? "📋" : 
                   doc.type === "Study Report" ? "📊" :
                   doc.type === "Regulatory Submission" ? "📑" : "📈"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ 
                    margin: "0 0 4px 0", 
                    fontSize: "1rem", 
                    fontWeight: 600,
                    color: "#111",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {doc.title}
                  </h3>
                  <div style={{ 
                    fontSize: "0.75rem", 
                    color: "#6b7280",
                    marginBottom: 8
                  }}>
                    {doc.type}
                  </div>
                </div>
              </div>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                fontSize: "0.875rem",
                color: "#9ca3af",
                paddingTop: 12,
                borderTop: "1px solid #f3f4f6"
              }}>
                <span>{doc.uploadDate}</span>
                <span>{doc.size}</span>
              </div>
              {doc.accessLevel === "admin" && (
                <div style={{ 
                  marginTop: 8,
                  padding: "4px 8px",
                  background: "#fef3c7",
                  borderRadius: 4,
                  fontSize: "0.75rem",
                  color: "#92400e",
                  fontWeight: 600
                }}>
                  Admin Only
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div style={{ 
        marginTop: 48,
        padding: 20,
        background: "#f0f9ff",
        border: "1px solid #bae6fd",
        borderRadius: 12,
        textAlign: "center"
      }}>
        <p style={{ margin: 0, color: "#075985" }}>
          <strong>🔐 Confidential Information:</strong> All data in this portal is confidential and 
          subject to regulatory compliance. Access is logged and monitored.
        </p>
      </div>
    </div>
  );
}

