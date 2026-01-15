import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type * as React from 'react';

export interface MagicLinkEmailProps {
  loginCode: string;
  verifyUrl?: string;
  logoUrl?: string;
}

const colors = {
  primary: '#f97316',
  background: '#ffffff',
  text: '#0a0a0b',
  textSecondary: '#737373',
  textMuted: '#a3a3a3',
  border: '#e5e5e5',
  codeBg: '#fafafa',
};

const fonts = {
  primary:
    "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

export const MagicLinkEmail = ({
  loginCode = '000000',
  verifyUrl = 'https://askally.io/auth/verify',
  logoUrl = 'https://askally.io/logo.svg',
}: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head>
        <title>Sign in to Ally</title>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
          `}
        </style>
      </Head>
      <Preview>Your Ally login code: {loginCode}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {logoUrl && (
            <Img
              alt="Ally"
              height="48"
              src={logoUrl}
              style={styles.logo}
              width="48"
            />
          )}

          <Heading style={styles.heading}>Sign in to Ally</Heading>

          <Link href={verifyUrl} target="_blank" style={styles.magicLink}>
            Click here to sign in with this magic link
          </Link>

          <Text style={styles.orText}>
            Or, copy and paste this verification code:
          </Text>

          <Section style={styles.codeContainer}>
            <Text style={styles.code}>{loginCode}</Text>
          </Section>

          <Text style={styles.expiryText}>
            This code will expire in 10 minutes.
          </Text>

          <Text style={styles.disclaimer}>
            If you didn't request this code, you can safely ignore this email.
            Someone may have entered your email address by mistake.
          </Text>

          <Section style={styles.footer}>
            <Img
              alt="Ally"
              height="32"
              src={logoUrl}
              style={styles.footerLogo}
              width="32"
            />
            <Text style={styles.footerText}>
              <Link
                href="https://askally.io"
                target="_blank"
                style={styles.footerLink}
              >
                Ally
              </Link>
              , your intelligent scheduling companion
              <br />
              powered by AI for effortless time management.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    backgroundColor: colors.background,
    fontFamily: fonts.primary,
    margin: 0,
    padding: 0,
  } as React.CSSProperties,

  container: {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '24px',
  } as React.CSSProperties,

  logo: {
    marginTop: '32px',
    marginBottom: '24px',
  } as React.CSSProperties,

  heading: {
    fontSize: '24px',
    fontWeight: '600',
    color: colors.text,
    margin: '0 0 32px',
  } as React.CSSProperties,

  magicLink: {
    color: colors.primary,
    fontSize: '14px',
    textDecoration: 'underline',
    display: 'block',
    marginBottom: '24px',
  } as React.CSSProperties,

  orText: {
    fontSize: '14px',
    color: colors.text,
    margin: '0 0 16px',
  } as React.CSSProperties,

  codeContainer: {
    backgroundColor: colors.codeBg,
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    padding: '16px',
    textAlign: 'center' as const,
    marginBottom: '16px',
  } as React.CSSProperties,

  code: {
    fontSize: '32px',
    fontWeight: '600',
    color: colors.text,
    letterSpacing: '0.25em',
    margin: 0,
  } as React.CSSProperties,

  expiryText: {
    fontSize: '14px',
    color: colors.textSecondary,
    margin: '0 0 24px',
  } as React.CSSProperties,

  disclaimer: {
    fontSize: '14px',
    color: colors.textMuted,
    lineHeight: '1.5',
    margin: '0 0 40px',
  } as React.CSSProperties,

  footer: {
    marginTop: '24px',
  } as React.CSSProperties,

  footerLogo: {
    marginBottom: '12px',
  } as React.CSSProperties,

  footerText: {
    fontSize: '12px',
    color: colors.textMuted,
    lineHeight: '1.6',
    margin: 0,
  } as React.CSSProperties,

  footerLink: {
    color: colors.textMuted,
    textDecoration: 'underline',
  } as React.CSSProperties,
};

export default MagicLinkEmail;
