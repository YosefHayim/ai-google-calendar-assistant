import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type * as React from "react";

export type ResetPasswordEmailProps = {
  userName: string;
  resetPasswordLink: string;
  securityUrl?: string;
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
};

const fonts = {
  primary:
    "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

export const ResetPasswordEmail = ({
  userName = "there",
  resetPasswordLink = "https://askally.io/reset-password?token=xxx",
  securityUrl = "https://askally.io/security",
  logoUrl = "https://askally.io/logo.svg",
}: ResetPasswordEmailProps) => (
  <Html>
    <Head>
      <title>Reset your Ally password</title>
      <style>
        {`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
          `}
      </style>
    </Head>
    <Preview>Reset your Ally password</Preview>
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

          <Text style={styles.greeting}>Hi {userName},</Text>

          <Text style={styles.message}>
            We received a request to reset the password for your Ally account.
            Click the button below to set a new password:
          </Text>

          <Section style={styles.ctaSection}>
            <Button href={resetPasswordLink} style={styles.ctaButton}>
              Reset Password
            </Button>
          </Section>

          <Text style={styles.expiry}>
            This link will expire in 1 hour for security reasons.
          </Text>

          <Text style={styles.disclaimer}>
            If you didn't request this password reset, you can safely ignore
            this email. Your password will remain unchanged.
          </Text>

          <Text style={styles.security}>
            For security tips, visit our{" "}
            <Link href={securityUrl} style={styles.link}>
              security center
            </Link>
            .
          </Text>

          <Text style={styles.signature}>
            Stay organized,
            <br />
            The Ally Team
          </Text>
        </Section>

        <Text style={styles.footer}>
          Ally - Your AI Calendar Assistant
          <br />
          San Francisco, CA 94102
        </Text>
      </Container>
    </Body>
  </Html>
);

const styles = {
  body: {
    backgroundColor: colors.background,
    fontFamily: fonts.primary,
    margin: 0,
    padding: "24px 0",
  } as React.CSSProperties,

  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "0 16px",
  } as React.CSSProperties,

  card: {
    backgroundColor: colors.white,
    borderRadius: "16px",
    border: `1px solid ${colors.border}`,
    padding: "40px 48px",
  } as React.CSSProperties,

  logo: {
    marginBottom: "24px",
  } as React.CSSProperties,

  greeting: {
    fontSize: "16px",
    color: colors.text,
    lineHeight: "1.6",
    margin: "0 0 16px",
  } as React.CSSProperties,

  message: {
    fontSize: "16px",
    color: colors.textSecondary,
    lineHeight: "1.6",
    margin: "0 0 24px",
  } as React.CSSProperties,

  ctaSection: {
    marginBottom: "24px",
  } as React.CSSProperties,

  ctaButton: {
    display: "inline-block",
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: "15px",
    fontWeight: "600",
    padding: "14px 28px",
    borderRadius: "8px",
    textDecoration: "none",
  } as React.CSSProperties,

  expiry: {
    fontSize: "16px",
    color: colors.textSecondary,
    lineHeight: "1.6",
    margin: "0 0 16px",
  } as React.CSSProperties,

  disclaimer: {
    fontSize: "16px",
    color: colors.textSecondary,
    lineHeight: "1.6",
    margin: "0 0 16px",
  } as React.CSSProperties,

  security: {
    fontSize: "16px",
    color: colors.textSecondary,
    lineHeight: "1.6",
    margin: "0 0 24px",
  } as React.CSSProperties,

  link: {
    color: colors.primary,
    textDecoration: "underline",
  } as React.CSSProperties,

  signature: {
    fontSize: "16px",
    color: colors.textSecondary,
    lineHeight: "1.6",
    margin: 0,
  } as React.CSSProperties,

  footer: {
    fontSize: "12px",
    color: colors.textMuted,
    textAlign: "center" as const,
    marginTop: "24px",
    lineHeight: "1.5",
  } as React.CSSProperties,
};

export default ResetPasswordEmail;
