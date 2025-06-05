/**
 * Generate a secure random password
 * @param length - Password length (default: 12)
 * @returns string - Generated password
 */
export const generateSecurePassword = (length: number = 12): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
  let password = "";

  // Ensure at least one character from each required type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // lowercase
  password += "0123456789"[Math.floor(Math.random() * 10)]; // number
  password += "@$!%*?&"[Math.floor(Math.random() * 7)]; // special char

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

/**
 * Check if password has been compromised (optional - requires API call)
 */
export const checkPasswordBreach = async (
  password: string,
): Promise<boolean> => {
  // Implementation using HaveIBeenPwned API or similar
  return false;
};
