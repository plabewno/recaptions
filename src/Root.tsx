import "./index.css";
import { Composition, staticFile } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CaptionedVideo"
      component={CaptionedVideo}
      calculateMetadata={calculateCaptionedVideoMetadata}
      schema={captionedVideoSchema}
      defaultProps={{
        src: staticFile("input.mp4"),
        width: 1080,
        height: 1920,
        fps: 30,
        switchCaptionsDurationMs: 200,
        captionStyle: "simple" as const,
        captionVerticalOffset: 30,
        captionHorizontalOffset: 0,
      }}
    />
  );
};
