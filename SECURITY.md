# Security Policy

## Supported Versions

Currently, only the latest version of the inventory management system receives security updates.

| Version | Supported |
| --- | --- |
| 1.3.2 (Latest) | :white_check_mark: |
| < 1.3.2 |

## Reporting a Vulnerability

We take the security of this project seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

**Please do not report security vulnerabilities via public GitHub issues.**

Instead, please follow these steps:

1. Contact the maintainer via the contact information provided in their GitHub profile.
2. Provide a detailed description of the vulnerability and the steps to reproduce it.

We will acknowledge receipt of your report within 48 hours and work with you to resolve the issue promptly.

## Disclosure Policy

- We will not pursue legal action against individuals who discover and report vulnerabilities responsibly.
- We ask that you give us reasonable time to fix the issue before disclosing it publicly.
- We will notify users of critical security patches through release notes.

## Security Best Practices

In addition to the built-in measures, we recommend that administrators:

### Authentication

- **Supabase Auth**: Used for all user authentication.
- **2FA/MFA**: Time-based One-Time Password (TOTP) two-factor authentication is supported and recommended for all users.
- **JWT**: Secure JSON Web Tokens are used for session management.
- **RLS**: Row Level Security is enforced on all database tables.

1. **Shorten JWT Expiration**: In the Supabase dashboard, set token expiration to a short value (e.g., 1 hour) to limit risks in case of session theft.
2. **Use 2FA**: Enable two-factor authentication for all administrative accounts.
3. **Review RLS Policies**: Ensure Row Level Security (RLS) policies are always enabled and restrictive.

Thank you for helping keep this project secure!
