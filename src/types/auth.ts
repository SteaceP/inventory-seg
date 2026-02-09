import type { Language } from "./user";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

/** Props for the language selection component on auth screens */
export interface LanguageSwitcherProps {
  /** Currently active language code */
  language: string;
  /** Callback to change application language */
  onLanguageChange: (language: Language) => void | Promise<void>;
}

/** Props for auth screen headers */
export interface LoginHeaderProps {
  /** Text to display in the header */
  title: string;
}

/**
 * Props for the login credentials form.
 */
export interface LoginFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  /** Toggle visibility of password characters */
  showPassword: boolean;
  onTogglePassword: () => void;
  /** Form submission state */
  loading: boolean;
  /** Cloudflare Turnstile token */
  captchaToken: string | undefined;
  onCaptchaSuccess: (token: string) => void;
  onCaptchaError: () => void;
  onCaptchaExpire: () => void;
  /** Ref to Turnstile instance for resetting */
  turnstileRef: React.RefObject<TurnstileInstance | null>;
  turnstileSiteKey: string;
  /** Localized text for form elements */
  labels: {
    email: string;
    password: string;
    togglePassword: string;
    signIn: string;
    signingIn: string;
    captchaError: string;
  };
  /** Development mode flag for skipping captcha */
  isDev: boolean;
  /** Callback for form submission */
  onSubmit?: (e: React.SyntheticEvent<HTMLFormElement>) => void | Promise<void>;
}

/** Props for footer links on the login screen */
export interface LoginFooterProps {
  noAccountText: string;
  noAccountLinkText: string;
}

/**
 * Props for the user registration form.
 */
export interface SignupFormProps {
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  loading: boolean;
  captchaToken: string | undefined;
  onCaptchaSuccess: (token: string) => void;
  onCaptchaError: () => void;
  onCaptchaExpire: () => void;
  turnstileRef: React.RefObject<TurnstileInstance | null>;
  turnstileSiteKey: string;
  /** Localized text for signup form elements */
  labels: {
    displayName: string;
    email: string;
    password: string;
    togglePassword: string;
    createAccount: string;
    creatingAccount: string;
  };
  isDev: boolean;
  /** Callback for form submission */
  onSubmit?: (e: React.SyntheticEvent<HTMLFormElement>) => void | Promise<void>;
}

/** Props for the successful registration placeholder */
export interface SignupSuccessProps {
  title: string;
  successMessage: string;
  signInLabel: string;
  onSignInClick: () => void;
}

/** Props for footer links on the signup screen */
export interface SignupFooterProps {
  alreadyHaveAccountText: string;
  signInText: string;
}
