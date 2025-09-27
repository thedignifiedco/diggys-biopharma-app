"use client";
import { useAuth, useAuthActions } from "@frontegg/nextjs";
import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const { logout } = useAuthActions();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/');
  }, [logout, router]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <header style={{
      background: "var(--accent)",
      color: "var(--accent-contrast)",
      padding: "12px 16px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <Link href="/" style={{ 
          textDecoration: "none", 
          color: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0
        }}>
          <Image 
            src="/frontegg.png" 
            alt="Logo" 
            width={120} 
            height={24} 
            style={{ 
              width: "auto", 
              height: "24px",
              maxWidth: "120px"
            }}
          />
          <h1 style={{ 
            margin: 0, 
            fontSize: "clamp(1rem, 2.5vw, 1.5rem)", 
            fontWeight: 600,
            display: "none"
          }}>
            Custom Admin UI
          </h1>
        </Link>

        {isAuthenticated ? (
          !isMobile ? (
            /* Desktop Navigation */
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 16
            }}>
              <nav style={{ display: "flex", gap: 16 }}>
                <Link href="/admin" style={{ 
                  color: "inherit", 
                  textDecoration: "none",
                  padding: "8px 12px",
                  borderRadius: 6,
                  transition: "background-color 0.2s",
                  fontSize: "0.875rem"
                }}>
                  Dashboard
                </Link>
              </nav>
              
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Link href="/profile" style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8, 
                  textDecoration: "none", 
                  color: "inherit" 
                }}>
                  <Image 
                    src={user?.profilePictureUrl || "/vercel.svg"} 
                    alt={user?.name || "User"} 
                    width={32} 
                    height={32} 
                    unoptimized
                    style={{ borderRadius: "50%" }}
                  />
                  <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>{user?.name}</span>
                </Link>
                
                <button 
                  onClick={handleLogout}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    color: "inherit",
                    padding: "8px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: "0.875rem"
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            /* Mobile Navigation */
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12
            }}>
              <Link href="/profile" style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 6, 
                textDecoration: "none", 
                color: "inherit" 
              }}>
                <Image 
                  src={user?.profilePictureUrl || "/vercel.svg"} 
                  alt={user?.name || "User"} 
                  width={28} 
                  height={28} 
                  unoptimized
                  style={{ borderRadius: "50%" }}
                />
              </Link>
              
              <button 
                onClick={toggleMobileMenu}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "inherit",
                  padding: "6px",
                  borderRadius: 4,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2
                }}
                aria-label="Toggle menu"
              >
                <div style={{ 
                  width: "16px", 
                  height: "2px", 
                  background: "currentColor",
                  borderRadius: 1
                }}></div>
                <div style={{ 
                  width: "16px", 
                  height: "2px", 
                  background: "currentColor",
                  borderRadius: 1
                }}></div>
                <div style={{ 
                  width: "16px", 
                  height: "2px", 
                  background: "currentColor",
                  borderRadius: 1
                }}></div>
              </button>
            </div>
          )
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "0.875rem" }}>Welcome to Frontegg Demo</span>
          </div>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {isAuthenticated && isMobile && isMobileMenuOpen && (
        <div style={{
          background: "var(--accent)",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}>
          <Link 
            href="/admin" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ 
              color: "inherit", 
              textDecoration: "none",
              padding: "12px 16px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.1)",
              fontSize: "0.875rem",
              fontWeight: 500
            }}
          >
            Dashboard
          </Link>
          <Link 
            href="/profile" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ 
              color: "inherit", 
              textDecoration: "none",
              padding: "12px 16px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.1)",
              fontSize: "0.875rem",
              fontWeight: 500
            }}
          >
            Profile
          </Link>
          <button 
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "inherit",
              padding: "12px 16px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              textAlign: "left"
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
