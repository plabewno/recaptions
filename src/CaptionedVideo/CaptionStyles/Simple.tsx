import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { CaptionFont } from "../../load-font";
import { TikTokPage } from "@remotion/captions";

const fontFamily = CaptionFont;

const entryGrowEase = Easing.bezier(0, 0.3, 0.6, 1);
const entrySettleEase = Easing.bezier(0.3, 0, 0.7, 1);
const exitEase = Easing.bezier(0, 0.3, 0.5, 1);

const ENTRY_GROW_FRAMES = 5;
const ENTRY_HOLD_FRAMES = 1;
const ENTRY_SETTLE_FRAMES = 3;
const ENTRY_ANIMATION_TOTAL_FRAMES =
  ENTRY_GROW_FRAMES + ENTRY_HOLD_FRAMES + ENTRY_SETTLE_FRAMES;

const EXIT_ANIMATION_FRAMES = 2;

export const Simple: React.FC<{
  readonly page: TikTokPage;
  readonly textTransform: "capitalize" | "uppercase" | "lowercase";
  readonly captionColor: string;
  readonly shadowBlur?: number;
  readonly shadowColor?: string;
}> = ({
  page,
  textTransform,
  captionColor,
  shadowBlur = 15 ,
  shadowColor = "rgba(0,0,0,1)",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const textStyle: React.CSSProperties = {
    fontFamily,
    fontSize: 80,
    color: captionColor,
    textAlign: "center",
    paintOrder: "stroke",
    WebkitTextStroke: "10px black",
    textShadow: `
      0px 0px ${shadowBlur * 1}px ${shadowColor},
      0px 0px ${shadowBlur * 1}px ${shadowColor}
    `,
  };

  const fullText = page.tokens.map((t) => t.text).join("");

  let scale = 1.0;

  if (
    frame >= durationInFrames - EXIT_ANIMATION_FRAMES &&
    durationInFrames > EXIT_ANIMATION_FRAMES
  ) {
    scale = interpolate(
      frame,
      [durationInFrames - EXIT_ANIMATION_FRAMES, durationInFrames],
      [1.0, 1.05],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: exitEase,
      },
    );
  } else if (frame < ENTRY_GROW_FRAMES) {
    scale = interpolate(frame, [0, ENTRY_GROW_FRAMES], [0.9, 1.05], {
      easing: entryGrowEase,
      extrapolateRight: "clamp",
    });
  } else if (frame < ENTRY_GROW_FRAMES + ENTRY_HOLD_FRAMES) {
    scale = 1.05;
  } else if (frame < ENTRY_ANIMATION_TOTAL_FRAMES) {
    scale = interpolate(
      frame,
      [ENTRY_GROW_FRAMES + ENTRY_HOLD_FRAMES, ENTRY_ANIMATION_TOTAL_FRAMES],
      [1.05, 1.0],
      {
        easing: entrySettleEase,
        extrapolateRight: "clamp",
      },
    );
  }

  return (
    <div
      style={{
        ...textStyle,
        textTransform,
        transform: `scale(${scale})`,
      }}
    >
      {fullText}
    </div>
  );
};