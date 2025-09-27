"use client";
import { useState, useEffect, useCallback } from "react";

type SubscriptionPlan = {
  id: string;
  name: string;
  description?: string;
};

type FronteggUser = {
  id: string;
  name?: string;
  email?: string;
  subscriptions?: Array<{
    id?: string;
    planId?: string;
    planName?: string;
    expirationDate?: string;
  }>;
};

type SubscriptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: FronteggUser;
  vendorToken: string;
  planNameMap: Record<string, string>;
  onUpdated: () => void;
};

export default function SubscriptionModal({ isOpen, onClose, user, vendorToken, planNameMap, onUpdated }: SubscriptionModalProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<{
    id?: string;
    planId?: string;
    planName?: string;
    expirationDate?: string;
  } | null>(null);


  // Fetch subscription plans when modal opens
  useEffect(() => {
    if (!isOpen || !vendorToken) return;
    
    const fetchPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("https://api.frontegg.com/entitlements/resources/plans/v1", {
          headers: {
            "Authorization": `Bearer ${vendorToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch plans: ${response.statusText}`);
        }

        const data = await response.json();
        setPlans(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch subscription plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [isOpen, vendorToken]);

  // Initialize form - reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlanId("");
      setExpirationDate("");
      setSelectedSubscription(null);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId || !expirationDate) {
      setError("Please select a plan and set an expiration date");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const expirationDateTime = new Date(expirationDate + "T12:00:00").toISOString();

      if (selectedSubscription?.id) {
        // Update existing subscription
        const response = await fetch(`https://api.frontegg.com/entitlements/resources/entitlements/v2/${selectedSubscription.id}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${vendorToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            expirationDate: expirationDateTime,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to update subscription: ${response.statusText}`);
        }
      } else {
        // Create new subscription
        const response = await fetch("https://api.frontegg.com/entitlements/resources/entitlements/v2", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${vendorToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: selectedPlanId,
            tenantId: (user as unknown as { tenantId?: string })?.tenantId || "",
            userId: user.id,
            expirationDate: expirationDateTime,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to assign subscription: ${response.statusText}`);
        }
      }

      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update subscription");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPlanId, expirationDate, user, vendorToken, selectedSubscription?.id, onUpdated, onClose]);

  const handleRemoveSubscription = useCallback(async (subscriptionId: string) => {
    if (!confirm("Are you sure you want to remove this subscription?")) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`https://api.frontegg.com/entitlements/resources/entitlements/v2/${subscriptionId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${vendorToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to remove subscription: ${response.statusText}`);
      }

      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove subscription");
    } finally {
      setIsSubmitting(false);
    }
  }, [vendorToken, onUpdated, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: 24,
        maxWidth: 500,
        width: "100%",
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600, color: "#333" }}>
            Manage Subscription
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#666",
              padding: 0,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 20, padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
          <strong style={{ color: "#333" }}>User:</strong> {user.name || user.email}
        </div>

        {/* Existing Subscriptions */}
        {user.subscriptions && user.subscriptions.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.125rem", fontWeight: 600, color: "#333" }}>
              Current Subscriptions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {user.subscriptions.map((subscription, index) => (
                <div key={subscription.id || index} style={{
                  padding: 12,
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  background: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <div style={{ fontWeight: 500, color: "#333" }}>
                      {subscription.planId ? planNameMap[subscription.planId] || subscription.planName || "Unknown Plan" : "Unknown Plan"}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#666" }}>
                      Expires: {subscription.expirationDate 
                        ? new Date(subscription.expirationDate).toLocaleDateString()
                        : "No expiration"
                      }
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => {
                        setSelectedSubscription(subscription);
                        setSelectedPlanId(subscription.planId || "");
                        if (subscription.expirationDate) {
                          const date = new Date(subscription.expirationDate);
                          setExpirationDate(date.toISOString().split('T')[0]);
                        }
                      }}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid var(--accent)",
                        borderRadius: 6,
                        background: "#fff",
                        color: "var(--accent)",
                        cursor: "pointer",
                        fontSize: "0.875rem"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => subscription.id && handleRemoveSubscription(subscription.id)}
                      disabled={isSubmitting}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #dc2626",
                        borderRadius: 6,
                        background: "#fff",
                        color: "#dc2626",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        fontSize: "0.875rem",
                        opacity: isSubmitting ? 0.6 : 1
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Subscription */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "1.125rem", fontWeight: 600, color: "#333" }}>
            {selectedSubscription ? "Edit Subscription" : "Add New Subscription"}
          </h3>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
            Loading subscription plans...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#333" }}>
                Subscription Plan
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: "1rem",
                  backgroundColor: "white"
                }}
                required
              >
                <option value="">Select a plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#333" }}>
                Expiration Date
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: "1rem"
                }}
                required
              />
            </div>

            {error && (
              <div style={{
                padding: "12px 16px",
                background: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                borderRadius: 8,
                marginBottom: 20
              }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              {selectedSubscription && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubscription(null);
                    setSelectedPlanId("");
                    setExpirationDate("");
                  }}
                  style={{
                    padding: "12px 20px",
                    border: "1px solid #6b7280",
                    borderRadius: 8,
                    background: "white",
                    color: "#6b7280",
                    cursor: "pointer",
                    fontWeight: 500
                  }}
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "12px 20px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  background: "white",
                  color: "#374151",
                  cursor: "pointer",
                  fontWeight: 500
                }}
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "12px 20px",
                  border: "none",
                  borderRadius: 8,
                  background: "var(--accent)",
                  color: "var(--accent-contrast)",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                {isSubmitting ? "Saving..." : selectedSubscription ? "Update Subscription" : "Add Subscription"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
