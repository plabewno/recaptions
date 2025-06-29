Create a fully functional, modern frontend UI for the @/src/ and @/transcriber.mjs Remotion app.
I have set up a React, Rsbuild, and Tailwind CSS project in the @/ui/ folder.
And I've installed and setup a hono-bun starter code in the @server.mjs file.
Store any data or file in the @/temp/ folder.

The new UI App should have the following features:
- Upload the input video or audio directly through the frontend UI.
- Transcribing and Remotion captions preview, rendering from the frontend UI.
- Download the rendered video directly in the user's browser.
- A user-friendly, modern toolkit for customizing captions.
- Hono.js for the backend server.

These might help:
https://www.remotion.dev/docs/videos/
https://www.remotion.dev/docs/miscellaneous/snippets/align-duration
https://www.remotion.dev/docs/videos/sequence
https://www.remotion.dev/docs/video-vs-offthreadvideo

You might need to use the @remotion/player to setup the preview in this react ui:
https://www.remotion.dev/docs/player
https://www.remotion.dev/docs/player/player
https://www.remotion.dev/docs/player/examples
https://www.remotion.dev/docs/player/scaling
https://www.remotion.dev/docs/player/custom-controls
https://www.remotion.dev/docs/player/media-keys
https://www.remotion.dev/docs/player/best-practices
https://www.remotion.dev/docs/player/drag-and-drop

You might also wanna use parseMedia():
https://www.remotion.dev/docs/media-parser/
https://www.remotion.dev/docs/media-parser/parse-media
https://www.remotion.dev/docs/media-parser/metadata
https://www.remotion.dev/docs/media-parser/samples
https://www.remotion.dev/docs/media-parser/webcodecs
https://www.remotion.dev/docs/media-parser/pause-resume-abort