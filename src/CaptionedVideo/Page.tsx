import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { TheBoldFont } from "../load-font";
import { makeTransform, translateY } from "@remotion/animation-utils";
import { TikTokPage } from "@remotion/captions";

const fontFamily = TheBoldFont;

const container: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
  top: undefined,
  height: 300,
};

// Define the custom cubic-bezier easing function
const customEasing = Easing.ease;

export const Page: React.FC<{
  readonly enterProgress: number;
  readonly page: TikTokPage;
}> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const timeInMs = (frame / fps) * 1000;

  const fontSize = 45;

  // Define animation properties
  const animationDurationInFrames = 0.1 * fps; // 0.5 seconds
  const slideDistance = 10; // 20px slide
  const blurAmount = 10; // 5px of blur

  // Ensure the intro and outro animations don't overlap on very short captions
  const introOutroCombinedDuration = animationDurationInFrames * 2;
  const actualAnimationDuration =
    durationInFrames < introOutroCombinedDuration
      ? durationInFrames / 2
      : animationDurationInFrames;

  // Animate Y-position from 20px to 0, then back to 20px
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

  // Animate blur from 5px to 0, then back to 5px, synchronized with the Y-translation
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
    <AbsoluteFill style={container}>
      <div
        style={{
          fontSize,
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          paddingTop: "10px",
          paddingBottom: "10px",
          paddingLeft: "30px",
          paddingRight: "30px",
          borderRadius: "20px",
          transform: makeTransform([translateY(y)]),
          filter: `blur(${blur}px)`,
          fontFamily,
          textTransform: "capitalize",
          display: "inline-block",
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
                  color: "white",
                  opacity: wordOpacity,
                }}
              >
                {t.text}
              </span>
            );
          })}
        </span>
      </div>
    </AbsoluteFill>
  );
};
