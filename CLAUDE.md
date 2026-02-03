# Project Rules for Claude

## Package Manager
This project uses **Bun** as the package manager and runtime.

- Use `bun` instead of `npm` for package management
- Use `bunx` instead of `npx` for running package binaries
- Use `bun run` instead of `npm run` for running scripts

## Examples
```bash
# Install dependencies
bun install

# Run TypeScript check
bunx tsc --noEmit

# Run scripts
bun run start
bun run build
```
