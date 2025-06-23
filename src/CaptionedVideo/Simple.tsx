import React from "react";
import { CaptionFont } from "../load-font";
import { TikTokPage } from "@remotion/captions";

const fontFamily = CaptionFont;

const textStyle: React.CSSProperties = {
  fontFamily,
  fontSize: 45,
  color: "green",
  textAlign: "center",
  textTransform: "capitalize",
};

export const Simple: React.FC<{
  readonly page: TikTokPage;
}> = ({ page }) => {
  const fullText = page.tokens.map((t) => t.text).join("");

  return <div style={textStyle}>{fullText}</div>;
};