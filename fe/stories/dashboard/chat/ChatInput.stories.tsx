import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ChatInput, ImageFile } from '@/components/dashboard/chat/ChatInput'
import { useState } from 'react'

const meta: Meta<typeof ChatInput> = {
  title: 'Dashboard/Chat/ChatInput',
  component: ChatInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto bg-muted dark:bg-secondary p-4 rounded-xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs = {
  input: '',
  isLoading: false,
  isRecording: false,
  speechRecognitionSupported: true,
  speechRecognitionError: null,
  interimTranscription: '',
  images: [],
  onInputChange: () => {},
  onSubmit: () => {},
  onToggleRecording: () => {},
  onStartRecording: () => {},
  onStopRecording: () => {},
  onCancelRecording: () => {},
  onInterimResult: () => {},
  onCancel: undefined,
  onImagesChange: () => {},
}

export const Default: Story = {
  args: defaultArgs,
}

export const WithText: Story = {
  args: {
    ...defaultArgs,
    input: 'Schedule a meeting with the team tomorrow at 2pm',
  },
}

export const Loading: Story = {
  args: {
    ...defaultArgs,
    input: 'Creating your meeting...',
    isLoading: true,
    onCancel: () => {},
  },
}

export const Recording: Story = {
  args: {
    ...defaultArgs,
    isRecording: true,
    interimTranscription: 'Schedule a meeting...',
  },
}

export const WithImages: Story = {
  render: () => {
    const mockImages: ImageFile[] = [
      {
        id: '1',
        file: new File([''], 'screenshot1.png', { type: 'image/png' }),
        preview: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop',
        base64: '',
      },
      {
        id: '2',
        file: new File([''], 'screenshot2.png', { type: 'image/png' }),
        preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
        base64: '',
      },
    ]

    return <ChatInput {...defaultArgs} input="Here are my calendar screenshots" images={mockImages} />
  },
}

export const MaxImages: Story = {
  render: () => {
    const mockImages: ImageFile[] = Array.from({ length: 10 }, (_, i) => ({
      id: String(i + 1),
      file: new File([''], `image${i + 1}.png`, { type: 'image/png' }),
      preview: `https://picsum.photos/200/200?random=${i}`,
      base64: '',
    }))

    return <ChatInput {...defaultArgs} input="Maximum images reached" images={mockImages} />
  },
}

export const SpeechNotSupported: Story = {
  args: {
    ...defaultArgs,
    speechRecognitionSupported: false,
  },
}

export const SpeechError: Story = {
  args: {
    ...defaultArgs,
    speechRecognitionError: 'Microphone access denied',
  },
}

export const RTLInput: Story = {
  args: {
    ...defaultArgs,
    input: 'קבע פגישה עם הצוות מחר בשעה 2',
  },
}

export const LongInput: Story = {
  args: {
    ...defaultArgs,
    input:
      'I need to schedule a series of meetings for next week. On Monday, I have a standup at 9am, then a client call at 11am. Tuesday is mostly free except for a lunch meeting. Wednesday has back-to-back meetings from 10am to 4pm. Can you help me find some focus time blocks?',
  },
}

export const NearCharacterLimit: Story = {
  args: {
    ...defaultArgs,
    input: 'A'.repeat(3800),
  },
}

export const Interactive: Story = {
  render: function InteractiveChat() {
    const [input, setInput] = useState('')
    const [images, setImages] = useState<ImageFile[]>([])
    const [isRecording, setIsRecording] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = () => {
      if (!input.trim() && images.length === 0) return
      setIsLoading(true)
      setTimeout(() => {
        setInput('')
        setImages([])
        setIsLoading(false)
      }, 2000)
    }

    return (
      <ChatInput
        input={input}
        isLoading={isLoading}
        isRecording={isRecording}
        speechRecognitionSupported={true}
        speechRecognitionError={null}
        interimTranscription=""
        images={images}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onToggleRecording={() => setIsRecording(!isRecording)}
        onStartRecording={() => setIsRecording(true)}
        onStopRecording={() => setIsRecording(false)}
        onCancelRecording={() => setIsRecording(false)}
        onImagesChange={setImages}
        onCancel={isLoading ? () => setIsLoading(false) : undefined}
      />
    )
  },
}
