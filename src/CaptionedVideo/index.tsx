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
import { SimplePage } from "./SimplePage"; // Import SimplePage
import { loadFont } from "../load-font";
import { NoCaptionFile } from "./NoCaptionFile";
import { Caption, createTikTokStyleCaptions } from "@remotion/captions";

export const captionStyles = ["tiktok", "simple"] as const;
export const captionedVideoSchema = z.object({
  src: z.string(),
  captionStyle: z.enum(captionStyles).optional().default("tiktok"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  switchCaptionsDurationMs: z.number().int().positive().optional(),
});

export const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
  z.infer<typeof captionedVideoSchema>
> = async ({ props }) => {
  const fps = 30;
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
  const fileExists = files.find((f) => {
    return f.src === file;
  });
  return Boolean(fileExists);
};

export const CaptionedVideo: React.FC<z.infer<typeof captionedVideoSchema>> = ({
  src,
  captionStyle,
  switchCaptionsDurationMs: switchCaptionsDurationMsProp,
  // width and height are now part of the props due to the schema.
  // We'll continue to use width and height from useVideoConfig() as it's idiomatic
  // and will reflect the values set by calculateCaptionedVideoMetadata.
}) => {
  const [subtitles, setSubtitles] = useState<Caption[]>([]);
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();

  // Use the prop value, or a default if not provided.
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

  const PageComponent = captionStyle === "simple" ? SimplePage : SubtitlePage;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const subtitleStartFrame = (page.startMs / 1000) * fps;
        const subtitleEndFrame = nextPage ? (nextPage.startMs / 1000) * fps : Infinity;
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
            <PageComponent key={index} page={page} />;
          </Sequence>
        );
      })}
      {getFileExists(subtitlesFile) ? null : <NoCaptionFile />}
    </AbsoluteFill>
  );
};
