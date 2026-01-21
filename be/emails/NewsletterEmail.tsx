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

export type NewsletterFeature = {
  id: number
  title: string
  description: string
}

export type NewsletterEmailProps = {
  features?: NewsletterFeature[]
  tipOfTheMonth?: string
  dashboardUrl?: string
  unsubscribeUrl?: string
  settingsUrl?: string
  supportUrl?: string
  privacyUrl?: string
  logoUrl?: string
}

const colors = {
  primary: "#f97316",
  primaryDark: "#e1430d",
  background: "#f6f9fc",
  white: "#ffffff",
  text: "#0a0a0b",
  textSecondary: "#737373",
  textMuted: "#a3a3a3",
  border: "#e5e5e5",
}

const fonts = {
  primary:
    "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
}

const defaultFeatures: NewsletterFeature[] = [
  {
    id: 1,
    title: "Voice Commands",
    description:
      'Now you can manage your calendar entirely hands-free. Just say "Hey Ally, schedule a meeting..."',
  },
  {
    id: 2,
    title: "Smart Scheduling",
    description:
      "Our AI now analyzes your productivity patterns to suggest optimal meeting times.",
  },
  {
    id: 3,
    title: "Analytics Dashboard",
    description:
      "Get insights into how you spend your time with beautiful, interactive charts.",
  },
]

export const NewsletterEmail = ({
  features = defaultFeatures,
  tipOfTheMonth = 'Did you know you can use natural language like "Move my 3pm meeting to tomorrow"? Our AI understands context and can reschedule events intelligently!',
  dashboardUrl = "https://askally.io/dashboard",
  unsubscribeUrl = "https://askally.io/unsubscribe",
  settingsUrl = "https://askally.io/settings/notifications",
  supportUrl = "https://askally.io/support",
  privacyUrl = "https://askally.io/privacy",
  logoUrl = "https://askally.io/logo.svg",
}: NewsletterEmailProps) => (
  <Html>
    <Head>
      <title>What's New at Ally</title>
      <style>
        {`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
          `}
      </style>
    </Head>
    <Preview>What's new in Ally - Your monthly product update</Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        <Section style={styles.headerSection}>
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

        <Section style={styles.heroSection}>
          <Row>
            <Column style={styles.heroTextColumn}>
              <Heading style={styles.heroTitle}>Your Monthly Update</Heading>
              <Text style={styles.heroSubtitle}>
                New features to supercharge your productivity
              </Text>
            </Column>
          </Row>
        </Section>

        <Section style={styles.contentSection}>
          <Heading as="h2" style={styles.sectionTitle}>
            What's New This Month
          </Heading>
          <Text style={styles.sectionIntro}>
            We've been working hard to make your scheduling experience even
            better. Here's what we've shipped:
          </Text>

          <Hr style={styles.divider} />

          {features.map((feature) => (
            <Section key={feature.id} style={styles.featureSection}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </Section>
          ))}

          <Hr style={styles.divider} />

          <Heading as="h2" style={styles.sectionTitle}>
            Pro Tip of the Month
          </Heading>
          <Text style={styles.tipText}>{tipOfTheMonth}</Text>

          <Section style={styles.ctaSection}>
            <Link href={dashboardUrl} style={styles.ctaButton}>
              Try it now
            </Link>
          </Section>
        </Section>
      </Container>

      <Section style={styles.footerSection}>
        <Text style={styles.footerNotice}>
          You're receiving this because you subscribed to Ally updates.
        </Text>

        <Section style={styles.footerLinks}>
          <Link href={unsubscribeUrl} style={styles.footerLink}>
            Unsubscribe
          </Link>
          <Text style={styles.footerSeparator}> | </Text>
          <Link href={settingsUrl} style={styles.footerLink}>
            Email preferences
          </Link>
          <Text style={styles.footerSeparator}> | </Text>
          <Link href={supportUrl} style={styles.footerLink}>
            Contact us
          </Link>
          <Text style={styles.footerSeparator}> | </Text>
          <Link href={privacyUrl} style={styles.footerLink}>
            Privacy
          </Link>
        </Section>

        <Hr style={styles.footerDivider} />

        {logoUrl && (
          <Img
            alt="Ally"
            height="32"
            src={logoUrl}
            style={styles.footerLogo}
            width="32"
          />
        )}
        <Text style={styles.footerAddress}>
          <strong>Ally</strong> - Your AI Calendar Assistant
          <br />
          San Francisco, CA 94102
        </Text>
      </Section>
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
    maxWidth: "680px",
    margin: "0 auto",
    backgroundColor: colors.white,
  } as React.CSSProperties,

  headerSection: {
    backgroundColor: colors.background,
    padding: "20px 30px",
  } as React.CSSProperties,

  logo: {
    display: "block",
  } as React.CSSProperties,

  heroSection: {
    backgroundColor: colors.primary,
    borderRadius: "8px 8px 0 0",
    padding: "30px",
  } as React.CSSProperties,

  heroTextColumn: {
    padding: "0 15px",
  } as React.CSSProperties,

  heroTitle: {
    color: colors.white,
    fontSize: "27px",
    fontWeight: "700",
    lineHeight: "1.2",
    margin: "0 0 8px",
  } as React.CSSProperties,

  heroSubtitle: {
    color: colors.white,
    fontSize: "17px",
    lineHeight: "1.4",
    margin: 0,
    opacity: 0.9,
  } as React.CSSProperties,

  contentSection: {
    padding: "30px 30px 40px",
  } as React.CSSProperties,

  sectionTitle: {
    color: colors.text,
    fontSize: "21px",
    fontWeight: "700",
    lineHeight: "1.2",
    margin: "0 0 15px",
  } as React.CSSProperties,

  sectionIntro: {
    color: colors.textSecondary,
    fontSize: "15px",
    lineHeight: "1.5",
    margin: 0,
  } as React.CSSProperties,

  divider: {
    borderColor: colors.border,
    margin: "30px 0",
  } as React.CSSProperties,

  featureSection: {
    marginBottom: "24px",
  } as React.CSSProperties,

  featureTitle: {
    color: colors.text,
    fontSize: "18px",
    fontWeight: "600",
    lineHeight: "1.2",
    margin: "0 0 8px",
  } as React.CSSProperties,

  featureDescription: {
    color: colors.textSecondary,
    fontSize: "15px",
    lineHeight: "1.5",
    margin: 0,
  } as React.CSSProperties,

  tipText: {
    color: colors.textSecondary,
    fontSize: "15px",
    lineHeight: "1.5",
    margin: 0,
  } as React.CSSProperties,

  ctaSection: {
    marginTop: "24px",
  } as React.CSSProperties,

  ctaButton: {
    backgroundColor: colors.primary,
    border: `1px solid ${colors.primaryDark}`,
    borderRadius: "8px",
    color: colors.white,
    display: "inline-block",
    fontSize: "17px",
    fontWeight: "600",
    lineHeight: "1",
    padding: "13px 17px",
    textDecoration: "none",
  } as React.CSSProperties,

  footerSection: {
    maxWidth: "680px",
    margin: "32px auto 0",
    padding: "0 30px",
  } as React.CSSProperties,

  footerNotice: {
    color: colors.textMuted,
    fontSize: "12px",
    lineHeight: "1.4",
    margin: 0,
  } as React.CSSProperties,

  footerLinks: {
    marginTop: "8px",
  } as React.CSSProperties,

  footerLink: {
    color: colors.textMuted,
    fontSize: "12px",
    textDecoration: "underline",
  } as React.CSSProperties,

  footerSeparator: {
    color: colors.textMuted,
    fontSize: "12px",
    display: "inline",
    margin: 0,
  } as React.CSSProperties,

  footerDivider: {
    borderColor: colors.border,
    margin: "30px 0",
  } as React.CSSProperties,

  footerLogo: {
    marginBottom: "8px",
  } as React.CSSProperties,

  footerAddress: {
    color: colors.textMuted,
    fontSize: "12px",
    lineHeight: "1.4",
    margin: "0 0 32px",
  } as React.CSSProperties,
}

export default NewsletterEmail
