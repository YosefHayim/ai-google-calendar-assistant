/**
 * WhatsApp Cloud API Types
 * Based on Meta's WhatsApp Cloud API documentation
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 */

// ============================================================================
// Webhook Types
// ============================================================================

export type WhatsAppWebhookPayload = {
  object: "whatsapp_business_account";
  entry: WhatsAppWebhookEntry[];
};

export type WhatsAppWebhookEntry = {
  id: string;
  changes: WhatsAppWebhookChange[];
};

export type WhatsAppWebhookChange = {
  value: WhatsAppWebhookValue;
  field: "messages";
};

export type WhatsAppWebhookValue = {
  messaging_product: "whatsapp";
  metadata: WhatsAppMetadata;
  contacts?: WhatsAppContact[];
  messages?: WhatsAppIncomingMessage[];
  statuses?: WhatsAppMessageStatus[];
  errors?: WhatsAppError[];
};

export type WhatsAppMetadata = {
  display_phone_number: string;
  phone_number_id: string;
};

export type WhatsAppContact = {
  profile: {
    name: string;
  };
  wa_id: string;
};

// ============================================================================
// Incoming Message Types
// ============================================================================

export type WhatsAppIncomingMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: WhatsAppMessageType;
  text?: WhatsAppTextContent;
  image?: WhatsAppMediaContent;
  audio?: WhatsAppMediaContent;
  video?: WhatsAppMediaContent;
  document?: WhatsAppMediaContent;
  sticker?: WhatsAppMediaContent;
  location?: WhatsAppLocationContent;
  contacts?: WhatsAppContactContent[];
  interactive?: WhatsAppInteractiveContent;
  button?: WhatsAppButtonContent;
  context?: WhatsAppMessageContext;
  errors?: WhatsAppError[];
};

export type WhatsAppMessageType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "document"
  | "sticker"
  | "location"
  | "contacts"
  | "interactive"
  | "button"
  | "reaction"
  | "order"
  | "system"
  | "unknown";

export type WhatsAppTextContent = {
  body: string;
};

export type WhatsAppMediaContent = {
  id: string;
  mime_type: string;
  sha256?: string;
  caption?: string;
  filename?: string;
  voice?: boolean;
};

export type WhatsAppLocationContent = {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
};

export type WhatsAppContactContent = {
  name: {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
  };
  phones?: Array<{
    phone: string;
    type?: string;
    wa_id?: string;
  }>;
};

export type WhatsAppInteractiveContent = {
  type: "button_reply" | "list_reply";
  button_reply?: {
    id: string;
    title: string;
  };
  list_reply?: {
    id: string;
    title: string;
    description?: string;
  };
};

export type WhatsAppButtonContent = {
  text: string;
  payload: string;
};

export type WhatsAppMessageContext = {
  from: string;
  id: string;
};

// ============================================================================
// Message Status Types
// ============================================================================

export type WhatsAppMessageStatus = {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    origin: {
      type: "user_initiated" | "business_initiated" | "referral_conversion";
    };
    expiration_timestamp?: string;
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: WhatsAppError[];
};

// ============================================================================
// Outgoing Message Types
// ============================================================================

export type WhatsAppOutgoingMessage = {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type:
    | "text"
    | "image"
    | "audio"
    | "video"
    | "document"
    | "sticker"
    | "location"
    | "contacts"
    | "interactive"
    | "template"
    | "reaction";
  text?: WhatsAppOutgoingText;
  image?: WhatsAppOutgoingMedia;
  audio?: WhatsAppOutgoingMedia;
  video?: WhatsAppOutgoingMedia;
  document?: WhatsAppOutgoingDocument;
  sticker?: WhatsAppOutgoingMedia;
  location?: WhatsAppOutgoingLocation;
  contacts?: WhatsAppOutgoingContact[];
  interactive?: WhatsAppOutgoingInteractive;
  template?: WhatsAppOutgoingTemplate;
  reaction?: WhatsAppOutgoingReaction;
  context?: {
    message_id: string;
  };
};

export type WhatsAppOutgoingText = {
  body: string;
  preview_url?: boolean;
};

export type WhatsAppOutgoingMedia = {
  id?: string;
  link?: string;
  caption?: string;
};

export type WhatsAppOutgoingDocument = WhatsAppOutgoingMedia & {
  filename?: string;
};

export type WhatsAppOutgoingLocation = {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
};

export type WhatsAppOutgoingContact = {
  name: {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
  };
  phones?: Array<{
    phone: string;
    type?: "HOME" | "WORK" | "CELL" | "MAIN" | "IPHONE";
    wa_id?: string;
  }>;
};

export type WhatsAppOutgoingInteractive = {
  type: "button" | "list" | "product" | "product_list";
  header?: {
    type: "text" | "image" | "video" | "document";
    text?: string;
    image?: WhatsAppOutgoingMedia;
    video?: WhatsAppOutgoingMedia;
    document?: WhatsAppOutgoingDocument;
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: WhatsAppInteractiveAction;
};

export type WhatsAppInteractiveAction = {
  buttons?: Array<{
    type: "reply";
    reply: {
      id: string;
      title: string;
    };
  }>;
  button?: string;
  sections?: Array<{
    title?: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
};

export type WhatsAppOutgoingTemplate = {
  name: string;
  language: {
    code: string;
  };
  components?: WhatsAppTemplateComponent[];
};

export type WhatsAppTemplateComponent = {
  type: "header" | "body" | "button";
  parameters?: Array<{
    type: "text" | "currency" | "date_time" | "image" | "document" | "video";
    text?: string;
    currency?: {
      fallback_value: string;
      code: string;
      amount_1000: number;
    };
    date_time?: {
      fallback_value: string;
    };
    image?: WhatsAppOutgoingMedia;
    document?: WhatsAppOutgoingDocument;
    video?: WhatsAppOutgoingMedia;
  }>;
  sub_type?: "quick_reply" | "url";
  index?: number;
};

export type WhatsAppOutgoingReaction = {
  message_id: string;
  emoji: string;
};

// ============================================================================
// API Response Types
// ============================================================================

export type WhatsAppSendMessageResponse = {
  messaging_product: "whatsapp";
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
};

export type WhatsAppMediaUploadResponse = {
  id: string;
};

export type WhatsAppMediaUrlResponse = {
  url: string;
  mime_type: string;
  sha256: string;
  file_size: number;
  id: string;
  messaging_product: "whatsapp";
};

// ============================================================================
// Error Types
// ============================================================================

export type WhatsAppError = {
  code: number;
  title: string;
  message?: string;
  error_data?: {
    details: string;
  };
  href?: string;
};

export type WhatsAppAPIError = {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
};

// ============================================================================
// Session Types
// ============================================================================

export type WhatsAppSession = {
  phoneNumber: string;
  userId?: string;
  isLinked: boolean;
  language: string;
  isProcessing: boolean;
  pendingConfirmation?: {
    eventData: unknown;
    conflictingEvents: unknown[];
  };
  lastActivity: Date;
};

// ============================================================================
// Internal Types
// ============================================================================

export type ProcessedMessage = {
  from: string;
  messageId: string;
  timestamp: Date;
  type: WhatsAppMessageType;
  text?: string;
  mediaId?: string;
  mediaMimeType?: string;
  contactName?: string;
  isVoice?: boolean;
  replyToMessageId?: string;
};

export type SendMessageOptions = {
  replyToMessageId?: string;
  previewUrl?: boolean;
};

export type SendMediaOptions = SendMessageOptions & {
  caption?: string;
  filename?: string;
};
