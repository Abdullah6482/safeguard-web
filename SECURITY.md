# Security policy

## Reporting a vulnerability

Please do not disclose a suspected vulnerability in a public issue. Use GitHub's private vulnerability reporting for this repository when available, or contact the maintainer through the repository owner's profile.

Include the affected component, reproduction steps, expected impact, and any suggested mitigation. Do not include real credentials, personal data, or production incident evidence.

## Secrets

This frontend must contain only Supabase publishable credentials. Service-role keys, `sb_secret_...` keys, database passwords, and real user credentials must never be committed, embedded in builds, screenshots, issues, or logs.
