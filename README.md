# Image-Grid-Generator
Select one or multiple images to crop them into a grid of individual images.

## Key Features
- Runs in the browser
- Virtually unlimited number of cells
- Crops with single-threaded WASM-ImageMagick https://www.npmjs.com/package/wasm-imagemagick
- Styling by bootstrap v4 https://getbootstrap.com/docs/4.0/getting-started/introduction/
- Icons by https://fontawesome.com

## How To Use
The app is self-hosted on GitHub with prebuilt static files under the _dist_ folder. Access it at https://elabrosse.github.io/Image-Grid-Generator/dist/

1. Select one or multiple images
2. Enter a number of rows and cells
3. Click _Process Images_

The browser might freeze for a while depending on the image size to process.

The generated images will be downloaded by the browser. Make sure to select _Automatically Save File_ to your downloads folder.

There is no progress bar. When the generation is over a preview is displayed in the page.

## Building
Builds on Linux and MacOS.

Depends on _nodejs_ with _npm_.

Install dependencies in the root folder:

`npm install`

Build the dist folder:

`npm run build`

The built files must be served by a web server.
