/**
 * Password Hashing Utility
 *
 * This module provides functions for hashing and verifying passwords.
 * It uses bcrypt for secure password hashing.
 */

import bcrypt from "bcrypt";
import crypto from "crypto";

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param password The password to hash
 * @returns A bcrypt hash string
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    console.log("hashPassword: Starting password hashing");

    // Handle empty password case
    if (!password) {
      console.warn("hashPassword: Empty password provided");
      // Return a valid bcrypt hash for empty passwords (won't match any real password)
      return "$2a$10$000000000000000000000000000000000000000000000000";
    }

    // Generate a salt and hash the password using bcrypt
    console.log(
      "hashPassword: Using bcrypt.hash with salt rounds:",
      SALT_ROUNDS,
    );
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);

    console.log(
      "hashPassword: Generated bcrypt hash:",
      hash.substring(0, 10) + "...",
    );
    return hash;
  } catch (error) {
    console.error("hashPassword: Unexpected error:", error);
    // Return a valid bcrypt hash in case of errors (won't match any real password)
    return "$2a$10$000000000000000000000000000000000000000000000000";
  }
}

/**
 * Verify a password against a hash
 * @param password The password to verify
 * @param hash The hash to verify against
 * @returns True if the password matches the hash, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    console.log("verifyPassword: Starting password verification");

    // Handle empty password case
    if (!password) {
      console.warn("verifyPassword: Empty password provided");
      return false;
    }

    // Handle invalid hash case
    if (!hash) {
      console.error("verifyPassword: No hash provided");
      return false;
    }

    console.log(`verifyPassword: Hash format: ${hash.substring(0, 10)}...`);

    // Check if the hash is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    const isBcryptHash = /^\$2[aby]\$\d+\$/.test(hash);
    console.log(`verifyPassword: Is bcrypt hash: ${isBcryptHash}`);

    if (isBcryptHash) {
      // Use bcrypt to verify the password
      console.log("verifyPassword: Using bcrypt.compare");
      const match = await bcrypt.compare(password, hash);

      console.log("Password verification (bcrypt):", {
        storedHash: hash.substring(0, 10) + "...",
        match,
      });

      return match;
    }

    // If it's not a bcrypt hash or bcrypt.compare failed, try alternative methods

    // Try SHA-256 verification (for backward compatibility)
    if (!isBcryptHash && /^[0-9a-f]+$/i.test(hash)) {
      console.log("verifyPassword: Trying SHA-256 verification");

      try {
        // Use the old SHA-256 verification method
        const hashBuffer = crypto
          .createHash("sha256")
          .update(password + "some-salt-value")
          .digest();
        const passwordHash = hashBuffer.toString("hex");

        const match = passwordHash === hash;
        console.log("Password verification (SHA-256):", {
          inputPasswordHash: passwordHash.substring(0, 10) + "...",
          storedHash: hash.substring(0, 10) + "...",
          match,
        });

        return match;
      } catch (shaError) {
        console.error(
          "verifyPassword: Error in SHA-256 verification:",
          shaError,
        );
      }
    }

    // If all verification methods fail, return false
    console.error("verifyPassword: All verification methods failed");
    return false;
  } catch (error) {
    console.error("verifyPassword: Unexpected error:", error);
    return false;
  }
}
