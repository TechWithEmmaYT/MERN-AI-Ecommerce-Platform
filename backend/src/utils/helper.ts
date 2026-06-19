import crypto from "crypto"

export function generateGuestCartId() {
  return `guest_${crypto.randomUUID()}`;
}