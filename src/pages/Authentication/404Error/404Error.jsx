import React from "react";
import { Link } from "react-router-dom";
import * as Switcherdatacustam from "../../../data/Switcherdata/Switcherdatacustam";

export const Error404 = () => {
  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f8fafc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      textAlign: "center",
      fontFamily: "Poppins, sans-serif",
      position: "relative",
      overflow: "hidden",
      padding: "40px 20px",
    },

    blob1: {
      position: "absolute",
      width: 420,
      height: 420,
      background: "radial-gradient(circle, #3b82f6, transparent 60%)",
      top: "-120px",
      left: "-120px",
      filter: "blur(90px)",
      opacity: 0.5,
    },

    blob2: {
      position: "absolute",
      width: 380,
      height: 380,
      background: "radial-gradient(circle, #06b6d4, transparent 60%)",
      bottom: "-120px",
      right: "-120px",
      filter: "blur(90px)",
      opacity: 0.5,
    },

    big404: {
      fontSize: "20vw",
      fontWeight: 900,
      lineHeight: 1,
      color: "#e2e8f0",
      letterSpacing: "10px",
      userSelect: "none",
    },

    title: {
      fontSize: 34,
      fontWeight: 800,
      color: "#0f172a",
      marginTop: 10,
    },

    subtitle: {
      fontSize: 15,
      color: "#64748b",
      maxWidth: 520,
      margin: "16px auto 28px",
      lineHeight: 1.7,
    },

    actions: {
      display: "flex",
      gap: 16,
      flexWrap: "wrap",
      justifyContent: "center",
    },

    primaryBtn: {
      padding: "14px 26px",
      borderRadius: 999,
      background: "linear-gradient(135deg, #2563eb, #3b82f6)",
      color: "#fff",
      textDecoration: "none",
      fontWeight: 600,
      fontSize: 15,
      boxShadow: "0 15px 35px rgba(37,99,235,0.35)",
      transition: "0.25s ease",
    },

    secondaryBtn: {
      padding: "14px 26px",
      borderRadius: 999,
      border: "1px solid #cbd5e1",
      background: "#fff",
      color: "#0f172a",
      textDecoration: "none",
      fontWeight: 600,
      fontSize: 15,
    },

    switcherLink: {
      position: "fixed",
      right: 18,
      bottom: 18,
      width: 46,
      height: 46,
      borderRadius: "50%",
      background: "#fff",
      border: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 12px 25px rgba(0,0,0,0.12)",
      color: "#2563eb",
    },
  };

  return (
    <div
      style={styles.page}
      onClick={() => Switcherdatacustam.Swichermainrightremove()}
    >
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div style={styles.big404}>404</div>

      <div style={styles.title}>Page not found</div>
      <div style={styles.subtitle}>
        The page you are trying to access doesn’t exist or has been moved.
        Let’s guide you back to a safe orbit.
      </div>

      <div style={styles.actions}>
        <Link
          to={`${process.env.PUBLIC_URL}/dashboard/`}
          style={styles.primaryBtn}
        >
          Back to Dashboard
        </Link>
        <Link
          to={`${process.env.PUBLIC_URL}/contacts/`}
          style={styles.secondaryBtn}
        >
          Open Contacts
        </Link>
      </div>

      <Link
        to="#"
        onClick={(e) => {
          e.stopPropagation();
          Switcherdatacustam.Swichermainright();
        }}
        style={styles.switcherLink}
      >
        <i className="bi bi-gear" />
      </Link>
    </div>
  );
};

export default Error404;
