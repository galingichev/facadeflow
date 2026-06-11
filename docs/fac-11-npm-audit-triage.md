# FAC-11 npm audit triage

Date: 2026-06-11

## Summary

No dependency updates were applied. The repo root and backend production
dependency audits are clean. The mobile app still has 17 moderate advisories,
but npm reports the available fixes as Expo SDK 56 / Expo package major
upgrades or no fix available. That path is not demo-safe because the recent
SDK 56 spike failed verification on React Compiler / hooks lint fallout.

## Commands run

```bash
npm audit --omit=dev --audit-level=moderate --json
cd backend && npm audit --omit=dev --audit-level=moderate --json
cd facadeflow/mobile-app && npm audit --omit=dev --audit-level=moderate --json
cd facadeflow/mobile-app && npm audit fix --omit=dev --dry-run --json
```

## Results

| Package root | Result | Notes |
| --- | --- | --- |
| Repo root | 0 vulnerabilities | Production dependencies pass at moderate threshold. |
| Backend | 0 vulnerabilities | Production dependencies pass at moderate threshold. |
| Mobile app | 17 moderate vulnerabilities | Fixes require Expo SDK/package major upgrades or are unavailable. |

## Mobile findings

| Package | Severity | Dependency path | Fix available | Triage |
| --- | --- | --- | --- | --- |
| `@expo/cli` | Moderate | `expo -> @expo/cli` | `expo@56.0.11`, semver-major | Defer. Expo SDK major upgrade, not demo-safe. |
| `@expo/config` | Moderate | Expo packages via `@expo/config` | `expo@56.0.11`, semver-major | Defer. Expo SDK major upgrade. |
| `@expo/config-plugins` | Moderate | Expo config plugins via `xcode` | `expo@56.0.11`, semver-major | Defer. Expo SDK major upgrade. |
| `@expo/metro-config` | Moderate | Expo Metro config via `@expo/config` and `postcss` | `expo@56.0.11`, semver-major | Defer. Expo SDK major upgrade. |
| `@expo/ngrok` | Moderate | Direct dependency via `uuid` | No fix available | Keep for tunnel/demo use; revisit when package publishes a patched path. |
| `@expo/prebuild-config` | Moderate | Expo prebuild config | `expo-splash-screen@56.0.10`, semver-major | Defer. Expo package major upgrade. |
| `expo` | Moderate | Direct dependency via Expo internals | `expo@56.0.11`, semver-major | Defer. SDK major upgrade is risky before demo. |
| `expo-asset` | Moderate | `expo -> expo-asset -> expo-constants` | `expo@56.0.11`, semver-major | Defer. Expo SDK major upgrade. |
| `expo-constants` | Moderate | Direct dependency, via `@expo/config` | `expo-constants@56.0.18`, semver-major | Defer. Expo package major upgrade. |
| `expo-linking` | Moderate | Direct dependency via `expo-constants` | `expo-linking@56.0.14`, semver-major | Defer. Expo package major upgrade. |
| `expo-manifests` | Moderate | `expo-updates -> expo-manifests` | `expo-updates@56.0.19`, semver-major | Defer. Expo package major upgrade. |
| `expo-router` | Moderate | Direct dependency via Expo packages | `expo-router@56.2.10`, semver-major | Defer. Expo package major upgrade. |
| `expo-splash-screen` | Moderate | Direct dependency via `@expo/prebuild-config` | `expo-splash-screen@56.0.10`, semver-major | Defer. Expo package major upgrade. |
| `expo-updates` | Moderate | Direct dependency via `expo-manifests` | `expo-updates@56.0.19`, semver-major | Defer. Expo package major upgrade. |
| `postcss` | Moderate | `expo -> @expo/metro-config -> postcss` | `expo@56.0.11`, semver-major | Defer. Transitive through Expo tooling. |
| `uuid` | Moderate | `@expo/ngrok -> uuid`, `xcode -> uuid` | `expo@56.0.11`, semver-major for Expo path; no direct `@expo/ngrok` fix | Defer. Override would force transitive majors through tooling and is not clearly low risk. |
| `xcode` | Moderate | `@expo/config-plugins -> xcode -> uuid` | `expo@56.0.11`, semver-major | Defer. Transitive through Expo tooling. |

## Recommended follow-up

Keep Expo SDK 54 for demo stabilization. After the demo, schedule a planned
Expo SDK 56 upgrade branch that first resolves the React Compiler / hooks lint
failures found in the earlier SDK 56 spike, then re-runs the full demo and
browser smoke verification.
