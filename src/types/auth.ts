import type { Language } from "./user";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

export interface LanguageSwitcherProps {
  language: string;
  onLanguageChange: (language: Language) => void | Promise<void>;
}

export interface LoginHeaderProps {
  title: string;
}

export interface LoginFormProps {
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
  labels: {
    email: string;
    password: string;
    togglePassword: string;
    signIn: string;
    signingIn: string;
    captchaError: string;
  };
  isDev: boolean;
}

export interface LoginFooterProps {
  noAccountText: string;
  noAccountLinkText: string;
}

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
  labels: {
    displayName: string;
    email: string;
    password: string;
    togglePassword: string;
    createAccount: string;
    creatingAccount: string;
  };
  isDev: boolean;
}

export interface SignupSuccessProps {
  title: string;
  successMessage: string;
  signInLabel: string;
  onSignInClick: () => void;
}

export interface SignupFooterProps {
  alreadyHaveAccountText: string;
  signInText: string;
}
