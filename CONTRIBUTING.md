# Contributing to Buoy

Thank you for your interest in contributing! This document outlines the process for getting involved.

## How to Contribute

### Reporting Bugs

Before filing a bug report, please check existing issues. When reporting:
- Use a clear, descriptive title
- Describe the steps to reproduce the problem
- Include your OS version and Buoy version
- Attach screenshots if applicable

### Suggesting Features

Feature suggestions are welcome! Open an issue with the label `enhancement` and describe:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Ensure the code compiles: `npx tsc --noEmit` and `cargo check`
5. Commit with a clear message
6. Push to your fork and open a pull request

### Development Setup

```bash
npm install
npm run tauri dev
```

## Code Style

- **TypeScript**: Follow existing patterns in the codebase
- **Rust**: Run `cargo fmt` and `cargo clippy` before committing
- **UI**: Maintain consistency with Tailwind design tokens

## Questions?

Feel free to open a discussion or reach out to the maintainers.
