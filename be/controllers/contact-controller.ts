import type { Request, Response } from "express";
import { Resend } from "resend";
import { isEmail } from "validator";
import { env, STATUS_RESPONSE } from "@/config";
import { reqResAsyncHandler, sendR } from "@/utils/http";
import { logger } from "@/utils/logger";

const resend = new Resend(env.resend.apiKey);

type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

type ContactFormRequest = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type ResendInboundEmailPayload = {
  type: "email.received";
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename: string;
      content_type: string;
      content: string;
    }>;
    headers: Record<string, string>;
  };
};

type EmailTemplateData = {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachmentCount: number;
};

const buildEmailHtml = (data: EmailTemplateData) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">New Contact Form Submission</h2>
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>From:</strong> ${data.name} (${data.email})</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
      <p><strong>Message:</strong></p>
      <div style="white-space: pre-wrap; color: #555;">${data.message}</div>
    </div>
    ${data.attachmentCount > 0 ? `<p style="color: #888; font-size: 12px;">Attachments: ${data.attachmentCount} file(s) included</p>` : ""}
  </div>
`;

const validateContactForm = (formData: ContactFormRequest): string | null => {
  const { name, email, subject, message } = formData;
  const hasAllFields = name && email && subject && message;
  if (!hasAllFields) {
    return "All fields (name, email, subject, message) are required.";
  }
  if (!isEmail(email)) {
    return "Invalid email format.";
  }
  return null;
};

const submitContactForm = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const formData = req.body as ContactFormRequest;
    const { name, email, subject, message } = formData;
    const files = (req as Request & { files?: MulterFile[] }).files;

    const validationError = validateContactForm(formData);
    if (validationError) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, validationError);
    }

    try {
      const attachments =
        files?.map((file) => ({
          filename: file.originalname,
          content: file.buffer,
        })) ?? [];

      const { data, error } = await resend.emails.send({
        from: env.resend.fromEmail,
        to: env.resend.supportEmail,
        replyTo: email,
        subject: `[Contact Form] ${subject}`,
        html: buildEmailHtml({
          name,
          email,
          subject,
          message,
          attachmentCount: attachments.length,
        }),
        text: `New Contact Form Submission\n\nFrom: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}`,
        attachments,
      });

      if (error) {
        logger.error("Resend email error:", error);
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Failed to send email. Please try again later.",
          error
        );
      }

      logger.info(`Contact form submitted successfully from ${email}`);
      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Thanks! We've received your message and will get back to you soon.",
        {
          emailId: data?.id,
        }
      );
    } catch (error) {
      logger.error("Contact form submission error:", error);
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred. Please try again later."
      );
    }
  }
);

const verifyWebhookSignature = (req: Request): boolean => {
  const svixId = req.headers["svix-id"] as string;
  const svixTimestamp = req.headers["svix-timestamp"] as string;
  const svixSignature = req.headers["svix-signature"] as string;

  const hasWebhookSecret = Boolean(env.resend.webhookSecret);
  const hasAllHeaders =
    Boolean(svixId) && Boolean(svixTimestamp) && Boolean(svixSignature);
  if (!hasWebhookSecret) {
    return true;
  }
  if (!hasAllHeaders) {
    return true;
  }

  try {
    const rawBody = JSON.stringify(req.body);
    resend.webhooks.verify({
      payload: rawBody,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      webhookSecret: env.resend.webhookSecret ?? "",
    });
    return true;
  } catch {
    return false;
  }
};

const handleInboundEmail = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    await Promise.resolve();

    if (!verifyWebhookSignature(req)) {
      logger.warn("Invalid Resend webhook signature");
      return sendR(
        res,
        STATUS_RESPONSE.UNAUTHORIZED,
        "Invalid webhook signature"
      );
    }

    const payload = req.body as ResendInboundEmailPayload;

    if (payload.type !== "email.received") {
      return sendR(res, STATUS_RESPONSE.SUCCESS, "Event type not handled");
    }

    const { data } = payload;
    const attachments = data.attachments ?? [];

    logger.info(
      `Inbound email received: ${data.email_id} from ${data.from}, subject: "${data.subject}", attachments: ${attachments.length}`
    );

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Inbound email processed successfully",
      {
        emailId: data.email_id,
        from: data.from,
        subject: data.subject,
        attachmentCount: attachments.length,
      }
    );
  }
);

export const contactController = {
  submitContactForm,
  handleInboundEmail,
};
