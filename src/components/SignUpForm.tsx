"use client";
import { useState, useCallback } from "react";
import { useLoginWithRedirect } from "@frontegg/nextjs";
import styles from "./SignUpForm.module.css";

type FormState = "idle" | "loading" | "success" | "error" | "user_exists";

interface SignUpFormProps {
  onClose?: () => void;
}

const DEFAULT_ROLE_ID = "b766028a-2377-4e48-8ebc-28a48305fc6e";
const FRONTEGG_BASE_URL = process.env.NEXT_PUBLIC_FRONTEGG_BASE_URL || "https://dignifiedlabs-dev.frontegg.com";
const FRONTEGG_API_URL = "https://api.frontegg.com";
const FRONTEGG_TENANT_ID = "7b575a47-9519-4ae3-b548-395a24df6aee";

export default function SignUpForm({ onClose }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const loginWithRedirect = useLoginWithRedirect();

  // Initialize vendor token (similar to admin page)
  const getVendorToken = useCallback(async (): Promise<string> => {
    // Check localStorage for cached token
    const cached = localStorage.getItem("frontegg_vendor_token");
    const cachedExpiry = localStorage.getItem("frontegg_vendor_token_expiry");
    
    if (cached && cachedExpiry && Date.now() < parseInt(cachedExpiry)) {
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
    
    // Store in localStorage
    localStorage.setItem("frontegg_vendor_token", token);
    localStorage.setItem("frontegg_vendor_token_expiry", (Date.now() + expiresIn * 1000).toString());
    
    return token;
  }, []);

  // Validate SSO address to prevent open redirect
  const validateSSOAddress = useCallback((address: string): boolean => {
    try {
      const url = new URL(address);
      
      // Must be HTTPS
      if (url.protocol !== 'https:') {
        return false;
      }
      
      // Block localhost and internal IPs
      if (
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname.startsWith('192.168.') ||
        url.hostname.startsWith('10.') ||
        url.hostname.startsWith('172.16.') ||
        url.hostname.startsWith('172.17.') ||
        url.hostname.startsWith('172.18.') ||
        url.hostname.startsWith('172.19.') ||
        url.hostname.startsWith('172.20.') ||
        url.hostname.startsWith('172.21.') ||
        url.hostname.startsWith('172.22.') ||
        url.hostname.startsWith('172.23.') ||
        url.hostname.startsWith('172.24.') ||
        url.hostname.startsWith('172.25.') ||
        url.hostname.startsWith('172.26.') ||
        url.hostname.startsWith('172.27.') ||
        url.hostname.startsWith('172.28.') ||
        url.hostname.startsWith('172.29.') ||
        url.hostname.startsWith('172.30.') ||
        url.hostname.startsWith('172.31.')
      ) {
        return false;
      }
      
      // Allow Frontegg domains
      const fronteggBaseUrlObj = new URL(FRONTEGG_BASE_URL);
      const isFronteggDomain = url.hostname === fronteggBaseUrlObj.hostname || 
                               url.hostname.endsWith('.frontegg.com');
      
      // Allow known SSO providers
      const knownSSOProviders = [
        'login.microsoftonline.com',
        'accounts.google.com',
        'login.okta.com',
        'okta.com',
        'auth0.com',
        'login.salesforce.com',
        'sso.azure.com',
        'sts.windows.net',
      ];
      
      const isKnownSSOProvider = knownSSOProviders.some(provider => 
        url.hostname === provider || url.hostname.endsWith('.' + provider)
      );
      
      // Allow if it's a Frontegg domain or known SSO provider
      return isFronteggDomain || isKnownSSOProvider;
    } catch {
      return false; // Invalid URL
    }
  }, []);

  // Check SSO prelogin
  const checkSSOPrelogin = useCallback(async (email: string, vendorToken: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `${FRONTEGG_BASE_URL}/frontegg/identity/resources/auth/v2/user/sso/prelogin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${vendorToken}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        const address = data.address || null;
        // Validate the SSO address to prevent open redirect
        if (address && validateSSOAddress(address)) {
          return address;
        } else if (address) {
          console.error("Invalid SSO address received:", address);
          return null; // Invalid address, continue to next step
        }
        return null;
      } else if (response.status === 404) {
        return null; // SSO not enabled, continue to next step
      } else {
        throw new Error(`SSO prelogin check failed: ${response.status}`);
      }
    } catch (error) {
      console.error("SSO prelogin check error:", error);
      return null; // Continue to next step on error
    }
  }, [validateSSOAddress]);

  // Check if user exists by email
  const checkUserExists = useCallback(async (email: string, vendorToken: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${FRONTEGG_API_URL}/identity/resources/users/v1/email?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${vendorToken}`,
          },
        }
      );

      if (response.status === 200) {
        return true; // User exists
      } else if (response.status === 404) {
        return false; // User does not exist
      } else {
        throw new Error(`Failed to check user existence: ${response.status}`);
      }
    } catch (error) {
      console.error("Check user exists error:", error);
      throw error;
    }
  }, []);

  // Create user in Frontegg
  const createUser = useCallback(async (email: string, name: string, vendorToken: string): Promise<void> => {
    const response = await fetch(`${FRONTEGG_API_URL}/identity/resources/users/v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "frontegg-tenant-id": FRONTEGG_TENANT_ID,
        "Authorization": `Bearer ${vendorToken}`,
      },
      body: JSON.stringify({
        email,
        name,
        roleIds: [DEFAULT_ROLE_ID],
        skipInviteEmail: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create user: ${response.status}`);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !fullName) {
      setErrorMessage("Please fill in all fields");
      setFormState("error");
      return;
    }

    setFormState("loading");
    setErrorMessage("");

    try {
      // Get vendor token
      const vendorToken = await getVendorToken();

      // Step 1a: Check SSO prelogin
      const ssoAddress = await checkSSOPrelogin(email, vendorToken);
      if (ssoAddress) {
        // Validate address again before redirect to prevent open redirect
        if (validateSSOAddress(ssoAddress)) {
          window.location.href = ssoAddress;
        } else {
          console.error("Invalid SSO address, skipping redirect:", ssoAddress);
          // Continue to next step instead of redirecting
        }
        return;
      }

      // Step 1b: Check if user exists
      const userExists = await checkUserExists(email, vendorToken);

      if (userExists) {
        // Step 2a: User exists - show message and login link
        setFormState("user_exists");
        return;
      }

      // Step 2b: User does not exist - create user
      await createUser(email, fullName, vendorToken);
      setFormState("success");
    } catch (error) {
      console.error("Sign up error:", error);
      setErrorMessage(error instanceof Error ? error.message : "An error occurred during sign up");
      setFormState("error");
    }
  }, [email, fullName, getVendorToken, checkSSOPrelogin, checkUserExists, createUser, validateSSOAddress]);

  const handleLoginWithHint = useCallback(() => {
    loginWithRedirect({ login_hint: email });
  }, [email, loginWithRedirect]);

  if (formState === "success") {
    return (
      <div className={styles.formContainer}>
        <div className={styles.successMessage}>
          <h2>Sign Up Successful!</h2>
          <p>We&apos;ve sent a verification email to <strong>{email}</strong>.</p>
          <p>Please check your inbox and click the link in the email to verify your account.</p>
          {onClose && (
            <button onClick={onClose} className={styles.closeButton}>
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  if (formState === "user_exists") {
    return (
      <div className={styles.formContainer}>
        <div className={styles.userExistsMessage}>
          <h2>User Already Exists</h2>
          <p>A user with the email <strong>{email}</strong> already exists.</p>
          <p>Please log in using the button below.</p>
          <button onClick={handleLoginWithHint} className={styles.loginButton}>
            Go to Login
          </button>
          {onClose && (
            <button onClick={onClose} className={styles.secondaryButton}>
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Sign Up</h2>
        
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={formState === "loading"}
            placeholder="Enter your email"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={formState === "loading"}
            placeholder="Enter your full name"
          />
        </div>

        {formState === "error" && errorMessage && (
          <div className={styles.errorMessage}>
            {errorMessage}
          </div>
        )}

        <div className={styles.formActions}>
          <button
            type="submit"
            disabled={formState === "loading"}
            className={styles.submitButton}
          >
            {formState === "loading" ? "Processing..." : "Sign Up"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={formState === "loading"}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          )}
        </div>

        {formState === "loading" && (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <p>Please wait while we process your sign up...</p>
          </div>
        )}
      </form>
    </div>
  );
}

