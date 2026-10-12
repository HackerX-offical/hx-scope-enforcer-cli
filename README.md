# hx-scope-enforcer-cli

**Authorized engagement scope validation** — parse scope files, check single targets,
and filter host lists before recon or scanning.

## Why this exists

Bug bounty and pentest rules of engagement define in-scope hosts, CIDRs, and wildcards.
Running tools against out-of-scope assets is a compliance failure. This CLI loads a
scope file, validates syntax, and gates targets so pipelines fail fast when a line is
not allowed.

## Features

- `init` — Write an example `scope.txt` without overwriting existing files
- `validate` — Parse and confirm scope file syntax
- `check` — Single target in/out of scope (`--json` optional)
- `filter` — Split a newline-delimited list; optional `-o` in-scope output file
- Exit `2` when target is out of scope or filter finds out-of-scope lines

## Install

```bash
git clone https://github.com/HackerX-offical/hx-scope-enforcer-cli.git
cd hx-scope-enforcer-cli
npm install
npm run build
npm link   # optional: global hx-scope
```

## Quick start

```bash
hx-scope init scope.txt
hx-scope validate -f scope.txt
hx-scope check api.example.com -f scope.txt
hx-scope filter -f scope.txt -i targets.txt -o in-scope.txt
```

## Output

| Mode     | Description                                                                      |
| -------- | -------------------------------------------------------------------------------- |
| Default  | Green/red IN SCOPE / OUT OF SCOPE messages; filter lists both buckets            |
| `--json` | Structured `{ inScope, matchedRule, … }` or filter `{ inScope[], outOfScope[] }` |
| Exit `2` | Out-of-scope target or filter had rejected lines                                 |

## Develop

```bash
npm run format
npm run build
npm test
npm run test:integration   # optional fixture scope files
npm run format:check
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for module layout and extension points.

## Ethics

Use only on systems and content you are **authorized** to test. See
[SECURITY.md](./SECURITY.md).

## License

Licensed under the [HackerX License](./LICENSE). Redistributions must retain copyright,
license text, and [NOTICE](./NOTICE) attribution per the license terms.
