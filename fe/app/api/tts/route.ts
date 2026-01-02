import { getSpeechFromGemini } from '@/services/geminiService'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const audioContent = await getSpeechFromGemini(text)

    if (!audioContent) {
      return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 })
    }

    return NextResponse.json({ audioContent })
  } catch (error) {
    console.error('Gemini TTS Error in Route:', error)
    return NextResponse.json({ error: 'Failed to get response from Gemini TTS API' }, { status: 500 })
  }
}
