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
} from "@react-email/components";
import type * as React from "react";

export type ContactFormEmailProps = {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachmentCount?: number;
  logoUrl?: string;
};

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
};

const fonts = {
  primary:
    "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

export const ContactFormEmail = ({
  name,
  email,
  subject,
  message,
  attachmentCount = 0,
  logoUrl = "https://askally.io/logo.svg",
}: ContactFormEmailProps) => (
  <Html>
    <Head>
      <title>New Contact Form Submission</title>
      <style>
        {`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
          `}
      </style>
    </Head>
    <Preview>
      New message from {name}: {subject}
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

          <Text style={styles.heading}>New Contact Form Submission</Text>

          <Text style={styles.subheading}>
            Someone reached out through the website
          </Text>

          <Section style={styles.detailsCard}>
            <Section style={styles.detailRow}>
              <Text style={styles.detailLabel}>From</Text>
              <Text style={styles.detailValue}>{name}</Text>
              <Text style={styles.detailEmail}>{email}</Text>
            </Section>

            <Hr style={styles.innerDivider} />

            <Section style={styles.detailRow}>
              <Text style={styles.detailLabel}>Subject</Text>
              <Text style={styles.detailValue}>{subject}</Text>
            </Section>

            <Hr style={styles.innerDivider} />

            <Section style={styles.detailRow}>
              <Text style={styles.detailLabel}>Message</Text>
              <Text style={styles.messageText}>{message}</Text>
            </Section>
          </Section>

          {attachmentCount > 0 && (
            <Section style={styles.attachmentBadge}>
              <Text style={styles.attachmentText}>
                📎 {attachmentCount} attachment
                {attachmentCount > 1 ? "s" : ""} included
              </Text>
            </Section>
          )}

          <Section style={styles.ctaSection}>
            <Button href={`mailto:${email}`} style={styles.ctaButton}>
              Reply to {name}
            </Button>
          </Section>

          <Hr style={styles.divider} />

          <Text style={styles.footerAddress}>
            Ally - Your AI Calendar Assistant
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

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

  heading: {
    fontSize: "24px",
    fontWeight: "600",
    color: colors.text,
    margin: "0 0 8px",
  } as React.CSSProperties,

  subheading: {
    fontSize: "16px",
    color: colors.textSecondary,
    margin: "0 0 24px",
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

  attachmentBadge: {
    backgroundColor: colors.attachmentBg,
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "24px",
  } as React.CSSProperties,

  attachmentText: {
    fontSize: "14px",
    color: colors.primary,
    margin: "0",
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

  footerAddress: {
    fontSize: "12px",
    color: colors.textMuted,
    textAlign: "center" as const,
    margin: 0,
    lineHeight: "1.5",
  } as React.CSSProperties,
};

export default ContactFormEmail;
