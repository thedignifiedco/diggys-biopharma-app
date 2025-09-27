"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@frontegg/nextjs";
import { AdminPortal } from "@frontegg/nextjs";
import Link from "next/link";
import UserEditModal from "@/components/UserEditModal";
import SubscriptionModal from "@/components/SubscriptionModal";

type FronteggUser = {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  metadata?: Record<string, unknown> | string;
  subscriptions?: Array<{
    id?: string;
    planId?: string;
    planName?: string;
    expirationDate?: string;
  }>;
};


export default function AdminPage() {
  const { isAuthenticated, user } = useAuth();
  const accessToken = useMemo(() => (user as unknown as { accessToken?: string })?.accessToken || "", [user]);
  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_FRONTEGG_BASE_URL || "https://dignifiedlabs-dev.frontegg.com", []);

  const [users, setUsers] = useState<FronteggUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<FronteggUser | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [planNameMap, setPlanNameMap] = useState<Record<string, string>>({});
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [vendorToken, setVendorToken] = useState<string>("");

  // Initialize vendor token once on page load
  const initializeVendorToken = useCallback(async (): Promise<string> => {
    // Check if we already have a valid token in state
    if (vendorToken) {
      return vendorToken;
    }

    // Check localStorage for cached token
    const cached = localStorage.getItem("frontegg_vendor_token");
    const cachedExpiry = localStorage.getItem("frontegg_vendor_token_expiry");
    
    if (cached && cachedExpiry && Date.now() < parseInt(cachedExpiry)) {
      setVendorToken(cached);
      return cached;
    }

    // Fetch new token
    const clientId = process.env.NEXT_PUBLIC_FRONTEGG_CLIENT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FRONTEGG_API_KEY;
    
    if (!clientId || !apiKey) {
      throw new Error("Missing Frontegg credentials");
    }

    const response = await fetch("https://api.frontegg.com/auth/vendor/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, secret: apiKey }),
    });

    if (!response.ok) {
      throw new Error("Failed to get vendor token");
    }

    const data = await response.json();
    const token = data.token;
    const expiresIn = data.expiresIn || 3600; // Default to 1 hour
    
    // Store in localStorage and state
    localStorage.setItem("frontegg_vendor_token", token);
    localStorage.setItem("frontegg_vendor_token_expiry", (Date.now() + expiresIn * 1000).toString());
    setVendorToken(token);
    
    return token;
  }, [vendorToken]);

  // Fetch user subscription data
  const fetchUserSubscriptions = useCallback(async (userId: string): Promise<FronteggUser['subscriptions']> => {
    try {
      if (!vendorToken) {
        console.error("No vendor token available");
        return [];
      }

      const response = await fetch(`https://api.frontegg.com/entitlements/resources/entitlements/v2?userId=${userId}`, {
        headers: {
          "Authorization": `Bearer ${vendorToken}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const entitlements = data.items || data.entitlements || [];
      
      return entitlements.map((entitlement: Record<string, unknown>) => ({
        id: entitlement.id,
        planId: entitlement.planId,
        planName: entitlement.planName || (entitlement.plan as Record<string, unknown>)?.name,
        expirationDate: entitlement.expirationDate,
      }));
    } catch (error) {
      console.error("Failed to fetch user subscriptions:", error);
      return [];
    }
  }, [vendorToken]);

  // Fetch all subscription plans to create a name mapping
  const fetchSubscriptionPlans = useCallback(async (): Promise<Record<string, string>> => {
    try {
      if (!vendorToken) {
        console.error("No vendor token available");
        return {};
      }

      const response = await fetch("https://api.frontegg.com/entitlements/resources/plans/v1", {
        headers: {
          "Authorization": `Bearer ${vendorToken}`,
        },
      });

      if (!response.ok) {
        return {};
      }

      const data = await response.json();
      const plans = data.items || [];
      
      const nameMap: Record<string, string> = {};
      plans.forEach((plan: Record<string, unknown>) => {
        nameMap[String(plan.id)] = String(plan.name);
      });
      
      return nameMap;
    } catch (error) {
      console.error("Failed to fetch subscription plans:", error);
      return {};
    }
  }, [vendorToken]);

  // Toggle user expansion
  const toggleUserExpansion = useCallback((userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  // Check if user has admin role
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const userRoles = (user as unknown as { roles?: Array<{ name: string }> })?.roles || [];
    return userRoles.some((role) => role.name === "Admin" || role.name === "admin");
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Initialize vendor token first
        await initializeVendorToken();

        const res = await fetch(`${baseUrl}/identity/resources/users/v2`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error(`Failed to load users: ${res.status}`);
        const data = (await res.json()) as unknown as { data?: FronteggUser[]; items?: FronteggUser[]; content?: FronteggUser[] } | FronteggUser[];
        const maybeObj = data as { data?: FronteggUser[]; items?: FronteggUser[]; content?: FronteggUser[] };
        const normalized: FronteggUser[] = Array.isArray(maybeObj?.data)
          ? maybeObj.data as FronteggUser[]
          : Array.isArray(maybeObj?.items)
          ? maybeObj.items as FronteggUser[]
          : Array.isArray(maybeObj?.content)
          ? maybeObj.content as FronteggUser[]
          : Array.isArray(data as FronteggUser[])
          ? (data as FronteggUser[])
          : [];

        // Fetch subscription plans mapping first
        const planMapping = await fetchSubscriptionPlans();
        setPlanNameMap(planMapping);

        // Fetch subscription data for each user
        const usersWithSubscriptions = await Promise.all(
          normalized.map(async (user) => {
            const subscriptions = await fetchUserSubscriptions(user.id);
            // Map plan names using the fetched plan mapping
            const subscriptionsWithNames = (subscriptions || []).map(sub => ({
              ...sub,
              planName: sub.planId ? planMapping[sub.planId] || sub.planName || "Unknown Plan" : "Unknown Plan"
            }));
            return { ...user, subscriptions: subscriptionsWithNames };
          })
        );

        setUsers(usersWithSubscriptions);
      } catch (e) {
        setError((e as Error)?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, accessToken, baseUrl, initializeVendorToken, fetchUserSubscriptions, fetchSubscriptionPlans, refreshCounter]);

  if (!isAuthenticated) {
    return (
      <div style={{ 
        padding: 40, 
        textAlign: "center",
        maxWidth: 600,
        margin: "0 auto"
      }}>
        <h1>Access Denied</h1>
        <p>Please sign in to access the admin dashboard.</p>
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

  if (!isAdmin) {
    return (
      <div style={{ 
        padding: 40, 
        textAlign: "center",
        maxWidth: 600,
        margin: "0 auto"
      }}>
        <h1>Unauthorized Access</h1>
        <p>You don&apos;t have admin privileges to access this page.</p>
        <div style={{ marginTop: 24, display: "flex", gap: 16, justifyContent: "center" }}>
          <Link href="/profile" style={{
            padding: "12px 24px",
            background: "var(--accent)",
            color: "var(--accent-contrast)",
            textDecoration: "none",
            borderRadius: 8
          }}>
            View Profile
          </Link>
          <Link href="/" style={{
            padding: "12px 24px",
            background: "#fff",
            color: "var(--accent)",
            border: "2px solid var(--accent)",
            textDecoration: "none",
            borderRadius: 8
          }}>
            Go to Home
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div style={{ 
      padding: "24px", 
      maxWidth: "1200px", 
      margin: "0 auto"
    }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: 32,
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "2rem", fontWeight: 700, color: "#333" }}>Admin Dashboard</h1>
          <p style={{ margin: 0, color: "#666" }}>Manage users and their information</p>
        </div>
        <button 
          onClick={() => AdminPortal.show()} 
          style={{ 
            padding: "12px 20px", 
            borderRadius: 8, 
            background: "var(--accent)", 
            color: "var(--accent-contrast)", 
            border: "none", 
            cursor: "pointer",
            fontWeight: 600,
            transition: "background-color 0.2s"
          }}
        >
          Account Settings
        </button>
      </div>

      {loading ? (
        <div style={{ 
          textAlign: "center", 
          padding: "40px", 
          color: "#666",
          fontSize: "1.125rem"
        }}>
          Loading users...
        </div>
      ) : null}

      {error ? (
        <div style={{ 
          background: "#f8d7da", 
          color: "#721c24", 
          border: "1px solid #f5c6cb", 
          borderRadius: 8, 
          padding: "16px", 
          marginBottom: 24 
        }}>
          {error}
        </div>
      ) : null}

      <div style={{ 
        background: "#fff", 
        border: "1px solid #e5e7eb", 
        borderRadius: 12, 
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        marginTop: 24
      }}>
        {users.map((u, index) => {
          const metadata = typeof u.metadata === "string" 
            ? (() => { try { return JSON.parse(u.metadata); } catch { return {}; } })() 
            : (u.metadata || {} as Record<string, unknown>);
          const address = metadata.address as Record<string, unknown> || {};
          const addressLine = [address.address1, address.city, address.state].filter(Boolean).join(", ");
          const isExpanded = expandedUsers.has(u.id);
          const userRoles = (u as unknown as { roles?: Array<{ name: string }> })?.roles || [];
          const roleNames = userRoles.map((role: { name: string }) => role.name).join(", ") || "User";
          
          return (
            <div key={u.id}>
              {/* Main Row */}
              <div 
                onClick={() => toggleUserExpansion(u.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderBottom: index < users.length - 1 ? "1px solid #f3f4f6" : "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  background: isExpanded ? "#f8fafc" : "#fff"
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), #4d90ff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "1rem",
                  marginRight: 16,
                  flexShrink: 0
                }}>
                  {(u.name || u.email || "U").charAt(0).toUpperCase()}
                </div>

                {/* Basic Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: "1rem", 
                      fontWeight: 600, 
                      color: "#111827",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {u.name || "No Name"}
                    </h3>
                    <span style={{
                      padding: "2px 8px",
                      background: "#e0f2fe",
                      color: "#0369a1",
                      borderRadius: 12,
                      fontSize: "0.75rem",
                      fontWeight: 500
                    }}>
                      {roleNames}
                    </span>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    color: "#6b7280", 
                    fontSize: "0.875rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {u.email || "No Email"}
                  </p>
                </div>

                {/* Subscription Status */}
                <div style={{ marginRight: 16, minWidth: 120 }}>
                  {u.subscriptions && u.subscriptions.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {u.subscriptions.slice(0, 2).map((sub, idx) => (
                        <div key={sub.id || idx} style={{
                          padding: "4px 8px",
                          background: sub.expirationDate && new Date(sub.expirationDate) > new Date() 
                            ? "#f0fdf4" 
                            : "#fef2f2",
                          border: `1px solid ${sub.expirationDate && new Date(sub.expirationDate) > new Date() 
                            ? "#bbf7d0" 
                            : "#fecaca"}`,
                          borderRadius: 6,
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: sub.expirationDate && new Date(sub.expirationDate) > new Date() 
                            ? "#166534" 
                            : "#dc2626",
                          textAlign: "center"
                        }}>
                          {sub.planName || "Unknown Plan"}
                        </div>
                      ))}
                      {u.subscriptions.length > 2 && (
                        <div style={{
                          padding: "4px 8px",
                          background: "#f3f4f6",
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          textAlign: "center"
                        }}>
                          +{u.subscriptions.length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      padding: "4px 8px",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      textAlign: "center"
                    }}>
                      No subscriptions
                    </div>
                  )}
                </div>

                {/* Expand/Collapse Icon */}
                <div style={{
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                  transition: "transform 0.2s",
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)"
                }}>
                  ▼
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{
                  padding: "20px 20px 20px 76px",
                  background: "#f8fafc",
                  borderBottom: index < users.length - 1 ? "1px solid #f3f4f6" : "none"
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    {/* Row 1: Professional Information | Address */}
                    <div>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "0.875rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Professional Information
                      </h4>
                      <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Job Title:</span>
                          <span style={{ color: "#111827", fontSize: "0.875rem", fontWeight: 500 }}>
                            {String(metadata.jobTitle || "Not specified")}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>University:</span>
                          <span style={{ color: "#111827", fontSize: "0.875rem", fontWeight: 500 }}>
                            {String(metadata.university || "Not specified")}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Qualification:</span>
                          <span style={{ color: "#111827", fontSize: "0.875rem", fontWeight: 500 }}>
                            {String(metadata.qualification || "Not specified")}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Graduation Year:</span>
                          <span style={{ color: "#111827", fontSize: "0.875rem", fontWeight: 500 }}>
                            {String(metadata.graduationYear || "Not specified")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "0.875rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Address
                      </h4>
                      <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Address:</span>
                          <span style={{ color: "#111827", fontSize: "0.875rem", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>
                            {addressLine || "Not provided"}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Country:</span>
                          <span style={{ color: "#111827", fontSize: "0.875rem", fontWeight: 500 }}>
                            {String(address.country || "Not specified")}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Postcode:</span>
                          <span style={{ color: "#111827", fontSize: "0.875rem", fontWeight: 500 }}>
                            {String(address.postCode || "Not specified")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Subscription Details | Contact Details */}
                    <div>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "0.875rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Subscription Details
                      </h4>
                      {u.subscriptions && u.subscriptions.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {u.subscriptions.map((sub, idx) => (
                            <div key={sub.id || idx} style={{
                              padding: 12,
                              background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                              border: "1px solid #bae6fd",
                              borderRadius: 8,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}>
                              <div>
                                <div style={{ fontWeight: 600, color: "#0369a1", fontSize: "0.875rem" }}>
                                  {sub.planName || "Unknown Plan"}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "#0284c7" }}>
                                  Expires: {sub.expirationDate 
                                    ? new Date(sub.expirationDate).toLocaleDateString()
                                    : "No expiration"
                                  }
                                </div>
                              </div>
                              <div style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: sub.expirationDate && new Date(sub.expirationDate) > new Date() ? "#10b981" : "#ef4444"
                              }} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          padding: 16,
                          background: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          textAlign: "center",
                          color: "#6b7280",
                          fontSize: "0.875rem"
                        }}>
                          No active subscriptions
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "0.875rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Contact Details
                      </h4>
                      <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Phone:</span>
                          <span style={{ color: "#111827", fontSize: "0.875rem", fontWeight: 500 }}>
                            {u.phoneNumber || "Not provided"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ 
                    display: "flex", 
                    gap: 12, 
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: "1px solid #e5e7eb"
                  }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(u);
                      }}
                      style={{ 
                        padding: "10px 20px", 
                        borderRadius: 8, 
                        border: "1px solid var(--accent)", 
                        background: "#fff", 
                        color: "var(--accent)",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all 0.2s",
                        fontSize: "0.875rem"
                      }}
                    >
                      Edit Profile
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(u);
                        setShowSubscriptionModal(true);
                      }}
                      style={{ 
                        padding: "10px 20px", 
                        borderRadius: 8, 
                        border: "1px solid #10b981", 
                        background: "#fff", 
                        color: "#10b981",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all 0.2s",
                        fontSize: "0.875rem"
                      }}
                    >
                      Manage Subscriptions
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <UserEditModal
        isOpen={!!selectedUser && !showSubscriptionModal}
        onClose={() => setSelectedUser(null)}
        onUpdated={() => {
          setRefreshCounter(prev => prev + 1);
        }}
        user={(selectedUser as unknown as FronteggUser) || { id: "" }}
        vendorToken={vendorToken}
      />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => {
          setShowSubscriptionModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser || { id: "" }}
        vendorToken={vendorToken}
        planNameMap={planNameMap}
        onUpdated={() => {
          setRefreshCounter(prev => prev + 1);
        }}
      />
    </div>
  );
}


