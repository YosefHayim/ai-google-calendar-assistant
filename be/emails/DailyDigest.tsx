import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"
import type * as React from "react"

// ============================================
// Types
// ============================================

export type CalendarEvent = {
  id: string
  summary: string
  start: string // Formatted time string e.g., "9:00 AM"
  end?: string
  duration?: string // e.g., "1 hour", "30 min"
  location?: string
  meetLink?: string
  color?: string
}

export type DailyDigestProps = {
  userName: string
  dateFormatted: string // e.g., "Wednesday, January 15"
  events: CalendarEvent[]
  aiSummary?: string
  totalMeetingTime?: string // e.g., "4h 30m"
  dashboardUrl?: string
  settingsUrl?: string
  unsubscribeUrl?: string
  logoUrl?: string
}

// ============================================
// Brand Colors & Styles
// ============================================

const colors = {
  // Primary brand orange
  primary: "#f85a1e",
  primaryLight: "#fff4f0",
  primaryDark: "#c83a0b",
  // Neutral colors
  background: "#f5f5f5",
  white: "#ffffff",
  text: "#1a1a1a",
  textSecondary: "#666666",
  textMuted: "#9aa0a6",
  border: "#e8eaed",
  // Accent colors for stats
  accentBlue: "#e8f0fe",
  accentBlueText: "#1967d2",
  accentCoral: "#fce8e6",
  accentCoralText: "#c5221f",
}

const fonts = {
  primary:
    "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
}

// ============================================
// Main Component
// ============================================

export const DailyDigest = ({
  userName = "there",
  dateFormatted = "Today",
  events = [],
  aiSummary,
  totalMeetingTime,
  dashboardUrl = "https://askally.io/dashboard",
  settingsUrl = "https://askally.io/settings",
  unsubscribeUrl,
  logoUrl = "https://askally.io/logo.svg",
}: DailyDigestProps) => {
  const eventCount = events.length
  const hasEvents = eventCount > 0
  const previewText = hasEvents
    ? `${eventCount} event${eventCount !== 1 ? "s" : ""} scheduled for ${dateFormatted}`
    : `No events scheduled for ${dateFormatted}`

  return (
    <Html>
      <Head>
        <title>Your Daily Digest - {dateFormatted}</title>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
          `}
        </style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Main Card */}
          <Section style={styles.card}>
            {/* Header */}
            <Section style={styles.header}>
              {logoUrl && (
                <Img
                  alt="Ally"
                  height="40"
                  src={logoUrl}
                  style={styles.logo}
                  width="40"
                />
              )}
              <Text style={styles.brandName}>Ally</Text>
            </Section>

            <Hr style={styles.divider} />

            {/* Greeting */}
            <Section style={styles.greeting}>
              <Heading style={styles.greetingTitle}>
                {getGreeting()}, {userName}!
              </Heading>
              <Text style={styles.greetingSubtitle}>
                Here's your schedule for <strong>{dateFormatted}</strong>
              </Text>
            </Section>

            {/* AI Summary Section */}
            {aiSummary && (
              <Section style={styles.aiSummarySection}>
                <Row>
                  <Column style={styles.aiIconColumn}>
                    <Text style={styles.aiIcon}>✨</Text>
                  </Column>
                  <Column style={styles.aiTextColumn}>
                    <Text style={styles.aiSummaryText}>{aiSummary}</Text>
                  </Column>
                </Row>
              </Section>
            )}

            {/* Stats Row */}
            {hasEvents && (
              <Section style={styles.statsSection}>
                <Row>
                  <Column style={styles.statColumn}>
                    <Section style={styles.statBox}>
                      <Text style={styles.statNumber}>{eventCount}</Text>
                      <Text style={styles.statLabel}>
                        event{eventCount !== 1 ? "s" : ""}
                      </Text>
                    </Section>
                  </Column>
                  <Column style={{ width: "16px" }} />
                  <Column style={styles.statColumn}>
                    <Section style={styles.statBoxCoral}>
                      <Text style={styles.statNumberCoral}>
                        {totalMeetingTime || calculateTotalTime(events)}
                      </Text>
                      <Text style={styles.statLabelCoral}>total time</Text>
                    </Section>
                  </Column>
                </Row>
              </Section>
            )}

            {/* Schedule Table */}
            <Section style={styles.scheduleSection}>
              <Text style={styles.sectionTitle}>Today's Schedule</Text>

              {hasEvents ? (
                <Section style={styles.eventsContainer}>
                  {events.map((event, index) => (
                    <Section key={event.id || index} style={styles.eventCard}>
                      <Row>
                        <Column style={styles.eventTimeColumn}>
                          <Text style={styles.eventTime}>{event.start}</Text>
                          {event.duration && (
                            <Text style={styles.eventDuration}>
                              {event.duration}
                            </Text>
                          )}
                        </Column>
                        <Column style={styles.eventDivider}>
                          <Section style={styles.eventDot} />
                          {index < events.length - 1 && (
                            <Section style={styles.eventLine} />
                          )}
                        </Column>
                        <Column style={styles.eventDetailsColumn}>
                          <Text style={styles.eventSummary}>
                            {event.summary}
                          </Text>
                          {event.location && (
                            <Text style={styles.eventLocation}>
                              📍 {event.location}
                            </Text>
                          )}
                          {event.meetLink && (
                            <Link
                              href={event.meetLink}
                              style={styles.eventMeetLink}
                            >
                              🔗 Join meeting
                            </Link>
                          )}
                        </Column>
                      </Row>
                    </Section>
                  ))}
                </Section>
              ) : (
                <Section style={styles.noEventsContainer}>
                  <Text style={styles.noEventsEmoji}>🎉</Text>
                  <Text style={styles.noEventsTitle}>No events today!</Text>
                  <Text style={styles.noEventsText}>
                    You have a clear schedule. Enjoy your free day or use this
                    time to tackle something meaningful.
                  </Text>
                </Section>
              )}
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Link href={dashboardUrl} style={styles.ctaButton}>
                View Full Dashboard
              </Link>
            </Section>

            {/* Footer */}
            <Hr style={styles.footerDivider} />
            <Section style={styles.footer}>
              <Text style={styles.footerText}>
                Sent by{" "}
                <Link href="https://askally.io" style={styles.footerLink}>
                  Ally
                </Link>{" "}
                - Your AI Calendar Assistant
              </Text>
              <Text style={styles.footerLinks}>
                <Link href={settingsUrl} style={styles.footerLink}>
                  Manage Preferences
                </Link>
                {unsubscribeUrl && (
                  <>
                    {" • "}
                    <Link href={unsubscribeUrl} style={styles.footerLinkMuted}>
                      Unsubscribe
                    </Link>
                  </>
                )}
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ============================================
// Helper Functions
// ============================================

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) {
    return "Good morning"
  }
  if (hour < 17) {
    return "Good afternoon"
  }
  return "Good evening"
}

function calculateTotalTime(events: CalendarEvent[]): string {
  let totalMinutes = 0

  for (const event of events) {
    if (!event.duration) {
      continue
    }
    const match = event.duration.match(/(\d+)\s*hour|(\d+)\s*min/gi)
    if (!match) {
      continue
    }

    for (const m of match) {
      const num = Number.parseInt(m, 10)
      if (m.toLowerCase().includes("hour")) {
        totalMinutes += num * 60
      } else {
        totalMinutes += num
      }
    }
  }

  if (totalMinutes === 0) {
    return "0m"
  }

  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  return `${mins}m`
}

// ============================================
// Styles
// ============================================

const styles = {
  body: {
    backgroundColor: colors.background,
    fontFamily: fonts.primary,
    margin: 0,
    padding: 0,
  } as React.CSSProperties,

  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "24px 16px",
  } as React.CSSProperties,

  card: {
    backgroundColor: colors.white,
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  } as React.CSSProperties,

  // Header
  header: {
    textAlign: "center" as const,
    marginBottom: "8px",
  } as React.CSSProperties,

  logo: {
    margin: "0 auto 8px",
    display: "block",
  } as React.CSSProperties,

  brandName: {
    fontSize: "24px",
    fontWeight: "700",
    color: colors.primary,
    margin: "0",
    letterSpacing: "-0.5px",
  } as React.CSSProperties,

  divider: {
    borderColor: colors.border,
    borderWidth: "1px",
    margin: "20px 0",
  } as React.CSSProperties,

  // Greeting
  greeting: {
    textAlign: "center" as const,
    marginBottom: "24px",
  } as React.CSSProperties,

  greetingTitle: {
    fontSize: "28px",
    fontWeight: "600",
    color: colors.text,
    margin: "0 0 8px",
    lineHeight: "1.3",
  } as React.CSSProperties,

  greetingSubtitle: {
    fontSize: "16px",
    color: colors.textSecondary,
    margin: "0",
  } as React.CSSProperties,

  // AI Summary
  aiSummarySection: {
    backgroundColor: colors.primaryLight,
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "24px",
    borderLeft: `4px solid ${colors.primary}`,
  } as React.CSSProperties,

  aiIconColumn: {
    width: "32px",
    verticalAlign: "top" as const,
  } as React.CSSProperties,

  aiIcon: {
    fontSize: "20px",
    margin: "0",
  } as React.CSSProperties,

  aiTextColumn: {
    verticalAlign: "top" as const,
  } as React.CSSProperties,

  aiSummaryText: {
    fontSize: "15px",
    color: colors.text,
    margin: "0",
    lineHeight: "1.5",
    fontStyle: "italic" as const,
  } as React.CSSProperties,

  // Stats
  statsSection: {
    marginBottom: "24px",
  } as React.CSSProperties,

  statColumn: {
    width: "50%",
  } as React.CSSProperties,

  statBox: {
    backgroundColor: colors.accentBlue,
    borderRadius: "12px",
    padding: "16px",
    textAlign: "center" as const,
  } as React.CSSProperties,

  statBoxCoral: {
    backgroundColor: colors.accentCoral,
    borderRadius: "12px",
    padding: "16px",
    textAlign: "center" as const,
  } as React.CSSProperties,

  statNumber: {
    fontSize: "32px",
    fontWeight: "700",
    color: colors.accentBlueText,
    margin: "0",
  } as React.CSSProperties,

  statNumberCoral: {
    fontSize: "32px",
    fontWeight: "700",
    color: colors.accentCoralText,
    margin: "0",
  } as React.CSSProperties,

  statLabel: {
    fontSize: "14px",
    color: colors.textSecondary,
    margin: "4px 0 0",
  } as React.CSSProperties,

  statLabelCoral: {
    fontSize: "14px",
    color: colors.textSecondary,
    margin: "4px 0 0",
  } as React.CSSProperties,

  // Schedule
  scheduleSection: {
    marginBottom: "24px",
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    margin: "0 0 16px",
  } as React.CSSProperties,

  eventsContainer: {
    margin: "0",
  } as React.CSSProperties,

  eventCard: {
    marginBottom: "12px",
  } as React.CSSProperties,

  eventTimeColumn: {
    width: "70px",
    verticalAlign: "top" as const,
  } as React.CSSProperties,

  eventTime: {
    fontSize: "14px",
    fontWeight: "600",
    color: colors.text,
    margin: "0",
  } as React.CSSProperties,

  eventDuration: {
    fontSize: "12px",
    color: colors.textMuted,
    margin: "2px 0 0",
  } as React.CSSProperties,

  eventDivider: {
    width: "24px",
    verticalAlign: "top" as const,
    textAlign: "center" as const,
  } as React.CSSProperties,

  eventDot: {
    width: "10px",
    height: "10px",
    backgroundColor: colors.primary,
    borderRadius: "50%",
    margin: "4px auto 0",
  } as React.CSSProperties,

  eventLine: {
    width: "2px",
    height: "40px",
    backgroundColor: colors.border,
    margin: "4px auto 0",
  } as React.CSSProperties,

  eventDetailsColumn: {
    verticalAlign: "top" as const,
    paddingLeft: "8px",
  } as React.CSSProperties,

  eventSummary: {
    fontSize: "15px",
    fontWeight: "500",
    color: colors.text,
    margin: "0 0 4px",
  } as React.CSSProperties,

  eventLocation: {
    fontSize: "13px",
    color: colors.textSecondary,
    margin: "0 0 4px",
  } as React.CSSProperties,

  eventMeetLink: {
    fontSize: "13px",
    color: colors.primary,
    textDecoration: "none",
    display: "inline-block",
  } as React.CSSProperties,

  // No Events
  noEventsContainer: {
    textAlign: "center" as const,
    padding: "32px",
    backgroundColor: colors.primaryLight,
    borderRadius: "12px",
  } as React.CSSProperties,

  noEventsEmoji: {
    fontSize: "48px",
    margin: "0 0 16px",
  } as React.CSSProperties,

  noEventsTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: colors.text,
    margin: "0 0 8px",
  } as React.CSSProperties,

  noEventsText: {
    fontSize: "15px",
    color: colors.textSecondary,
    margin: "0",
    lineHeight: "1.5",
  } as React.CSSProperties,

  // CTA
  ctaSection: {
    textAlign: "center" as const,
    marginBottom: "24px",
  } as React.CSSProperties,

  ctaButton: {
    display: "inline-block",
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: "16px",
    fontWeight: "600",
    padding: "14px 32px",
    borderRadius: "8px",
    textDecoration: "none",
    textAlign: "center" as const,
  } as React.CSSProperties,

  // Footer
  footerDivider: {
    borderColor: colors.border,
    borderWidth: "1px",
    margin: "0 0 20px",
  } as React.CSSProperties,

  footer: {
    textAlign: "center" as const,
  } as React.CSSProperties,

  footerText: {
    fontSize: "13px",
    color: colors.textMuted,
    margin: "0 0 8px",
  } as React.CSSProperties,

  footerLinks: {
    fontSize: "13px",
    color: colors.textMuted,
    margin: "0",
  } as React.CSSProperties,

  footerLink: {
    color: colors.primary,
    textDecoration: "none",
  } as React.CSSProperties,

  footerLinkMuted: {
    color: colors.textMuted,
    textDecoration: "underline",
  } as React.CSSProperties,
}

// ============================================
// Default Export
// ============================================

export default DailyDigest
