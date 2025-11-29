/**
 * Composable for handling mobile phone images with fallback support
 * Prevents Vue Router warnings for missing images
 */
export const useMobileImage = () => {
  const placeholder = '/mobile_images/placeholder.svg'

  /**
   * Generate image path for a mobile phone model
   * @param company - Phone manufacturer
   * @param modelName - Phone model name
   * @param imageNumber - Image number (1, 2, or 3)
   * @returns Image path or placeholder
   */
  const getImagePath = (company: string, modelName: string, imageNumber: number = 1): string => {
    if (!company || !modelName) return placeholder

    const sanitizedName = `${company}_${modelName}`
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .substring(0, 100)

    return `/mobile_images/${sanitizedName}/${sanitizedName}_${imageNumber}.jpg`
  }

  /**
   * Generate all image paths for a model (1-3)
   * @param company - Phone manufacturer
   * @param modelName - Phone model name
   * @returns Array of image paths
   */
  const getAllImagePaths = (company: string, modelName: string): string[] => {
    return [1, 2, 3].map(num => getImagePath(company, modelName, num))
  }

  /**
   * Handle image load error by replacing with placeholder
   * @param event - Image error event
   */
  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    if (img && img.src !== placeholder) {
      img.src = placeholder
      img.alt = 'Image not available'
    }
  }

  /**
   * Preload an image to check if it exists
   * @param src - Image source URL
   * @returns Promise that resolves to true if image loads, false otherwise
   */
  const imageExists = (src: string): Promise<boolean> => {
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = src
    })
  }

  /**
   * Get the first available image from a list of paths
   * @param paths - Array of image paths to try
   * @returns Promise resolving to first available image or placeholder
   */
  const getFirstAvailableImage = async (paths: string[]): Promise<string> => {
    for (const path of paths) {
      const exists = await imageExists(path)
      if (exists) return path
    }
    return placeholder
  }

  return {
    placeholder,
    getImagePath,
    getAllImagePaths,
    handleImageError,
    imageExists,
    getFirstAvailableImage,
  }
}
