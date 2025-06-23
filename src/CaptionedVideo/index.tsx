import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  cancelRender,
  continueRender,
  delayRender,
  getStaticFiles,
  Sequence,
  useVideoConfig,
  watchStaticFile,
} from "remotion";
import { z } from "zod";
import SubtitlePage from "./SubtitlePage";
import { getVideoMetadata } from "@remotion/media-utils";
import { Simple } from "./Simple";
import { loadFont } from "../load-font";
import { NoCaptionFile } from "./NoCaptionFile";
import { Caption, createTikTokStyleCaptions } from "@remotion/captions";

export const captionStyles = ["Ali Abdaal", "simple"] as const;

export const captionedVideoSchema = z.object({
  src: z.string(),
  fps: z.number().int().positive().optional().default(30), // FPS is now a prop
  captionStyle: z.enum(captionStyles).optional().default("Ali Abdaal"),
  captionVerticalOffset: z
    .number()
    .int()
    .min(-100)
    .max(100)
    .optional()
    .default(0),
  captionHorizontalOffset: z
    .number()
    .int()
    .min(-100)
    .max(100)
    .optional()
    .default(0),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  switchCaptionsDurationMs: z.number().int().positive().optional(),
});

export const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
  z.infer<typeof captionedVideoSchema>
> = async ({ props }) => {
  // Use the fps from the props
  const { fps } = props;
  const metadata = await getVideoMetadata(props.src);

  return {
    fps,
    durationInFrames: Math.floor(metadata.durationInSeconds * fps),
    width: props.width,
    height: props.height,
  };
};

const getFileExists = (file: string) => {
  const files = getStaticFiles();
  const fileExists = files.find((f) => f.src === file);
  return Boolean(fileExists);
};

export const CaptionedVideo: React.FC<z.infer<typeof captionedVideoSchema>> = ({
  src,
  captionStyle,
  captionVerticalOffset,
  captionHorizontalOffset,
  switchCaptionsDurationMs: switchCaptionsDurationMsProp,
  // Note: `fps` prop isn't needed here directly. `useVideoConfig()` will provide it.
}) => {
  const [subtitles, setSubtitles] = useState<Caption[]>([]);
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig(); // This gets the FPS set by calculateMetadata

  const switchCaptionsDurationMs = switchCaptionsDurationMsProp ?? 1500;

  const subtitlesFile = src
    .replace(/.mp4$/, ".json")
    .replace(/.mkv$/, ".json")
    .replace(/.mov$/, ".json")
    .replace(/.webm$/, ".json");

  const fetchSubtitles = useCallback(async () => {
    try {
      await loadFont();
      const res = await fetch(subtitlesFile);
      const data = (await res.json()) as Caption[];
      setSubtitles(data);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [handle, subtitlesFile]);

  useEffect(() => {
    fetchSubtitles();
    const c = watchStaticFile(subtitlesFile, () => {
      fetchSubtitles();
    });
    return () => {
      c.cancel();
    };
  }, [fetchSubtitles, src, subtitlesFile]);

  const { pages } = useMemo(() => {
    return createTikTokStyleCaptions({
      combineTokensWithinMilliseconds: switchCaptionsDurationMs,
      captions: subtitles ?? [],
    });
  }, [subtitles, switchCaptionsDurationMs]);

  const PageComponent = captionStyle === "simple" ? Simple : SubtitlePage;

  const positioningStyle = useMemo((): React.CSSProperties => {
    return {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      transform: `translateX(${captionHorizontalOffset}%) translateY(${captionVerticalOffset}%)`,
    };
  }, [captionVerticalOffset, captionHorizontalOffset]);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const subtitleStartFrame = (page.startMs / 1000) * fps;
        const subtitleEndFrame = nextPage
          ? (nextPage.startMs / 1000) * fps
          : Infinity;
        const durationInFrames = subtitleEndFrame - subtitleStartFrame;
        if (durationInFrames <= 0) {
          return null;
        }

        return (
          <Sequence
            key={index}
            from={subtitleStartFrame}
            durationInFrames={durationInFrames}
          >
            <AbsoluteFill style={positioningStyle}>
              <PageComponent key={index} page={page} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {getFileExists(subtitlesFile) ? null : <NoCaptionFile />}
    </AbsoluteFill>
  );
};