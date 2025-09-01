# Security Policy

## Supported Versions

The following versions of Rune VCS are currently being supported with security updates:

| Version       | Supported          |
| ------------- | ------------------ |
| 0.3.1-alpha.5 | :white_check_mark: |
| 0.3.0-alpha.4 | :x:                |
| < 0.3.0       | :x:                |

## Reporting a Vulnerability

We take the security of Rune VCS seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@rune-vcs.dev**

Please include the following information in your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### What to Expect

- **Acknowledgment**: We will acknowledge your email within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 5 business days
- **Regular Updates**: We will keep you informed of our progress throughout the process
- **Resolution Timeline**: We aim to resolve security issues within 30 days

### Security Update Process

1. **Vulnerability Assessment**: Our security team will assess the reported vulnerability
2. **Fix Development**: We will develop and test a fix for the vulnerability
3. **Security Advisory**: We will prepare a security advisory with details about the vulnerability
4. **Coordinated Disclosure**: We will coordinate the release of the fix and advisory
5. **Public Disclosure**: After the fix is released, we will publicly disclose the vulnerability

## Current Security Status

### Known Vulnerabilities (v0.3.1-alpha.5)

As of August 30, 2025, the following security vulnerabilities are known and being addressed:

#### High Priority (In Progress - v0.3.2-alpha.6)

- **RUSTSEC-2025-0021**: `gix-features` SHA-1 collision detection (Medium severity 6.8)

  - **Status**: Fix in progress - updating to gix ≥0.64.0
  - **Impact**: Potential SHA-1 collision attacks not detected
  - **Mitigation**: Using SHA-256 for critical operations

- **RUSTSEC-2025-0001**: `gix-worktree-state` file permissions (Medium severity 5.0)

  - **Status**: Fix in progress - updating dependencies
  - **Impact**: Executable files may be world-writable during checkout
  - **Mitigation**: File permission validation in post-checkout hooks

- **RUSTSEC-2025-0009**: `ring` AES overflow (No severity rating)
  - **Status**: Fix in progress - updating to ring ≥0.17.12
  - **Impact**: Potential panic in AES functions with overflow checking
  - **Mitigation**: Using alternative crypto implementations where possible

#### Accepted Risks

- **RUSTSEC-2023-0071**: `rsa` Marvin attack timing sidechannel (Medium severity 5.9)
  - **Status**: No fix available from upstream
  - **Impact**: Potential key recovery through timing sidechannels
  - **Mitigation**: Using RSA only for non-critical operations, implementing constant-time operations where possible

#### Low Priority

- **RUSTSEC-2024-0436**: `paste` crate unmaintained (Warning)
  - **Status**: Evaluating alternatives
  - **Impact**: No security impact, maintenance concern only
  - **Mitigation**: Monitoring for alternatives, considering removal from optional ML features

### Security Measures in Place

- **Automated Security Scanning**: `cargo audit` runs on every build
- **Dependency Management**: Regular updates to security-patched versions
- **Input Validation**: Comprehensive validation of all user inputs
- **Authentication Security**: Secure session management and rate limiting
- **Cryptographic Best Practices**: Using well-established cryptographic libraries
- **Code Review**: All security-related code undergoes peer review

## Security Best Practices for Users

### General Security

- Keep Rune VCS updated to the latest version
- Use strong authentication credentials
- Enable two-factor authentication when available
- Regularly review repository access permissions

### Repository Security

- Use secure remote URLs (HTTPS/SSH)
- Validate repository integrity after cloning
- Be cautious with untrusted repositories
- Regularly audit repository access logs

### Development Security

- Validate all external inputs in Rune VCS integrations
- Use secure coding practices in repository hooks
- Keep development dependencies updated
- Follow principle of least privilege for repository access

## Contact Information

- **Security Email**: security@rune-vcs.dev
- **General Contact**: contact@rune-vcs.dev
- **GitHub Issues**: https://github.com/CaptainOtto/rune-vcs/issues (for non-security issues)
- **Security Advisories**: https://github.com/CaptainOtto/rune-vcs/security/advisories

## Acknowledgments

We thank the security research community for their responsible disclosure of vulnerabilities and their contributions to making Rune VCS more secure.

---

**Last Updated**: August 30, 2025  
**Next Review**: September 30, 2025
