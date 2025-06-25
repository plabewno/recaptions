import React from "react";
import { TikTokPage } from "@remotion/captions";

// --- Style Changes ---
// Increased maxWidth from 350px to 480px
// Increased base fontSize from 16px to 20px for better visibility
// Increased padding and added a bottom border to the header
// Increased padding in table cells for more breathing room
// Added line-height for better text readability

const containerStyle: React.CSSProperties = {
  position: "absolute",
  top: 20,
  right: 20,
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  color: "white",
  padding: "20px", // Increased padding
  borderRadius: "15px",
  fontFamily: "sans-serif",
  fontSize: "30px", // Increased font size
  maxWidth: "800px", // Increased width
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)",
  lineHeight: "1.4", // Added for readability
  zIndex: 100,
};

const headerStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "15px",
  paddingBottom: "10px",
  borderBottom: "2px solid #555",
  fontSize: "24px", // Make header slightly larger
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  borderBottom: "2px solid #555",
  padding: "12px", // Increased padding
  textAlign: "left",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #444",
  padding: "12px", // Increased padding
  verticalAlign: "top",
};

export const CaptionReferenceList: React.FC<{
  pages: TikTokPage[];
  show: boolean;
}> = ({ pages, show }) => {
  if (!show) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>Caption Reference</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "70px", textAlign: "center" }}>
              Index
            </th>
            <th style={thStyle}>Text</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page, index) => {
            const text = page.tokens.map((t) => t.text).join("");
            return (
              <tr key={page.startMs}>
                <td style={{ ...tdStyle, textAlign: "center" }}>{index}</td>
                <td style={tdStyle}>{text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};