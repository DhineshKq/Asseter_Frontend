export const createImage = (url: any) =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
        image.src = url
    })

export function getRadianAngle(degreeValue: any) {
    return (degreeValue * Math.PI) / 180
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: any, height: any, rotation: any) {
    const rotRad = getRadianAngle(rotation)

    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export async function getCroppedImg(
    originalImage: File,
    imageSrc: any,
    pixelCrop: any,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
) {
    const image: any = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        return null
    }

    const rotRad = getRadianAngle(rotation)

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    )

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth
    canvas.height = bBoxHeight

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-image.width / 2, -image.height / 2)

    // draw rotated image
    ctx.drawImage(image, 0, 0)

    const croppedCanvas = document.createElement('canvas')

    const croppedCtx = croppedCanvas.getContext('2d')

    if (!croppedCtx) {
        return null
    }

    // Set the size of the cropped canvas
    croppedCanvas.width = pixelCrop.width
    croppedCanvas.height = pixelCrop.height

    // Draw the cropped image onto the new canvas
    croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    // As Base64 string
    return croppedCanvas.toDataURL('image/jpeg');

    let returnImg = canvas.toBlob(
        (blob) => {
            if (blob) {
                // Create a File object with the same extension as the original image
                const fileExt = imageSrc.split('.').pop();
                const fileName = originalImage.name;
                const croppedFile = new File([blob], fileName, { type: originalImage.type });
                return croppedFile;
                // resolve(croppedFile);
            } else {
                // resolve(null);
                return null;

            }
        },
        'image/jpeg', // Specify the output format if needed
        1
    );
    // async function base64toFile(base64String, filename, mimeType) {
    // const response = await fetch(`data:${originalImage.type};base64,${croppedCanvas.toDataURL(originalImage.type)}`);
    // const blob = await response.blob();

    // // Convert Blob to File
    // const file = new File([blob], originalImage.name, { type: originalImage.type });
    // return file;
    //   }

    return { returnImg, base64: croppedCanvas.toDataURL(originalImage.type) };
    // As a blob
    // return new Promise((resolve, reject) => {
    //     croppedCanvas.toBlob((file: any) => {
    //         resolve(URL.createObjectURL(file))
    //     }, 'image/jpeg')
    // })
}

export async function getRotatedImage(imageSrc: any, rotation = 0) {
    const image: any = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx: any = canvas.getContext('2d')

    const orientationChanged =
        rotation === 90 || rotation === -90 || rotation === 270 || rotation === -270
    if (orientationChanged) {
        canvas.width = image.height
        canvas.height = image.width
    } else {
        canvas.width = image.width
        canvas.height = image.height
    }

    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.drawImage(image, -image.width / 2, -image.height / 2)

    return new Promise((resolve) => {
        canvas.toBlob((file: any) => {
            resolve(URL.createObjectURL(file))
        }, 'image/png')
    })
}
