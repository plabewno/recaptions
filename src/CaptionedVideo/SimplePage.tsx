// c:\Users\Plabew\coding\remotion-captions\src\CaptionedVideo\SimplePage.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { CaptionFont } from "../load-font";
import { TikTokPage } from "@remotion/captions";

const fontFamily = CaptionFont;

const textStyle: React.CSSProperties = {
  fontFamily,
  fontSize: 45, // Default font size, can be made a prop
  color: "green", // Default color, can be made a prop
  textAlign: "center",
  textTransform: "capitalize", // As per original Page.tsx
  position: "absolute",
  bottom: "10%", 
  width: "100%",
};

// Centering style for the AbsoluteFill
const fillStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-end", // Aligns text to the bottom, adjust to "center" for middle, etc.
  paddingBottom: "5%", // Add some padding from the bottom
};

export const SimplePage: React.FC<{
  readonly page: TikTokPage;
}> = ({ page }) => {
  const fullText = page.tokens.map((t) => t.text).join("");

  return (
    <AbsoluteFill style={fillStyle}>
      <div style={textStyle}>
        {fullText}
      </div>
    </AbsoluteFill>
  );
};
