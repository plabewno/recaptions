import "./index.css";
import { Composition, staticFile } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedAudioMetadata,
  captionedAudioSchema,
} from "./CaptionedVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CaptionedVideo"
      component={CaptionedVideo}
      calculateMetadata={calculateCaptionedAudioMetadata}
      schema={captionedAudioSchema}
      defaultProps={{
        src: staticFile("input.wav"),
        width: 1080,
        height: 1920,
        fps: 30,
        switchCaptionsDurationMs: 200,
        captionStyle: "simple" as const,
        captionVerticalOffset: 30,
        captionHorizontalOffset: 0,
        textTransform: "capitalize" as const,
        captionColor: "#FFFFFF",
        colorOverrides: "2:#FFFF00, 5:cyan, 8:#FF69B4",
        showReferenceList: true,
      }}
    />
  );
};
