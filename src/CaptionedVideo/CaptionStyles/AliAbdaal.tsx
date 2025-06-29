import React from "react";
import {
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { CaptionFont } from "../../load-font";
import { makeTransform, translateY } from "@remotion/animation-utils";
import { TikTokPage } from "@remotion/captions";

const fontFamily = CaptionFont;
const customEasing = Easing.ease;

export const AliAbdaal: React.FC<{
  readonly page: TikTokPage;
  readonly textTransform: "capitalize" | "uppercase" | "lowercase";
  readonly captionColor: string;
}> = ({ page, textTransform, captionColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const timeInMs = (frame / fps) * 1000;
  const fontSize = 50;

  const animationDurationInFrames = 0.1 * fps;
  const slideDistance = 10;
  const blurAmount = 5;

  const introOutroCombinedDuration = animationDurationInFrames * 2;
  const actualAnimationDuration =
    durationInFrames < introOutroCombinedDuration
      ? durationInFrames / 2
      : animationDurationInFrames;

  const y = interpolate(
    frame,
    [
      0,
      actualAnimationDuration,
      durationInFrames - actualAnimationDuration,
      durationInFrames,
    ],
    [slideDistance, 0, 0, slideDistance],
    {
      easing: customEasing,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const blur = interpolate(
    frame,
    [
      0,
      actualAnimationDuration,
      durationInFrames - actualAnimationDuration,
      durationInFrames,
    ],
    [blurAmount, 0, 0, blurAmount],
    {
      easing: customEasing,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <div
      style={{
        fontSize,
        color: captionColor,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        paddingTop: "10px",
        paddingBottom: "10px",
        paddingLeft: "30px",
        paddingRight: "30px",
        borderRadius: "20px",
        transform: makeTransform([translateY(y)]),
        filter: `blur(${blur}px)`,
        fontFamily,
        textTransform: textTransform,
        display: "inline-block",
        textAlign: "center",
      }}
    >
      <span>
        {page.tokens.map((t) => {
          const startRelativeToSequence = t.fromMs - page.startMs;
          const revealStartTime = startRelativeToSequence;
          const revealEndTime = startRelativeToSequence + 200;

          const wordOpacityProgress = interpolate(
            timeInMs,
            [revealStartTime, revealEndTime],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const wordOpacity = interpolate(
            wordOpacityProgress,
            [0, 1],
            [0.5, 1],
          );

          return (
            <span
              key={t.fromMs}
              style={{
                display: "inline",
                whiteSpace: "pre",
                opacity: wordOpacity,
              }}
            >
              {t.text}
            </span>
          );
        })}
      </span>
    </div>
  );
};