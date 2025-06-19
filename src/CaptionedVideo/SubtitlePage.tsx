import React from "react";
import { AbsoluteFill } from "remotion";
import { AliAbdaal } from "./AliAbdaal";
import { TikTokPage } from "@remotion/captions";

const SubtitlePage: React.FC<{ readonly page: TikTokPage }> = ({ page }) => {
  const enterProgress = 1;

  return (
    <AbsoluteFill>
      <AliAbdaal enterProgress={enterProgress} page={page} />
    </AbsoluteFill>
  );
};

export default SubtitlePage;
