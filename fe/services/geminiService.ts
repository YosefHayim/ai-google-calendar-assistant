import { GoogleGenAI, Modality } from '@google/genai'

export const sendMessageToGemini = async (message: string, history: { role: string; parts: { text: string }[] }[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY })
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction:
        "You are Ally, a top-tier Personal AI Secretary and Chief of Staff for a high-level executive. Your tone is extremely professional, efficient, and proactive. Do not wait to be asked basic questions; if a meeting is scheduled, offer to find a buffer, block deep focus time, or research the participants. You manage Google Calendars with absolute precision. Avoid flowery 'AI' language. You are an employee of a private office. Use markdown for organization. If the user is running late, offer to notify stakeholders immediately. Your priority is executive leverage.",
      temperature: 0.7,
    },
  })
  return response.text
}

export const getSpeechFromGemini = async (text: string, voiceName: 'Kore' | 'Zephyr' | 'Puck' = 'Zephyr') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY })
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text: `Say this with a professional, poised, and efficient secretary tone: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  })
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
}

// Helper function to decode base64 string to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

// Helper to decode raw PCM data from Gemini
export async function decodeAudioData(
  base64: string,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const bytes = decode(base64)

  const dataInt16 = new Int16Array(bytes.buffer)
  const frameCount = dataInt16.length / numChannels
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate)

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel)
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0
    }
  }
  return buffer
}
