import React from "react";
import { AliAbdaal } from "./AliAbdaal";
import { TikTokPage } from "@remotion/captions";

const SubtitlePage: React.FC<{ readonly page: TikTokPage }> = ({ page }) => {
  return <AliAbdaal page={page} />;
};

export default SubtitlePage;