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

export type NotificationEmailProps = {
  userName: string;
  eventTitle: string;
  eventTime: string;
  eventDate: string;
  notificationType?: "reminder" | "update" | "cancelled";
  dashboardUrl?: string;
  settingsUrl?: string;
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
};

const fonts = {
  primary:
    "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

export const NotificationEmail = ({
  userName = "there",
  eventTitle = "Untitled Event",
  eventTime = "10:00 AM",
  eventDate = "Today",
  notificationType = "reminder",
  dashboardUrl = "https://askally.io/dashboard",
  settingsUrl = "https://askally.io/settings/notifications",
  logoUrl = "https://askally.io/logo.svg",
}: NotificationEmailProps) => {
  const getNotificationMessage = () => {
    switch (notificationType) {
      case "reminder":
        return `You have an upcoming event: "${eventTitle}" scheduled for ${eventDate} at ${eventTime}.`;
      case "update":
        return `Your event "${eventTitle}" has been updated. It's now scheduled for ${eventDate} at ${eventTime}.`;
      case "cancelled":
        return `Your event "${eventTitle}" originally scheduled for ${eventDate} at ${eventTime} has been cancelled.`;
      default:
        return "";
    }
  };

  const getTitle = () => {
    switch (notificationType) {
      case "reminder":
        return "Event Reminder";
      case "update":
        return "Event Updated";
      case "cancelled":
        return "Event Cancelled";
      default:
        return "Calendar Notification";
    }
  };

  const _getEmoji = () => {
    switch (notificationType) {
      case "reminder":
        return "calendar";
      case "update":
        return "arrows_counterclockwise";
      case "cancelled":
        return "x";
      default:
        return "bell";
    }
  };

  return (
    <Html>
      <Head>
        <title>
          {getTitle()} - {eventTitle}
        </title>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
          `}
        </style>
      </Head>
      <Preview>
        {getTitle()}: {eventTitle}
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

            <Text style={styles.heading}>{getTitle()}</Text>

            <Text style={styles.greeting}>Hi {userName},</Text>

            <Text style={styles.message}>{getNotificationMessage()}</Text>

            <Section style={styles.eventCard}>
              <Text style={styles.eventTitle}>{eventTitle}</Text>
              <Text style={styles.eventDetail}>{eventDate}</Text>
              <Text style={styles.eventDetail}>{eventTime}</Text>
            </Section>

            {notificationType !== "cancelled" && (
              <Section style={styles.ctaSection}>
                <Button href={dashboardUrl} style={styles.ctaButton}>
                  View Event Details
                </Button>
              </Section>
            )}

            <Hr style={styles.divider} />

            <Text style={styles.footer}>
              You're receiving this notification because you have event
              reminders enabled. Manage your{" "}
              <Link href={settingsUrl} style={styles.link}>
                notification preferences
              </Link>
              .
            </Text>

            <Text style={styles.footerAddress}>
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
    margin: "0 0 16px",
  } as React.CSSProperties,

  greeting: {
    fontSize: "16px",
    color: colors.textSecondary,
    margin: "0 0 8px",
  } as React.CSSProperties,

  message: {
    fontSize: "16px",
    color: colors.textSecondary,
    lineHeight: "1.6",
    margin: "0 0 24px",
  } as React.CSSProperties,

  eventCard: {
    backgroundColor: colors.cardBg,
    borderRadius: "12px",
    padding: "20px 24px",
    border: `1px solid ${colors.border}`,
    marginBottom: "24px",
  } as React.CSSProperties,

  eventTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: colors.text,
    margin: "0 0 8px",
  } as React.CSSProperties,

  eventDetail: {
    fontSize: "14px",
    color: colors.textSecondary,
    margin: "0 0 4px",
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

  footer: {
    fontSize: "14px",
    color: colors.textSecondary,
    lineHeight: "1.6",
    margin: "0 0 16px",
  } as React.CSSProperties,

  link: {
    color: colors.primary,
    textDecoration: "none",
  } as React.CSSProperties,

  footerAddress: {
    fontSize: "12px",
    color: colors.textMuted,
    margin: 0,
    lineHeight: "1.5",
  } as React.CSSProperties,
};

export default NotificationEmail;
