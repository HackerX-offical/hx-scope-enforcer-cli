# hx-scope-enforcer-cli

**Authorized engagement scope validation** for bug bounty, pentest, and red-team prep.
Every scan pipeline should fail closed when a target is out of scope.

## Install

```bash
npm install
npm run build
npm link   # optional: global hx-scope
```

## Usage

```bash
# Create a starter scope file
hx-scope init ./engagement-scope.txt

# Validate syntax
hx-scope validate -f ./engagement-scope.txt

# Check one target (exit 0 = in scope, 2 = out of scope)
hx-scope check https://api.staging.example.com -f ./engagement-scope.txt

# Filter a host list
hx-scope filter -f ./engagement-scope.txt -i targets.txt -o in-scope.txt
```

### Scope file format

```
# comments allowed
example.com
*.staging.example.com
192.168.1.10
10.0.0.0/8
```

## Ethics

Use only against systems you are **explicitly authorized** to test. See
[SECURITY.md](./SECURITY.md).

## Develop

```bash
npm test
```

## License

Licensed under the [HackerX License](./LICENSE). Redistributions must retain copyright,
license text, and [NOTICE](./NOTICE) attribution per the license terms.
