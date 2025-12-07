import { AuthError } from "@supabase/supabase-js";
import { TranslationKey } from "../i18n/translations";

/**
 * Maps Supabase auth error codes to translation keys
 */
export function getAuthErrorKey(error: AuthError): TranslationKey {
  const message = error.message.toLowerCase();
  const code = error.status;

  // Check for specific error messages from Supabase
  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return "errorInvalidCredentials";
  }

  if (message.includes("email not confirmed")) {
    return "errorEmailNotConfirmed";
  }

  if (
    message.includes("invalid email") ||
    message.includes("unable to validate email") ||
    message.includes("is invalid")
  ) {
    return "errorInvalidEmail";
  }

  if (
    message.includes("password") &&
    (message.includes("weak") ||
      message.includes("short") ||
      message.includes("at least"))
  ) {
    return "errorWeakPassword";
  }

  if (
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("user already exists")
  ) {
    return "errorEmailTaken";
  }

  if (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    code === 429
  ) {
    return "errorTooManyRequests";
  }

  if (message.includes("user not found") || message.includes("no user")) {
    return "errorUserNotFound";
  }

  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection")
  ) {
    return "errorNetworkError";
  }

  // Default fallback
  return "errorGeneric";
}
