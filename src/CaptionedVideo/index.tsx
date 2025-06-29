import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  cancelRender,
  continueRender,
  delayRender,
  getStaticFiles,
  Sequence,
  useVideoConfig,
  watchStaticFile,
  getRemotionEnvironment,
} from "remotion";
import { z } from "zod";
import SubtitlePage from "./SubtitlePage";
import { getAudioData, getVideoMetadata } from "@remotion/media-utils";
import { Simple } from "./CaptionStyles/Simple";
import { loadFont } from "../load-font";
import { NoCaptionFile } from "./NoCaptionFile";
import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
import { CaptionReferenceList } from "./CaptionReferenceList";

export const captionStyles = ["Ali Abdaal", "simple"] as const;

const textTransformOptions = ["capitalize", "uppercase", "lowercase"] as const;

const captionSchema = {
  fps: z.number().int().positive().optional().default(30),
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
  captionColor: z
    .string({
      description: '{"widget": "color", "label": "Default Caption Color"}',
    })
    .optional()
    .default("#FFFFFF"),
  colorOverrides: z
    .string({
      description:
        '{"widget": "textarea", "label": "Color Overrides (index:color)"}',
    })
    .optional()
    .default(""),
  showReferenceList: z
    .boolean({
      description: '{"widget": "toggle", "label": "Show Reference List"}',
    })
    .optional()
    .default(true),
  textTransform: z.enum(textTransformOptions).optional().default("capitalize"),
  shadowBlur: z
    .number({
      description: '{"widget": "number", "label": "Shadow Blur (px)"}',
    })
    .min(0)
    .optional()
    .default(20),
  shadowColor: z
    .string({
      description: '{"widget": "color", "label": "Shadow Color"}',
    })
    .optional()
    .default("rgba(0,0,0,1)"),
};

export const captionedVideoSchema = z.object({
  src: z.string(),
  ...captionSchema,
});

export const captionedAudioSchema = z.object({
  src: z.string(),
  ...captionSchema,
});

export const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
  z.infer<typeof captionedVideoSchema>
> = async ({ props }) => {
  const { fps } = props;
  const metadata = await getVideoMetadata(props.src);

  return {
    fps,
    durationInFrames: Math.floor(metadata.durationInSeconds * fps),
    width: props.width,
    height: props.height,
  };
};

export const calculateCaptionedAudioMetadata: CalculateMetadataFunction<
  z.infer<typeof captionedAudioSchema>
> = async ({ props }) => {
  const { fps } = props;
  const metadata = await getAudioData(props.src);

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
  textTransform,
  captionColor,
  colorOverrides,
  showReferenceList,
  shadowBlur,
  shadowColor,
}) => {
  const [subtitles, setSubtitles] = useState<Caption[]>([]);
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();
  const { isStudio } = getRemotionEnvironment();

  const switchCaptionsDurationMs = switchCaptionsDurationMsProp ?? 1500;

  const subtitlesFile = src
    .replace(/\.mp4$/, ".json")
    .replace(/\.mkv$/, ".json")
    .replace(/\.mov$/, ".json")
    .replace(/\.webm$/, ".json")
    .replace(/\.mp3$/, ".json")
    .replace(/\.wav$/, ".json")
    .replace(/\.aac$/, ".json")
    .replace(/\.flac$/, ".json")
    .replace(/\.ogg$/, ".json")
    .replace(/\.m4a$/, ".json");

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

  // Parse the colorOverrides string into a map of index -> color
  const colorOverridesMap = useMemo(() => {
    const map: { [key: number]: string } = {};
    if (!colorOverrides) {
      return map;
    }
    // Split by comma to get individual rules: "2:red", "5:#00ff00"
    const rules = colorOverrides.split(",").filter(Boolean);
    for (const rule of rules) {
      // Split by colon to get the index and color
      const parts = rule.split(":").map((p) => p.trim());
      if (parts.length !== 2) continue; // Malformed rule

      const index = parseInt(parts[0], 10);
      const color = parts[1];

      if (!isNaN(index) && color) {
        map[index] = color;
      }
    }
    return map;
  }, [colorOverrides]);

  const PageComponent = captionStyle === "simple" ? Simple : SubtitlePage;

  const positioningStyle = useMemo((): React.CSSProperties => {
    return {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      transform: `translateX(${captionHorizontalOffset}%) translateY(${captionVerticalOffset}%)`,
    };
  }, [captionVerticalOffset, captionHorizontalOffset]);

  const isAudio = src.endsWith(".wav") || src.endsWith(".mp3");

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {isAudio && <Audio src={src} />}
      <CaptionReferenceList
        pages={pages}
        show={isStudio && showReferenceList}
      />

      {pages.map((page, index) => {
        const subtitleStartFrame = (page.startMs / 1000) * fps;

        // The end time of a caption page is the end time of its last word.
        const lastToken = page.tokens[page.tokens.length - 1];
        if (!lastToken) {
          return null;
        }
        const pageEndMs = lastToken.toMs;
        const durationInFrames = ((pageEndMs - page.startMs) / 1000) * fps;

        if (durationInFrames <= 0) {
          return null;
        }

        // Check if there is an override for this index, otherwise use the default color
        const finalColor = colorOverridesMap[index] ?? captionColor;

        return (
          <Sequence
            key={index}
            from={subtitleStartFrame}
            durationInFrames={durationInFrames}
          >
            <AbsoluteFill style={positioningStyle}>
              <PageComponent
                key={index}
                page={page}
                textTransform={textTransform}
                captionColor={finalColor}
                shadowBlur={shadowBlur}
                shadowColor={shadowColor}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {getFileExists(subtitlesFile) ? null : <NoCaptionFile />}
    </AbsoluteFill>
  );
};
