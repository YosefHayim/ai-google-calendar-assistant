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

export type WelcomeEmailProps = {
  userName: string;
  dashboardUrl?: string;
  docsUrl?: string;
  supportUrl?: string;
  logoUrl?: string;
};

// Mapped from your Tailwind HSL variables
const colors = {
  background: "#09090b", // --background (dark)
  foreground: "#fafafa", // --foreground
  primary: "#f26306", // --primary (the orange)
  border: "#27272a", // --border
  muted: "#a1a1aa", // --muted-foreground
  card: "#09090b", // --card
};

export const WelcomeEmail = ({
  userName = "user",
  dashboardUrl = "https://askally.io/dashboard",
  docsUrl = "https://askally.io/docs",
  supportUrl = "https://askally.io/support",
  logoUrl = "data:image/png;base64,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",
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap');
            body { font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          `}
        </style>
      </Head>
      <Preview>Ally is standing by. Your deep work era starts now.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Main Card */}
          <Section style={styles.card}>
            {/* Header / Logo */}
            <Section
              style={{ textAlign: "center" as const, marginBottom: "32px" }}
            >
              <Img
                alt="Ally"
                height="48"
                src={logoUrl}
                style={styles.logo}
                width="48"
              />
            </Section>

            {/* Headline - dir="auto" handles LTR/RTL mix */}
            <Text dir="auto" style={styles.heading}>
              Your calendar, mastered. Welcome, {userName}.
            </Text>

            <Text style={styles.paragraph}>
              Ally is now active. As your private AI secretary, I am here to
              <strong> defend your deep work</strong> and automate the logistics
              of your day.
            </Text>

            {/* Feature Blocks (Simulating your UI's clean grid) */}
            <Section style={styles.infoBox}>
              <Text style={styles.infoTitle}>COMMAND</Text>
              <Text style={styles.infoText}>
                "Ally, find 2 hours for deep work tomorrow morning."
              </Text>

              <Hr style={styles.innerDivider} />

              <Text style={styles.infoTitle}>STRATEGY</Text>
              <Text style={styles.infoText}>
                Your "No-Meeting" zones are now being monitored and protected.
              </Text>
            </Section>

            {/* CTA */}
            <Section
              style={{ textAlign: "center" as const, margin: "42px 0 20px" }}
            >
              <Button href={dashboardUrl} style={styles.button}>
                Enter Dashboard
              </Button>
            </Section>

            <Hr style={styles.divider} />

            {/* Footer Links */}
            <Section style={{ textAlign: "center" as const }}>
              <Text style={styles.footerLinks}>
                <Link href={docsUrl} style={styles.link}>
                  Documentation
                </Link>
                <span style={{ margin: "0 10px", color: colors.border }}>
                  |
                </span>
                <Link href={supportUrl} style={styles.link}>
                  Support
                </Link>
              </Text>
            </Section>

            <Text style={styles.signature}>
              Ally
              <br />
              <span
                style={{
                  fontSize: "12px",
                  color: colors.muted,
                  fontWeight: "normal",
                }}
              >
                Executive AI Secretary
              </span>
            </Text>
          </Section>

          {/* Legal Footer */}
          <Text style={styles.footerLegal}>
            San Francisco, CA 94102 • askally.io
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    backgroundColor: colors.background,
    margin: "0 auto",
    padding: "20px 0",
  },
  container: {
    margin: "0 auto",
    padding: "20px",
    maxWidth: "560px",
  },
  card: {
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    padding: "40px",
  },
  logo: {
    margin: "0 auto",
  },
  heading: {
    color: colors.foreground,
    fontSize: "26px",
    fontWeight: "700",
    textAlign: "center" as const,
    letterSpacing: "-0.02em",
    margin: "0 0 20px",
  },
  paragraph: {
    color: colors.muted,
    fontSize: "16px",
    lineHeight: "1.6",
    textAlign: "center" as const,
    margin: "0 0 32px",
  },
  infoBox: {
    backgroundColor: "rgba(39, 39, 42, 0.5)", // Based on your border color
    borderRadius: "8px",
    padding: "24px",
    border: `1px solid ${colors.border}`,
  },
  infoTitle: {
    color: colors.primary,
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    margin: "0 0 4px",
  },
  infoText: {
    color: colors.foreground,
    fontSize: "15px",
    margin: "0 0 12px",
  },
  innerDivider: {
    borderColor: colors.border,
    margin: "12px 0",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: "6px",
    color: colors.foreground,
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "14px 28px",
  },
  divider: {
    borderColor: colors.border,
    margin: "32px 0",
  },
  footerLinks: {
    fontSize: "14px",
    margin: "0 0 20px",
  },
  link: {
    color: colors.foreground,
    textDecoration: "underline",
  },
  signature: {
    color: colors.foreground,
    fontSize: "16px",
    fontWeight: "700",
    textAlign: "center" as const,
    marginTop: "20px",
  },
  footerLegal: {
    color: "#52525b",
    fontSize: "12px",
    textAlign: "center" as const,
    marginTop: "24px",
  },
};

export default WelcomeEmail;
