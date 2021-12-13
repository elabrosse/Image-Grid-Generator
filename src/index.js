import * as Magick from './magickApi.js';

const imageInput = document.getElementById('image-input');
const btnStartProcess = document.getElementById('start-process-images');
btnStartProcess.addEventListener("click", processImages);

function clearOutput() {
    document.getElementsByClassName('processed-images')[0].innerHTML = '';
}

export async function processImages(event) {
    const currentFiles = imageInput.files;

    if (currentFiles.length) {
        clearOutput();
        const template = document.querySelector('#tmpl-processed');
        const nbCellsX = Number(document.querySelector('#nb-columns').value);
        const nbCellsY = Number(document.querySelector('#nb-rows').value);
        const nbCells = nbCellsX * nbCellsY;

        for (const imageFile of currentFiles) {
            const clone = template.content.cloneNode(true);
            const outWrapper = clone.querySelector('.out-wrapper');
            const srcImg = clone.querySelector('.source-img');
            const srcImgUrl = URL.createObjectURL(imageFile);
            srcImg.src = srcImgUrl;

            const magickInputFile = await Magick.buildInputFile(srcImgUrl);
            const imgInfo = await Magick.extractInfo(magickInputFile);

            const width = imgInfo[0].image.geometry.width;
            const height = imgInfo[0].image.geometry.height;

            // attempt to minimize end of line length discrepancy compared to the rest of the cells...
            const realWidth = width / nbCellsX;
            const realHeight = height / nbCellsY;
            const cellWidth = Math.round(realWidth) === Math.floor(realWidth) ? Math.floor(realWidth) : Math.ceil(realWidth);
            const cellHeight = Math.round(realHeight) === Math.floor(realHeight) ? Math.floor(realHeight) : Math.ceil(realHeight);

            let currentIndex = 0;

            for (let currentCellY = 0; currentCellY < nbCellsY; currentCellY++) {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'grid-row container-fluid'
                for (let currentCellX = 0; currentCellX < nbCellsX; currentCellX++) {
                    console.log('Processing cell:', ++currentIndex, 'of', nbCells);

                    const offsetX = currentCellX * cellWidth;
                    const offsetY = currentCellY * cellHeight;
                    const fileNameOut = getFileName(imageFile.name, nbCellsX, nbCellsY, currentIndex, nbCells);
                    const inputImage = await Magick.buildInputFile(srcImgUrl, 'tmpImage.png');
                    const { outputFiles, exitCode, stderr } = await Magick.execute({
                        inputFiles: [inputImage],
                        commands: [
                            `convert -crop ${cellWidth}x${cellHeight}+${offsetX}+${offsetY} tmpImage.png "${fileNameOut}"`
                        ],
                    })

                    console.log('Done processing cell:', currentIndex, 'of', nbCells, '---', outputFiles, exitCode, stderr);

                    // output some debug info
                    let outImgInfo = await Magick.extractInfo({ name: fileNameOut, content: new Uint8Array(outputFiles[0].buffer) });
                    const width = outImgInfo[0].image.geometry.width;
                    const height = outImgInfo[0].image.geometry.height;
                    console.log('Generated image', fileNameOut, width, height);

                    // finally create the image preview and download link
                    let newImage = new Image(cellWidth, cellHeight);
                    newImage.src = await Magick.buildImageSrc({
                        name: fileNameOut,
                        content: outputFiles[0].buffer
                    });
                    newImage.className = 'img-fluid'
                    rowDiv.appendChild(newImage);
                    downloadImg(newImage, fileNameOut);
                    await shortTimeout();

                    // Gotta start clearing those file handles at some point.
                    // On debian I hit a limit at around 4000 handles. // Wonder
                    // what that limit is on windows O_o This might be how to
                    // fix the file handle limit crash, but for that we'll have
                    // to only display the last N thumbnails instead of
                    // everything. This destroys the image preview.

                    // setTimeout(() => {URL.revokeObjectURL(newImage.src)},
                    // 10000)
                }
                outWrapper.appendChild(rowDiv);
            }
            document.querySelector('.processed-images').appendChild(clone);
        }
    }
}

/**
 * Short pause otherwise chromium refuses to download files past the 10th one or so.
 */
function shortTimeout() {
    return new Promise((resolve) => {
        setTimeout(resolve, 60);
    })
}

function getFileName(imageName, nbCellsX, nbCellsY, currentIndex, nbCells) {
    const baseName = `${imageName.substr(0, imageName.lastIndexOf('.'))}`,
        paddedIndex = `${zeroPad(currentIndex, String(nbCells).length)}`;
    return `${baseName}-${nbCellsX}x${nbCellsY}-${paddedIndex}.png`
}

function zeroPad(num, places) {
    return String(num).padStart(places, '0');
}

function downloadImg(imgEl, fileName) {
    const fileType = 'image/png';
    const anchorEl = document.createElement('a');
    anchorEl.download = fileName;
    anchorEl.href = imgEl.src;
    anchorEl.dataset.downloadurl = [fileType, anchorEl.download, anchorEl.href].join(':');
    anchorEl.style.display = "none";
    document.body.appendChild(anchorEl);
    anchorEl.click();

    setTimeout(() => {
        document.body.removeChild(anchorEl);
    }, 200);
}
