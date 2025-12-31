export const COMMANDS = {
  START: "/start",
  EXIT: "/exit",
} as const;

export const CONFIRM_RESPONSES = ["yes", "y", "confirm"] as const;
export const CANCEL_RESPONSES = ["no", "n", "cancel"] as const;

export type ConfirmResponse = (typeof CONFIRM_RESPONSES)[number];
export type CancelResponse = (typeof CANCEL_RESPONSES)[number];
