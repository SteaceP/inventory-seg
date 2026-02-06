---
trigger: model_decision
description: When working in the development environment
---

# Local GitHub Actions Testing

We use `act` to test our GitHub Actions workflows locally.

## Installation

### macOS (Homebrew)
```bash
brew install act
```

### Windows (Chocolatey or Scoop)
```powershell
# Chocolatey
choco install act-cli

# Scoop
scoop install act
```

### Ubuntu/Linux (curl script)
```bash
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

## Prerequisite
- [act](https://github.com/nektos/act) icon installed on your system.
- Docker or a compatible container runtime (e.g., Docker Desktop, OrbStack, Podman).

## Configuration
We use a consolidated environment file for `act`: `.act.env`. This file contains both variables and secrets required for the workflows.

## Commands

### Run all workflows
```bash
act --secret-file .act.env --var-file .act.env
```

### Run a specific job
```bash
act -j <job_name> --secret-file .act.env --var-file .act.env
```

### Dry Run
```bash
act -n --secret-file .act.env --var-file .act.env
```

## Maintenance
- Ensure `.act.env` is updated when new secrets or variables are added to `.github/workflows/*.yml`.
- Never commit `.act.env` to the repository (enforced by `.gitignore`).
