# envdiff

> Compare .env files and find missing or different variables instantly

[![npm version](https://img.shields.io/npm/v/envdiff.svg)](https://www.npmjs.com/package/envdiff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Problem

Dev works, staging fails. What env vars are different?

## Solution

`envdiff` compares .env files and shows differences clearly — find that missing variable in seconds, not hours.

## Features

- **Instant comparison** - See differences at a glance
- **Smart masking** - Sensitive values are masked by default
- **Export missing vars** - Generate file with missing variables
- **Validate against example** - Check .env against .env.example
- **CI/CD ready** - Exit code 1 when differences found
- **JSON output** - For scripting and automation

## Installation

```bash
# Run directly with npx (recommended)
npx envdiff .env.development .env.staging

# Or install globally
npm install -g envdiff

# Or as dev dependency
npm install --save-dev envdiff
```

## Usage

### Compare Two Files

```bash
# Basic comparison
npx envdiff .env.development .env.staging

# Show all values (including sensitive)
npx envdiff .env.development .env.staging --show-values

# Show identical variables too
npx envdiff .env.development .env.staging --show-identical

# Output as JSON
npx envdiff .env.development .env.staging --json
```

### Export Missing Variables

```bash
# Export variables missing from second file
npx envdiff .env.development .env.staging --export missing.env

# Export from the other direction
npx envdiff .env.staging .env.development --export missing.env
```

### Validate Against Example

```bash
# Check if .env has all variables from .env.example
npx envdiff validate .env .env.example

# Strict mode: fail if .env has extra variables
npx envdiff validate .env .env.example --strict
```

## Example Output

```
🔍 Environment Comparison
──────────────────────────────────────────────────

Comparing:
  1. .env.development
  2. .env.staging

❌ Missing in .env.staging:
   • STRIPE_WEBHOOK_SECRET
   • REDIS_URL
   • DEBUG_MODE

⚠️  Missing in .env.development:
   • SENTRY_DSN
   • CDN_URL

🔄 Different values:
   • API_URL
     File 1: http://localhost:3000
     File 2: https://api-staging.example.com
   • DATABASE_URL
     File 1: postgres://localhost:5432/dev
     File 2: postgres://staging-db:5432/staging

✅ Identical: 23 variables

──────────────────────────────────────────────────
Summary:
   Missing in file 1: 2
   Missing in file 2: 3
   Different values:  2
   Identical:         23

💡 Tip: Use --export <file> to export missing variables
──────────────────────────────────────────────────
Found the bug in seconds? Consider supporting:
☕ https://buymeacoffee.com/willzhangfly
```

## Validation Example

```bash
$ npx envdiff validate .env .env.example

🔍 Environment Validation
──────────────────────────────────────────────────

❌ Missing required variables:
   • DATABASE_URL
   • JWT_SECRET

⚠️  Extra variables not in example:
   • DEBUG_MODE
   • LOCAL_ONLY_VAR
```

## CLI Options

### Compare Command

```
Usage: envdiff <file1> <file2> [options]

Arguments:
  file1                    First .env file
  file2                    Second .env file

Options:
  --json                   Output results as JSON
  --show-identical         Show identical variables
  --show-values            Show all values (including sensitive)
  --export <file>          Export missing variables to a file
  --export-from <source>   Source for export: "first" or "second"
  -V, --version            Output version number
  -h, --help               Display help
```

### Validate Command

```
Usage: envdiff validate <env-file> <example-file> [options]

Arguments:
  env-file                 Your .env file
  example-file             The .env.example template

Options:
  --strict                 Fail if env has extra variables
  -h, --help               Display help
```

## CI/CD Integration

```yaml
# GitHub Actions
- name: Validate environment
  run: npx envdiff validate .env .env.example

# Compare staging vs production config
- name: Compare environments
  run: |
    npx envdiff .env.staging .env.production --json > env-diff.json
    if [ $? -ne 0 ]; then
      echo "Environment files differ!"
      cat env-diff.json
    fi
```

## Programmatic Usage

```typescript
import { compareEnvFiles, areIdentical } from 'envdiff';

const result = compareEnvFiles('.env.development', '.env.staging');

console.log('Missing in staging:', result.missingInSecond);
console.log('Different values:', result.different);

if (areIdentical(result)) {
  console.log('Files are identical!');
}
```

## Security

By default, `envdiff` masks values for keys containing:
- `secret`, `password`, `key`, `token`
- `auth`, `credential`, `private`, `api_key`

Use `--show-values` to display all values.

## Comparison with Alternatives

| Tool | .env Aware | Visual Diff | Export | Validate | npm Native |
|------|------------|-------------|--------|----------|------------|
| **envdiff** | ✅ | ✅ | ✅ | ✅ | ✅ |
| `diff` command | ❌ | ⚠️ | ❌ | ❌ | N/A |
| dotenv-safe | ❌ | ❌ | ❌ | ✅ | ✅ |
| envalid | ❌ | ❌ | ❌ | ✅ | ✅ |

## Requirements

- Node.js 18.0.0 or higher

## Contributing

Contributions welcome! Ideas:
- Support for encrypted .env files
- Integration with secret managers
- VS Code extension

## Support

This project is maintained in my free time. If it helped you find that missing variable faster, I'd really appreciate your support:

- ⭐ Star the repo—it helps others discover this tool
- 📢 Share with your team or on social media
- 🐛 [Report bugs or suggest features](https://github.com/willzhangfly/env-compare/issues)
- ☕ [Buy me a coffee](https://buymeacoffee.com/willzhangfly) if you'd like to support development

Thank you to everyone who has contributed, shared feedback, or helped spread the word!

## License

MIT

---

**Made with ❤️ for faster debugging**
