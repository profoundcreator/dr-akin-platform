export function generateBookingReference(): string {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `DAA-${suffix}`;
}
