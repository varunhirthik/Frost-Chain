# Contributing to FROST-CHAIN

We love your input! We want to make contributing to FROST-CHAIN as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](https://github.com/yourusername/frost-chain/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/frost-chain/issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   ```
3. Set up environment variables (see `.env.example`)
4. Run tests to ensure everything works:
   ```bash
   npm test
   ```
5. Start development environment:
   ```bash
   # Terminal 1: Start Hardhat node
   npx hardhat node
   
   # Terminal 2: Deploy contracts
   npm run deploy:local
   
   # Terminal 3: Start frontend
   cd frontend && npm start
   ```

## Code Style

- We use ESLint for JavaScript/TypeScript
- We use Prettier for code formatting
- We follow Solidity best practices for smart contracts
- Write meaningful commit messages
- Add comments for complex logic

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage
- Test both smart contracts and frontend components

## Smart Contract Guidelines

- Follow OpenZeppelin standards
- Use latest stable Solidity version
- Optimize for gas efficiency
- Include comprehensive error messages
- Document all public functions

## Frontend Guidelines

- Use React functional components with hooks
- Follow component composition patterns
- Ensure responsive design
- Handle loading and error states
- Maintain accessibility standards

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/a9316a723f9e918afde44dea68b5f9f39b7d9b00/CONTRIBUTING.md).
