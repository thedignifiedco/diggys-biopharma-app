"use client";
import { useAuth, useLoginWithRedirect } from "@frontegg/nextjs";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const loginWithRedirect = useLoginWithRedirect();
  
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
              <p>Manage your profile and access admin features.</p>
            </div>
            
            <div className={styles.actionButtons}>
              <Link href="/profile" className={styles.primaryButton}>
                View Profile
              </Link>
              <Link href="/admin" className={styles.secondaryButton}>
                Admin Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.landingContent}>
            <div className={styles.heroSection}>
              <h1>Welcome to Frontegg Demo</h1>
              <p>A comprehensive demo showcasing user authentication, profile management, and admin capabilities.</p>
            </div>
            
            <div className={styles.features}>
              <div className={styles.feature}>
                <h3>Profile Management</h3>
                <p>Complete user profile with custom metadata fields</p>
              </div>
              <div className={styles.feature}>
                <h3>Admin Dashboard</h3>
                <p>Manage users and their information with admin privileges</p>
              </div>
            </div>

            <div className={styles.ctaSection}>
              <button onClick={() => loginWithRedirect()} className={styles.loginButton}>
                Get Started
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
