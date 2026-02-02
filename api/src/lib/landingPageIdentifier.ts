export function generateLandingPageIdentifier(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789-";
  const length = 14;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
