import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TheBoldFont } from "../load-font";
import { makeTransform, scale, translateY } from "@remotion/animation-utils";
import { TikTokPage } from "@remotion/captions";

const fontFamily = TheBoldFont;

const container: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
  top: undefined,
  height: 300,
};

export const Page: React.FC<{
  readonly enterProgress: number;
  readonly page: TikTokPage;
}> = ({ enterProgress, page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeInMs = (frame / fps) * 1000;

  const fontSize = 45;

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
          transform: makeTransform([
            scale(interpolate(enterProgress, [0, 1], [0.8, 1])),
            translateY(interpolate(enterProgress, [0, 1], [50, 0])),
          ]),
          fontFamily,
          textTransform: "capitalize",
          display: "inline-block",
          // boxShadow: "8px 8px 10px rgba(0, 0, 0, 0.5)",
        }}
      >
        <span>
          {page.tokens.map((t) => {
            const startRelativeToSequence = t.fromMs - page.startMs;
            const revealStartTime = startRelativeToSequence;
            const revealEndTime = startRelativeToSequence + 200; // Duration for each word to fade in

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
