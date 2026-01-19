import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the metric data
    const { name, value, id, delta, timestamp, url } = body

    if (!name || typeof value !== 'number' || !id) {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      )
    }

    // In a real application, you would send this to your analytics service
    // For now, we'll just log it (you can replace this with your analytics provider)
    console.log('Web Vitals Metric:', {
      name,
      value,
      id,
      delta,
      timestamp,
      url,
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for'),
    })

    // You could also store this in a database or send to services like:
    // - Google Analytics 4
    // - Mixpanel
    // - PostHog
    // - Sentry
    // - Custom analytics service

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing web vitals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}