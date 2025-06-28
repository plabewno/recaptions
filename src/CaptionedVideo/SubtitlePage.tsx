import React from "react";
import { AliAbdaal } from "./AliAbdaal";
import { TikTokPage } from "@remotion/captions";

const SubtitlePage: React.FC<{
  readonly page: TikTokPage;
  readonly textTransform: "capitalize" | "uppercase" | "lowercase";
  readonly captionColor: string;
  readonly shadowBlur?: number;
  readonly shadowColor?: string;
}> = ({ page, textTransform, captionColor }) => {
  return (
    <AliAbdaal
      page={page}
      textTransform={textTransform}
      captionColor={captionColor}
    />
  );
};

export default SubtitlePage;