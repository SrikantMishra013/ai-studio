# AI Studio - Transform Images with AI

A modern, accessible web application that transforms images using AI. Upload an image, describe your vision, and let AI create something amazing with advanced image generation capabilities.

## ✨ Features

- **AI-Powered Image Transformation**: Upload images and transform them with AI
- **Creative Prompt System**: Natural language prompts for image generation
- **Style Presets**: Multiple artistic styles (Editorial, Streetwear, Vintage)
- **Generation History**: Save and manage your AI creations
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Accessibility First**: Built with WCAG guidelines in mind
- **Dark Theme**: Beautiful midnight neon aesthetic
- **Keyboard Navigation**: Full keyboard accessibility support
- **Robust Upload Validation**: Comprehensive file validation and error handling
- **Image Optimization**: Automatic resizing and quality optimization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SrikantMishra013/ai-studio.git
   cd ai-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Add your API keys
   # (See Environment Variables section below)
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:ci      # Run tests in CI mode

# Linting & Formatting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier

# Type Checking
npm run type-check   # Run TypeScript type checking
```

### Project Structure

```
ai-studio/
├── app/                    # Next.js 14 app directory
│   ├── globals.css        # Global styles and theme
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   │   ├── button.tsx     # Button component
│   │   ├── card.tsx       # Card component
│   │   └── ...            # Other UI components
│   └── ai-studio/         # Application-specific components
│       ├── prompt-input.tsx    # Prompt input form
│       ├── image-upload.tsx    # Image upload component
│       ├── sidebar.tsx         # Generation history sidebar
│       └── ...                 # Other app components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and API
├── public/                 # Static assets
├── styles/                 # Additional styles
├── __tests__/              # Test files
│   ├── app/                # App-level integration tests
├── components/             # Component unit tests
│   └── ai-studio/         # AI Studio component tests
├── upload-validation/      # Upload validation tests
└── evidence/               # Testing evidence and documentation
```

## 🔒 Upload Validation System

### File Requirements

- **Supported Formats**: PNG and JPEG only
- **Maximum Size**: 10MB per file
- **Image Dimensions**: Automatically resized if over 1920px
- **Quality Optimization**: Adaptive JPEG compression

### Validation Features

#### File Size Validation
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
```
- Prevents oversized file uploads
- Shows specific error messages with actual file size
- Maintains performance and user experience

#### File Type Validation
```typescript
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg"])
```
- Strict MIME type checking
- Prevents malicious file uploads
- Clear error messages for unsupported formats

#### Image Processing
- **Automatic Resizing**: Large images are automatically resized to 1920px max
- **Quality Optimization**: Adaptive compression based on image dimensions
- **Error Handling**: Graceful failure handling for corrupted images
- **User Feedback**: Success notifications and progress indicators

### Error Handling

- **Clear Error Messages**: Specific feedback for each validation failure
- **Error State Management**: Errors are cleared when new files are uploaded
- **User Guidance**: Helpful instructions for resolving validation issues
- **Accessibility**: Screen reader compatible error announcements

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- prompt-input.test.tsx

# Run upload validation tests
npm test -- upload-validation-simple.test.tsx
```

### Test Coverage

The application maintains comprehensive test coverage across all critical functionality:

- **Unit Tests**: Component logic and utility functions
- **Integration Tests**: Component interactions and user flows
- **Upload Validation Tests**: File validation and error handling
- **Accessibility Tests**: Keyboard navigation and screen reader support
- **Visual Tests**: Component rendering and styling

### Upload Validation Testing

Comprehensive test suite for the upload validation system:

```typescript
describe('Upload Validation - Simple Tests', () => {
  describe('File Size Validation', () => {
    it('rejects files over 10MB', async () => { /* ... */ })
    it('accepts files under 10MB', async () => { /* ... */ })
  })
  
  describe('File Type Validation', () => {
    it('rejects non-image files', async () => { /* ... */ })
    it('accepts PNG files', async () => { /* ... */ })
    it('accepts JPEG files', async () => { /* ... */ })
  })
  
  describe('User Experience', () => {
    it('clears previous errors when uploading new file', async () => { /* ... */ })
  })
})
```

**Test Results**: ✅ **6/6 tests passing** (100% success rate)

### Testing Libraries

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers
- **@testing-library/user-event**: User interaction simulation

### Test Structure

```
__tests__/
├── app/                    # App-level integration tests
├── components/             # Component unit tests
│   └── ai-studio/         # AI Studio component tests
├── upload-validation/      # Upload validation tests
└── evidence/               # Testing evidence and documentation
```

## 🎨 Design System

### Color Palette

The application uses a **Midnight Neon** theme with carefully chosen colors for accessibility and visual appeal:

```css
/* Primary Colors */
--primary: oklch(0.7 0.22 300);        /* Vibrant Violet */
--accent: oklch(0.74 0.18 190);        /* Teal/Cyan */
--secondary: oklch(0.78 0.13 210);     /* Soft Sky */

/* Background Colors */
--background: oklch(0.17 0.03 270);    /* Deep Indigo Slate */
--card: oklch(0.2 0.03 270);           /* Slightly Lighter Background */

/* Text Colors */
--foreground: oklch(0.96 0.02 250);    /* Near-White */
--muted-foreground: oklch(0.78 0.04 260); /* Muted Text */
```

### Typography

- **Primary Font**: Geist Sans (modern, readable)
- **Monospace Font**: Geist Mono (for technical content)
- **Font Sizes**: Responsive scale from 12px to 24px
- **Line Heights**: Optimized for readability (1.4-1.6)

### Component Design

#### Cards
- Subtle borders with `border-border/30`
- Hover effects with scale transforms
- Focus states with vibrant ring colors
- Consistent padding and spacing

#### Buttons
- Multiple variants: primary, secondary, ghost, destructive
- Hover and focus states with smooth transitions
- Icon support with proper spacing
- Disabled states with reduced opacity

#### Forms
- Clear labels with proper associations
- Focus states with vibrant outlines
- Error states with destructive colors
- Validation feedback with user-friendly messages

### Responsive Design

- **Mobile First**: Designed for mobile, enhanced for desktop
- **Breakpoints**: 640px, 768px, 1024px, 1280px
- **Grid System**: Flexible layouts that adapt to screen size
- **Touch Targets**: Minimum 44px for mobile accessibility

### Animation & Transitions

- **Smooth Transitions**: 200ms ease-in-out for interactive elements
- **Hover Effects**: Subtle transforms and color changes
- **Focus Animations**: Pulsing rings for keyboard navigation
- **Page Transitions**: Fade-in effects for route changes

## ♿ Accessibility Features

### Keyboard Navigation
- Full keyboard support for all interactive elements
- Visible focus indicators with high contrast
- Logical tab order
- Keyboard shortcuts for common actions

### Screen Reader Support
- Semantic HTML structure
- ARIA labels and descriptions
- Live regions for dynamic content
- Proper heading hierarchy

### Color & Contrast
- WCAG AA compliant color combinations
- High contrast mode support
- Reduced motion preferences respected
- Color is not the only way to convey information

### Focus Management
- Focus trapping in modals
- Focus restoration after actions
- Skip links for main content
- Focus indicators on all interactive elements

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=your_api_endpoint
NEXT_PUBLIC_API_KEY=your_api_key

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PWA=true

# Development
NODE_ENV=development
```

## 📱 Progressive Web App

The application includes PWA features:
- Service worker for offline functionality
- App manifest for installation
- Responsive design for all devices
- Fast loading with optimized assets

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

```bash
# Build the application
npm run build

# Start production server
npm start

# Or serve static files from .next/static
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Ensure accessibility compliance
- Update documentation as needed
- Use conventional commit messages
- Test upload validation for any file-related changes

### Quality Assurance

- **Test Coverage**: Maintain >90% test coverage
- **Upload Validation**: All file uploads must pass validation tests
- **Accessibility**: WCAG AA compliance required
- **Performance**: Lighthouse score >90
- **Code Quality**: ESLint and TypeScript strict mode

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js 14](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Accessibility guidance from [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- Testing framework powered by [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/ai-studio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ai-studio/discussions)
- **Email**: srikantmishra856@gmail.com

---

**Made with ❤️ and AI assistance**

*Last updated: January 2025 - Upload validation system fully tested and documented*
