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
        width: 1920,
        height: 1080,
        switchCaptionsDurationMs: 2000,
        captionStyle: "Ali Abdaal",
      }}
    />
  );
};
