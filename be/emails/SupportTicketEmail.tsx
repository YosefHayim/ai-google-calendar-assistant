import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import type * as React from "react"

export type SupportTicketEmailProps = {
  ticketNumber: string
  userName: string
  userEmail: string
  subject: string
  description: string
  category: string
  priority: string
  attachmentCount?: number
  attachmentUrls?: string[]
  logoUrl?: string
}

const colors = {
  primary: "#f97316",
  background: "#f6f9fc",
  white: "#ffffff",
  text: "#0a0a0b",
  textSecondary: "#737373",
  textMuted: "#a3a3a3",
  border: "#e5e5e5",
  cardBg: "#fafafa",
  attachmentBg: "#fff7ed",
  urgent: "#dc2626",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
}

const fonts = {
  primary:
    "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
}

const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case "urgent":
      return colors.urgent
    case "high":
      return colors.high
    case "medium":
      return colors.medium
    case "low":
      return colors.low
    default:
      return colors.medium
  }
}

export const SupportTicketEmail = ({
  ticketNumber,
  userName,
  userEmail,
  subject,
  description,
  category,
  priority,
  attachmentCount = 0,
  attachmentUrls = [],
  logoUrl = "https://askally.io/logo.svg",
}: SupportTicketEmailProps) => (
  <Html>
    <Head>
      <title>Support Ticket: {ticketNumber}</title>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        `}
      </style>
    </Head>
    <Preview>
      Support Ticket {ticketNumber}: {subject}
    </Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        <Section style={styles.card}>
          {logoUrl && (
            <Img
              alt="Ally"
              height="48"
              src={logoUrl}
              style={styles.logo}
              width="48"
            />
          )}

          <Hr style={styles.divider} />

          <Section style={styles.headerSection}>
            <Text style={styles.ticketBadge}>{ticketNumber}</Text>
            <Text style={styles.heading}>New Support Ticket</Text>
            <Section style={styles.tagsContainer}>
              <Text
                style={{
                  ...styles.priorityBadge,
                  backgroundColor: getPriorityColor(priority),
                }}
              >
                {priority.toUpperCase()}
              </Text>
              <Text style={styles.categoryBadge}>{category}</Text>
            </Section>
          </Section>

          <Section style={styles.detailsCard}>
            <Section style={styles.detailRow}>
              <Text style={styles.detailLabel}>From</Text>
              <Text style={styles.detailValue}>{userName}</Text>
              <Text style={styles.detailEmail}>{userEmail}</Text>
            </Section>

            <Hr style={styles.innerDivider} />

            <Section style={styles.detailRow}>
              <Text style={styles.detailLabel}>Subject</Text>
              <Text style={styles.detailValue}>{subject}</Text>
            </Section>

            <Hr style={styles.innerDivider} />

            <Section style={styles.detailRow}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.messageText}>{description}</Text>
            </Section>
          </Section>

          {attachmentCount > 0 && (
            <Section style={styles.attachmentSection}>
              <Text style={styles.attachmentHeader}>
                📎 {attachmentCount} Attachment{attachmentCount > 1 ? "s" : ""}
              </Text>
              {attachmentUrls.map((url, index) => (
                <Button
                  key={index}
                  href={url}
                  style={styles.attachmentLink}
                >
                  View Attachment {index + 1}
                </Button>
              ))}
            </Section>
          )}

          <Section style={styles.ctaSection}>
            <Button href={`mailto:${userEmail}`} style={styles.ctaButton}>
              Reply to {userName}
            </Button>
          </Section>

          <Hr style={styles.divider} />

          <Text style={styles.footerText}>
            This ticket was submitted through Ask Ally support system.
          </Text>
          <Text style={styles.footerAddress}>
            Ally - Your AI Calendar Assistant
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

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
    padding: "40px 48px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  } as React.CSSProperties,

  logo: {
    display: "block",
  } as React.CSSProperties,

  divider: {
    borderColor: colors.border,
    borderWidth: "1px",
    margin: "24px 0",
  } as React.CSSProperties,

  headerSection: {
    marginBottom: "24px",
  } as React.CSSProperties,

  ticketBadge: {
    display: "inline-block",
    backgroundColor: colors.cardBg,
    color: colors.textSecondary,
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 12px",
    borderRadius: "20px",
    marginBottom: "12px",
  } as React.CSSProperties,

  heading: {
    fontSize: "24px",
    fontWeight: "600",
    color: colors.text,
    margin: "0 0 12px",
  } as React.CSSProperties,

  tagsContainer: {
    display: "flex",
    gap: "8px",
  } as React.CSSProperties,

  priorityBadge: {
    display: "inline-block",
    color: colors.white,
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "4px",
    textTransform: "uppercase" as const,
    marginRight: "8px",
  } as React.CSSProperties,

  categoryBadge: {
    display: "inline-block",
    backgroundColor: colors.cardBg,
    color: colors.textSecondary,
    fontSize: "11px",
    fontWeight: "500",
    padding: "4px 10px",
    borderRadius: "4px",
    textTransform: "capitalize" as const,
  } as React.CSSProperties,

  detailsCard: {
    backgroundColor: colors.cardBg,
    borderRadius: "12px",
    padding: "24px",
    border: `1px solid ${colors.border}`,
    marginBottom: "24px",
  } as React.CSSProperties,

  detailRow: {
    marginBottom: "0",
  } as React.CSSProperties,

  detailLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    margin: "0 0 4px",
  } as React.CSSProperties,

  detailValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: colors.text,
    margin: "0",
  } as React.CSSProperties,

  detailEmail: {
    fontSize: "14px",
    color: colors.primary,
    margin: "4px 0 0",
  } as React.CSSProperties,

  innerDivider: {
    borderColor: colors.border,
    borderWidth: "1px",
    margin: "16px 0",
  } as React.CSSProperties,

  messageText: {
    fontSize: "15px",
    color: colors.text,
    lineHeight: "1.6",
    margin: "0",
    whiteSpace: "pre-wrap" as const,
  } as React.CSSProperties,

  attachmentSection: {
    backgroundColor: colors.attachmentBg,
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
  } as React.CSSProperties,

  attachmentHeader: {
    fontSize: "14px",
    fontWeight: "600",
    color: colors.primary,
    margin: "0 0 12px",
  } as React.CSSProperties,

  attachmentLink: {
    display: "block",
    backgroundColor: colors.white,
    color: colors.primary,
    fontSize: "14px",
    padding: "10px 16px",
    borderRadius: "6px",
    textDecoration: "none",
    marginBottom: "8px",
    border: `1px solid ${colors.border}`,
  } as React.CSSProperties,

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
  } as React.CSSProperties,

  footerText: {
    fontSize: "12px",
    color: colors.textMuted,
    textAlign: "center" as const,
    margin: "0 0 4px",
  } as React.CSSProperties,

  footerAddress: {
    fontSize: "12px",
    color: colors.textMuted,
    textAlign: "center" as const,
    margin: 0,
    lineHeight: "1.5",
  } as React.CSSProperties,
}

export default SupportTicketEmail
