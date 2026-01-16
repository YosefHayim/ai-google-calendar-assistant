export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const result = reader.result
        if (typeof result !== 'string') {
          throw new Error('Failed to read file as data URL')
        }
        const parts = result.split(',')
        if (parts.length !== 2 || !parts[1]) {
          throw new Error('Invalid data URL format')
        }
        resolve(parts[1])
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
