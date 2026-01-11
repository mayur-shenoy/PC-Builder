# PC Build Assistant

An explainable, user-driven tool that guides users through building a custom PC by comparing compatible components step-by-step.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Zustand** for state management
- **fast-check** for property-based testing
- **Jest** with React Testing Library for testing

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

- `/src` - Source code
- `/src/__mocks__` - Mock files for testing
- `jest.config.js` - Jest configuration
- `tsconfig.json` - TypeScript configuration (strict mode enabled)
## TypeScript Configuration

The project uses TypeScript with strict mode enabled for maximum type safety. The configuration includes:

- Strict type checking
- No unused locals or parameters
- No fallthrough cases in switch statements
- ES2022 target with modern JavaScript features
