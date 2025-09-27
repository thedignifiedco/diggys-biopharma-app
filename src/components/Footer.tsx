"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: "#f8fafc",
      borderTop: "1px solid #e5e7eb",
      padding: "24px 0",
      marginTop: "auto",
      textAlign: "center"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 24px"
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8
        }}>
          <p style={{
            margin: 0,
            color: "#6b7280",
            fontSize: "0.875rem"
          }}>
            © {currentYear} Dignified Labs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
