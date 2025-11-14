"use client";
import { useAuth } from "@frontegg/nextjs";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { useCallback, useState } from "react";
import SignUpForm from "@/components/SignUpForm";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [showSignUpForm, setShowSignUpForm] = useState(false);

  const handleJoinNow = useCallback(() => {
    setShowSignUpForm(true);
  }, []);

  const handleCloseSignUpForm = useCallback(() => {
    setShowSignUpForm(false);
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {isAuthenticated ? (
          <div className={styles.authenticatedContent}>
            <div className={styles.welcomeSection}>
              <Image
                src={user?.profilePictureUrl || "/vercel.svg"}
                alt={user?.name || "User"}
                width={80}
                height={80}
                unoptimized
                className={styles.profileImage}
              />
              <h1>Welcome back, {user?.name}!</h1>
              <p>Access your clinical research portal, manage your profile, and collaborate with your research team.</p>
            </div>
            
            <div className={styles.actionButtons}>
              <Link href="/profile" className={styles.primaryButton}>
                View Profile
              </Link>
              <Link href="/research" className={styles.secondaryButton}>
                Clinical Research Portal
              </Link>
              <Link href="/admin" className={styles.secondaryButton}>
                Admin Dashboard
              </Link>
            </div>
          </div>
        ) : showSignUpForm ? (
          <SignUpForm onClose={handleCloseSignUpForm} />
        ) : (
          <div className={styles.landingContent}>
            <div className={styles.heroSection}>
              <h1>Dignified BioPharma</h1>
              <p>Clinical Research Portal - Secure access to biopharmaceutical research data, regulatory information, and clinical trial management.</p>
            </div>
            
            <div className={styles.features}>
              <div className={styles.feature}>
                <h3>🔬 Clinical Research Portal</h3>
                <p>Access clinical trial data, research documents, and regulatory submissions. Approved researchers can view protocols, study reports, and data analyses.</p>
              </div>
              <div className={styles.feature}>
                <h3>🔒 Secure & Compliant</h3>
                <p>HIPAA-compliant infrastructure with multi-factor authentication, audit trails, and granular access controls for sensitive research data.</p>
              </div>
            </div>

            <div className={styles.ctaSection}>
              <button onClick={handleJoinNow} className={styles.loginButton}>
                Request Access
              </button>
              <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
                For authorized biopharmaceutical research professionals only
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
