import { continueRender, delayRender, staticFile } from "remotion";

export const CaptionFont = `CaptionFont`;

let loaded = false;

export const loadFont = async (): Promise<void> => {
  if (loaded) {
    return Promise.resolve();
  }

  const waitForFont = delayRender();

  loaded = true;

  const font = new FontFace(
    CaptionFont,
    `url('${staticFile("fonts/Rubik-Black.ttf")}') format('truetype')`,
  );

  await font.load();
  document.fonts.add(font);

  continueRender(waitForFont);
};
