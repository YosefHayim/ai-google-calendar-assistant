export function cn(...classNames: (string | undefined | null | boolean)[]) {
  return classNames.filter(Boolean).join(" ");
}
