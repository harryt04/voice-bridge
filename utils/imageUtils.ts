/**
 * Compresses an image and converts it to base64
 * @param file The image file to process
 * @param maxWidth Maximum width for the compressed image
 * @param maxHeight Maximum height for the compressed image
 * @param quality Compression quality (0 to 1)
 * @returns A promise that resolves to the base64 string of the compressed image
 */
export const compressAndConvertToBase64 = (
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        // Create canvas for resizing
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        // Draw and compress the image
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        // Convert to base64
        const base64String = canvas.toDataURL('image/jpeg', quality)
        resolve(base64String)
      }

      img.onerror = (error) => {
        reject(error)
      }
    }

    reader.onerror = (error) => {
      reject(error)
    }
  })
}
