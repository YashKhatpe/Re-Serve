"use client";

import React, { forwardRef } from "react";
import { JSX } from "react";

type Props = {
  userName: string;
  badge: {
    title: string;
    description: string;
    required: number;
    icon: JSX.Element;
  };
  mealsServed: number;
};

const Certificate = forwardRef<HTMLDivElement, Props>(
  ({ userName, badge, mealsServed }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: "960px",
          height: "680px",
          padding: "50px 60px",
          backgroundColor: "#fff",
          color: "#1f2937",
          border: "8px solid #facc15", // golden border
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{ borderBottom: "2px solid #f3f4f6", paddingBottom: "10px" }}
        >
          <h1
            style={{
              color: "#f97316",
              fontSize: "2.8rem",
              marginBottom: "10px",
              letterSpacing: "1px",
            }}
          >
            Certificate of Achievement
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#6b7280" }}>
            Presented by Re-Serve
          </p>
        </div>

        <div style={{ marginTop: "60px" }}>
          <p style={{ fontSize: "1.2rem", marginBottom: "10px" }}>
            This certificate is awarded to
          </p>
          <h2
            style={{
              fontSize: "2.4rem",
              fontWeight: "bold",
              marginBottom: "20px",
              fontFamily: "serif",
              color: "#111827",
            }}
          >
            {userName}
          </h2>
          <p style={{ fontSize: "1.1rem" }}>
            for unlocking the <strong>{badge.title}</strong>
          </p>
          <p
            style={{ color: "#6b7280", fontSize: "1rem", marginBottom: "20px" }}
          >
            {badge.description}
          </p>

          <p style={{ fontSize: "1rem", color: "#374151", marginTop: "10px" }}>
            Total Meals Served: <strong>{mealsServed}</strong>
          </p>
        </div>

        {/* Badge Icon */}
        <div style={{ marginTop: "50px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "10px",
            }}
          >
            {React.cloneElement(badge.icon, { color: "#f97316", size: 60 })}
          </div>
        </div>

        {/* Footer */}
        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <hr
            style={{
              border: "none",
              height: "1px",
              backgroundColor: "#e5e7eb",
              marginBottom: "16px",
            }}
          />
          <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
            © {new Date().getFullYear()} Re-Serve | Empowering Food Donation
          </p>
        </div>
      </div>
    );
  }
);

Certificate.displayName = "Certificate";
export default Certificate;
