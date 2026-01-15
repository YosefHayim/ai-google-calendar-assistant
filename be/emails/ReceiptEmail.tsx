import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import type * as React from 'react';

export interface ReceiptEmailProps {
  userName: string;
  invoiceNumber: string;
  invoiceDate: string;
  planName: string;
  planPrice: string;
  billingPeriod: string;
  paymentMethod: string;
  billingUrl?: string;
  supportUrl?: string;
  logoUrl?: string;
}

const colors = {
  primary: '#f97316',
  background: '#f6f9fc',
  white: '#ffffff',
  text: '#0a0a0b',
  textSecondary: '#737373',
  textMuted: '#a3a3a3',
  border: '#e5e5e5',
  cardBg: '#fafafa',
};

const fonts = {
  primary:
    "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

export const ReceiptEmail = ({
  userName = 'there',
  invoiceNumber = 'INV-2025-001234',
  invoiceDate = 'January 16, 2025',
  planName = 'Pro Plan',
  planPrice = '$12.00',
  billingPeriod = 'Jan 16, 2025 - Feb 16, 2025',
  paymentMethod = 'Visa ending in 4242',
  billingUrl = 'https://askally.io/dashboard/billing',
  supportUrl = 'https://askally.io/support',
  logoUrl = 'https://askally.io/logo.svg',
}: ReceiptEmailProps) => {
  return (
    <Html>
      <Head>
        <title>Payment Receipt - Ally</title>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
          `}
        </style>
      </Head>
      <Preview>Your Ally receipt - Invoice #{invoiceNumber}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.card}>
            <Row>
              <Column>
                {logoUrl && (
                  <Img
                    alt="Ally"
                    height="48"
                    src={logoUrl}
                    style={styles.logo}
                    width="48"
                  />
                )}
              </Column>
              <Column style={styles.invoiceInfoColumn}>
                <Text style={styles.invoiceNumber}>
                  Invoice #{invoiceNumber}
                </Text>
                <Text style={styles.invoiceDate}>{invoiceDate}</Text>
              </Column>
            </Row>

            <Hr style={styles.divider} />

            <Text style={styles.heading}>Payment Receipt</Text>
            <Text style={styles.thankYou}>
              Thank you for your purchase, {userName}!
            </Text>

            <Section style={styles.planCard}>
              <Row>
                <Column>
                  <Text style={styles.planLabel}>Plan</Text>
                  <Text style={styles.planName}>{planName}</Text>
                </Column>
                <Column style={styles.amountColumn}>
                  <Text style={styles.planLabel}>Amount</Text>
                  <Text style={styles.planPrice}>{planPrice}</Text>
                </Column>
              </Row>
            </Section>

            <Section style={styles.detailsSection}>
              <Row style={styles.detailRow}>
                <Column>
                  <Text style={styles.detailLabel}>Billing Period</Text>
                </Column>
                <Column style={styles.detailValueColumn}>
                  <Text style={styles.detailValue}>{billingPeriod}</Text>
                </Column>
              </Row>
              <Row style={styles.detailRow}>
                <Column>
                  <Text style={styles.detailLabel}>Payment Method</Text>
                </Column>
                <Column style={styles.detailValueColumn}>
                  <Text style={styles.detailValue}>{paymentMethod}</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={styles.divider} />

            <Row>
              <Column>
                <Text style={styles.totalLabel}>Total Paid</Text>
              </Column>
              <Column style={styles.totalValueColumn}>
                <Text style={styles.totalValue}>{planPrice}</Text>
              </Column>
            </Row>

            <Hr style={styles.divider} />

            <Text style={styles.subscriptionNote}>
              Your subscription is now active. You have full access to all{' '}
              {planName} features.
            </Text>

            <Text style={styles.billingNote}>
              Manage your subscription anytime in your{' '}
              <Link href={billingUrl} style={styles.link}>
                billing settings
              </Link>
              .
            </Text>

            <Section style={styles.supportSection}>
              <Text style={styles.supportText}>
                Questions about your bill?{' '}
                <Link href={supportUrl} style={styles.link}>
                  Contact support
                </Link>
              </Text>
            </Section>

            <Hr style={styles.divider} />

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

const styles = {
  body: {
    backgroundColor: colors.background,
    fontFamily: fonts.primary,
    margin: 0,
    padding: 0,
  } as React.CSSProperties,

  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px 16px',
  } as React.CSSProperties,

  card: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    padding: '32px 48px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  } as React.CSSProperties,

  logo: {
    display: 'block',
  } as React.CSSProperties,

  invoiceInfoColumn: {
    textAlign: 'right' as const,
  } as React.CSSProperties,

  invoiceNumber: {
    color: colors.textMuted,
    fontSize: '12px',
    margin: 0,
  } as React.CSSProperties,

  invoiceDate: {
    color: colors.textMuted,
    fontSize: '12px',
    margin: 0,
  } as React.CSSProperties,

  divider: {
    borderColor: colors.border,
    margin: '24px 0',
  } as React.CSSProperties,

  heading: {
    color: colors.text,
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 8px',
  } as React.CSSProperties,

  thankYou: {
    color: colors.textSecondary,
    fontSize: '16px',
    margin: '0 0 24px',
  } as React.CSSProperties,

  planCard: {
    backgroundColor: colors.cardBg,
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    padding: '20px 24px',
    marginBottom: '24px',
  } as React.CSSProperties,

  planLabel: {
    color: colors.textSecondary,
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '0 0 4px',
  } as React.CSSProperties,

  planName: {
    color: colors.text,
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
  } as React.CSSProperties,

  amountColumn: {
    textAlign: 'right' as const,
  } as React.CSSProperties,

  planPrice: {
    color: colors.text,
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
  } as React.CSSProperties,

  detailsSection: {
    marginBottom: '24px',
  } as React.CSSProperties,

  detailRow: {
    marginBottom: '12px',
  } as React.CSSProperties,

  detailLabel: {
    color: colors.textSecondary,
    fontSize: '14px',
    margin: 0,
  } as React.CSSProperties,

  detailValueColumn: {
    textAlign: 'right' as const,
  } as React.CSSProperties,

  detailValue: {
    color: colors.text,
    fontSize: '14px',
    margin: 0,
  } as React.CSSProperties,

  totalLabel: {
    color: colors.text,
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
  } as React.CSSProperties,

  totalValueColumn: {
    textAlign: 'right' as const,
  } as React.CSSProperties,

  totalValue: {
    color: colors.primary,
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
  } as React.CSSProperties,

  subscriptionNote: {
    color: colors.textSecondary,
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0 0 8px',
  } as React.CSSProperties,

  billingNote: {
    color: colors.textSecondary,
    fontSize: '14px',
    lineHeight: '1.5',
    margin: 0,
  } as React.CSSProperties,

  link: {
    color: colors.primary,
    textDecoration: 'none',
  } as React.CSSProperties,

  supportSection: {
    marginTop: '32px',
  } as React.CSSProperties,

  supportText: {
    color: colors.textMuted,
    fontSize: '12px',
    margin: 0,
  } as React.CSSProperties,

  footer: {
    color: colors.textMuted,
    fontSize: '11px',
    lineHeight: '1.5',
    margin: 0,
  } as React.CSSProperties,
};

export default ReceiptEmail;
