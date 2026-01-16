export interface ImageFile {
  id: string
  file: File
  preview: string
  base64?: string
}

export interface ImageLightboxProps {
  images: ImageFile[]
  currentIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onPrevious: () => void
  onNext: () => void
}

export interface ChatInputProps {
  input: string
  isLoading: boolean
  isRecording: boolean
  speechRecognitionSupported: boolean
  speechRecognitionError: string | null
  interimTranscription: string
  images?: ImageFile[]
  onInputChange: (value: string) => void
  onSubmit: (e?: React.FormEvent) => void
  onToggleRecording: () => void
  onStartRecording: () => void
  onStopRecording: (finalTranscription: string | null) => void
  onCancelRecording: () => void
  onInterimResult?: (text: string) => void
  onCancel?: () => void
  onImagesChange?: (images: ImageFile[]) => void
}
