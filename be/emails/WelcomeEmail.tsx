import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type * as React from "react";

// ============================================
// Types
// ============================================

export type WelcomeEmailProps = {
  userName: string;
  dashboardUrl?: string;
  docsUrl?: string;
  supportUrl?: string;
  logoUrl?: string;
};

// ============================================
// Brand Colors & Styles
// ============================================

const colors = {
  primary: "#f97316",
  primaryHover: "#e1430d",
  primaryDark: "#c83a0b",
  background: "#f6f9fc",
  white: "#ffffff",
  text: "#0a0a0b",
  textSecondary: "#737373",
  textMuted: "#a3a3a3",
  border: "#e5e5e5",
};

const fonts = {
  primary:
    "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

// ============================================
// Main Component
// ============================================

export const WelcomeEmail = ({
  userName = "there",
  dashboardUrl = "https://askally.io/dashboard",
  docsUrl = "https://askally.io/docs",
  supportUrl = "https://askally.io/support",
  logoUrl = "https://askally.io/logo.svg",
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head>
        <title>Welcome to Ally</title>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
          `}
        </style>
      </Head>
      <Preview>
        Welcome to Ally - Your smart AI calendar assistant is ready!
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.card}>
            {/* Header */}
            <Section style={styles.header}>
              {logoUrl && (
                <Img
                  alt="Ally"
                  height="48"
                  src={logoUrl}
                  style={styles.logo}
                  width="48"
                />
              )}
            </Section>

            <Hr style={styles.divider} />

            {/* Welcome Message */}
            <Text style={styles.heading}>Welcome to Ally, {userName}!</Text>

            <Text style={styles.paragraph}>
              We're thrilled to have you on board. Ally is your intelligent
              scheduling companion that helps you manage your time effortlessly
              using natural language.
            </Text>

            <Text style={styles.paragraph}>
              Here's what you can do with your new AI-powered calendar:
            </Text>

            {/* Features List */}
            <Section style={styles.featureList}>
              <Text style={styles.feature}>
                <strong>Talk naturally</strong> - Just say "Schedule a meeting
                with John tomorrow at 3pm"
              </Text>
              <Text style={styles.feature}>
                <strong>Smart insights</strong> - Get analytics on how you spend
                your time
              </Text>
              <Text style={styles.feature}>
                <strong>Voice control</strong> - Manage your calendar hands-free
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={dashboardUrl} style={styles.ctaButton}>
                Go to Dashboard
              </Button>
            </Section>

            <Hr style={styles.divider} />

            {/* Help Links */}
            <Text style={styles.helpText}>
              Need help getting started? Check out our{" "}
              <Link href={docsUrl} style={styles.link}>
                documentation
              </Link>{" "}
              or reach out to our{" "}
              <Link href={supportUrl} style={styles.link}>
                support team
              </Link>
              .
            </Text>

            <Text style={styles.signature}>— The Ally Team</Text>

            {/* Footer */}
            <Hr style={styles.footerDivider} />
            <Text style={styles.footer}>
              Ally - Your AI Calendar Assistant
              <br />
              San Francisco, CA 94102
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

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
    padding: "40px 48px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  } as React.CSSProperties,

  header: {
    textAlign: "center" as const,
    marginBottom: "8px",
  } as React.CSSProperties,

  logo: {
    margin: "0 auto",
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
    margin: "0 0 16px",
    lineHeight: "1.3",
  } as React.CSSProperties,

  paragraph: {
    fontSize: "16px",
    color: colors.textSecondary,
    lineHeight: "1.6",
    margin: "0 0 16px",
  } as React.CSSProperties,

  featureList: {
    margin: "24px 0",
    paddingLeft: "16px",
  } as React.CSSProperties,

  feature: {
    fontSize: "16px",
    color: colors.text,
    lineHeight: "1.6",
    margin: "0 0 12px",
  } as React.CSSProperties,

  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0",
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

  helpText: {
    fontSize: "16px",
    color: colors.textSecondary,
    lineHeight: "1.6",
    margin: "0 0 16px",
  } as React.CSSProperties,

  link: {
    color: colors.primary,
    textDecoration: "none",
  } as React.CSSProperties,

  signature: {
    fontSize: "16px",
    color: colors.textSecondary,
    margin: "24px 0 0",
  } as React.CSSProperties,

  footerDivider: {
    borderColor: colors.border,
    borderWidth: "1px",
    margin: "24px 0 16px",
  } as React.CSSProperties,

  footer: {
    fontSize: "12px",
    color: colors.textMuted,
    textAlign: "center" as const,
    margin: 0,
    lineHeight: "1.5",
  } as React.CSSProperties,
};

// ============================================
// Default Export
// ============================================

export default WelcomeEmail;
