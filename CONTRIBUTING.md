# Contributing to LinguaFabric

Thank you for your interest in contributing to LinguaFabric! 🌍

This is an open-source project dedicated to making language creation accessible to everyone. We welcome contributions from developers, designers, linguists, and community members.

## Ways to Contribute

### 💻 Code Contributions
- **Bug fixes** - Fix issues marked with `bug` label
- **Features** - Implement features from the roadmap
- **Refactoring** - Improve code quality and performance
- **Documentation** - Update docs and tutorials
- **Tests** - Add unit and integration tests

### 📚 Documentation
- Improve README and setup guides
- Create tutorials for new features
- Fix typos and clarify explanations
- Translate docs to other languages

### 🎨 Design & UX
- Improve component styling
- Create design mockups
- Report UI/UX issues
- Suggest accessibility improvements

### 🌐 Community
- Answer questions in Issues and Discussions
- Share your projects using LinguaFabric
- Report bugs you find
- Suggest features on GitHub Discussions

## Getting Started

### 1. Fork and Clone
```bash
git clone https://github.com/YOUR_USERNAME/language_creator.git
cd language_creator
```

### 2. Set Up Development Environment
```bash
npm install
npm run dev
```

### 3. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number
```

### 4. Make Your Changes
- Follow the code patterns in [systemPatterns.md](systemPatterns.md)
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

### 5. Push and Create a Pull Request
```bash
git add .
git commit -m "feat: add amazing new feature"
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub with:
- Clear description of changes
- Link to related issues
- Screenshots for UI changes
- Tests for new functionality

## Development Setup

### Prerequisites
- Node.js 20.10.0+
- npm 10.2.3+

### Backend Options

**Option A: Firebase (Production-ready)**
```bash
# Create Firebase project at console.firebase.google.com
# Copy credentials to .env.local
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
# etc.
```

**Option B: Supabase (Free/Open-Source) ⭐ Recommended**
```bash
# Visit supabase.com and create free project
# Copy credentials to .env.local
VITE_SUPABASE_URL=...
VITE_SUPABASE_KEY=...
```

### Run Locally
```bash
npm run dev
# Open http://localhost:5173
```

## Code Standards

### TypeScript
- Use strict mode (no `any` types)
- Define interfaces for data structures
- Document complex functions with JSDoc

### Components
- Use functional components with hooks
- Props should be typed with interfaces
- Components should be under 300 lines
- Use meaningful component names

### Styling
- Use Tailwind CSS classes
- Follow BEM convention for custom CSS
- Ensure dark mode support
- Test on mobile (< 768px width)

### Commits
- Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `test:`, `refactor:`
- Keep commits atomic and focused
- Reference issues: `fix: auth flow (#42)`

## Pull Request Guidelines

### Before Submitting
- [ ] Tests pass: `npm run lint`
- [ ] No console errors in development
- [ ] Updated relevant documentation
- [ ] Added tests for new features
- [ ] Screenshots for UI changes

### Title Format
- `feat: description of new feature`
- `fix: description of bug fix`
- `docs: update documentation`
- `refactor: improve code organization`

### Description Template
```markdown
## Description
Explain what this PR does.

## Related Issues
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Breaking change

## How to Test
Steps to verify the changes work.

## Screenshots
If applicable, add before/after screenshots.
```

## Design Decisions

### Architecture
- React 18 + TypeScript for frontend
- Dual backend support (Firebase or Supabase)
- Real-time updates with subscriptions
- Client-side routing with React Router

### Code Organization
- `/src/components` - Reusable UI components
- `/src/pages` - Page-level components
- `/src/services` - Backend business logic
- `/src/hooks` - Custom React hooks
- `/src/types` - TypeScript interfaces
- `/src/context` - React Context providers

See [systemPatterns.md](systemPatterns.md) for detailed patterns and best practices.

## Questions?

- 💬 Open a GitHub Discussion
- 📖 Read the documentation
- 🐛 Search existing Issues
- 📧 Contact the maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making LinguaFabric better!** 🚀
