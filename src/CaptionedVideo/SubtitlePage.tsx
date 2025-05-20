import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Page } from "./Page";
import { TikTokPage } from "@remotion/captions";

const SubtitlePage: React.FC<{ readonly page: TikTokPage }> = ({ page }) => {
  // Animation removed by setting enterProgress to 1
  const enterProgress = 1;

  return (
    <AbsoluteFill>
      <Page enterProgress={enterProgress} page={page} />
    </AbsoluteFill>
  );
};

export default SubtitlePage;
