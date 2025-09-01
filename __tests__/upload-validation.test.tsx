import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIStudio from '@/app/page'

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock the components
jest.mock('@/components/ai-studio', () => ({
  Sidebar: ({ history, onNewChat, onHistoryClick, onDeleteGeneration, styleOptions }: any) => (
    <aside data-testid="sidebar">
      <button onClick={onNewChat}>New Generation</button>
      {history.map((gen: any) => (
        <div key={gen.id} onClick={() => onHistoryClick(gen)}>
          {gen.prompt}
          <button onClick={(e) => { e.stopPropagation(); onDeleteGeneration(gen.id) }}>
            Delete
          </button>
        </div>
      ))}
    </aside>
  ),
  ImageUpload: ({ uploadedImage, onFileUpload, onRemoveImage, onBackToWelcome, fileInputRef }: any) => (
    <div data-testid="image-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFileUpload(file)
        }}
        data-testid="file-input"
      />
      {uploadedImage && (
        <button onClick={onRemoveImage}>Remove Image</button>
      )}
      <button onClick={onBackToWelcome}>Back</button>
    </div>
  ),
  PromptInput: ({ prompt, style, onPromptChange, onStyleChange, styleOptions }: any) => (
    <div data-testid="prompt-input">
      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Enter prompt here..."
      />
      <select value={style} onChange={(e) => onStyleChange(e.target.value)}>
        {styleOptions.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
  ImagePreview: ({ uploadedImage, prompt, style }: any) => (
    <div data-testid="image-preview">
      <img src={uploadedImage} alt="Preview" />
      <p>Prompt: {prompt}</p>
      <p>Style: {style}</p>
    </div>
  ),
  WelcomeSection: ({ onStartGeneration }: any) => (
    <div data-testid="welcome-section">
      <button onClick={onStartGeneration}>Start Generation</button>
    </div>
  ),
  GenerationControls: ({ isGenerating, canGenerate, onGenerate, onAbort, error }: any) => (
    <div data-testid="generation-controls">
      <button
        onClick={onGenerate}
        disabled={!canGenerate || isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate'}
      </button>
      {isGenerating && (
        <button onClick={onAbort}>Abort</button>
      )}
      {error && <div role="alert">{error}</div>}
    </div>
  ),
  MobileMenu: ({ history, onNewChat, onHistoryClick, onDeleteGeneration }: any) => (
    <div data-testid="mobile-menu">
      <button onClick={onNewChat}>Mobile New Generation</button>
      {history.map((gen: any) => (
        <div key={gen.id} onClick={() => onHistoryClick(gen)}>
          {gen.prompt}
        </div>
      ))}
    </div>
  ),
}))

// Mock the API
jest.mock('@/lib/api', () => ({
  generationAPI: {
    generateWithRetry: jest.fn(),
    abort: jest.fn(),
  },
}))

describe('Upload Validation', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Mock URL.createObjectURL
    URL.createObjectURL = jest.fn(() => 'mocked-url')
    // Mock canvas operations - use the setup from jest.setup.js
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      drawImage: jest.fn(),
      toDataURL: jest.fn(() => 'data:image/jpeg;base64,mocked-data'),
    } as any))
  })

  const createMockFile = (name: string, size: number, type: string) => {
    const file = new File(['mock content'], name, { type })
    Object.defineProperty(file, 'size', { value: size })
    return file
  }

  const createMockImage = (width: number, height: number) => {
    const img = new Image()
    Object.defineProperty(img, 'width', { value: width })
    Object.defineProperty(img, 'height', { value: height })
    return img
  }

  describe('File Size Validation', () => {
    it('accepts files under 10MB', async () => {
      render(<AIStudio />)
      
      // Go to workflow
      const startButton = screen.getByText('Start Generation')
      fireEvent.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-upload')).toBeInTheDocument()
      })
      
      // Create a 5MB file (under limit)
      const validFile = createMockFile('test.jpg', 5 * 1024 * 1024, 'image/jpeg')
      
      // Mock successful image loading
      const mockImg = createMockImage(800, 600)
      Object.defineProperty(global, 'Image', {
        value: jest.fn(() => mockImg),
        writable: true,
      })
      
      const fileInput = screen.getByTestId('file-input')
      fireEvent.change(fileInput, { target: { files: [validFile] } })
      
      // Should not show error for valid file
      await waitFor(() => {
        expect(screen.queryByText(/File size must be 10MB or less/)).not.toBeInTheDocument()
      })
    })

    it('rejects files over 10MB', async () => {
      render(<AIStudio />)
      
      // Go to workflow
      const startButton = screen.getByText('Start Generation')
      fireEvent.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-upload')).toBeInTheDocument()
      })
      
      // Create a 15MB file (over limit)
      const invalidFile = createMockFile('large.jpg', 15 * 1024 * 1024, 'image/jpeg')
      
      const fileInput = screen.getByTestId('file-input')
      fireEvent.change(fileInput, { target: { files: [invalidFile] } })
      
      // Should show size error
      await waitFor(() => {
        expect(screen.getByText(/File size must be 10MB or less/)).toBeInTheDocument()
        expect(screen.getByText(/Current size: 15.0MB/)).toBeInTheDocument()
      })
    })
  })

  describe('File Type Validation', () => {
    it('accepts PNG files', async () => {
      render(<AIStudio />)
      
      // Go to workflow
      const startButton = screen.getByText('Start Generation')
      fireEvent.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-upload')).toBeInTheDocument()
      })
      
      const validFile = createMockFile('test.png', 1024 * 1024, 'image/png')
      
      // Mock successful image loading
      const mockImg = createMockImage(800, 600)
      Object.defineProperty(global, 'Image', {
        value: jest.fn(() => mockImg),
        writable: true,
      })
      
      const fileInput = screen.getByTestId('file-input')
      fireEvent.change(fileInput, { target: { files: [validFile] } })
      
      // Should not show type error
      await waitFor(() => {
        expect(screen.queryByText(/Only PNG or JPG images are allowed/)).not.toBeInTheDocument()
      })
    })

    it('accepts JPEG files', async () => {
      render(<AIStudio />)
      
      // Go to workflow
      const startButton = screen.getByText('Start Generation')
      fireEvent.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-upload')).toBeInTheDocument()
      })
      
      const validFile = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg')
      
      // Mock successful image loading
      const mockImg = createMockImage(800, 600)
      Object.defineProperty(global, 'Image', {
        value: jest.fn(() => mockImg),
        writable: true,
      })
      
      const fileInput = screen.getByTestId('file-input')
      fireEvent.change(fileInput, { target: { files: [validFile] } })
      
      // Should not show type error
      await waitFor(() => {
        expect(screen.queryByText(/Only PNG or JPG images are allowed/)).not.toBeInTheDocument()
      })
    })

    it('rejects non-image files', async () => {
      render(<AIStudio />)
      
      // Go to workflow
      const startButton = screen.getByText('Start Generation')
      fireEvent.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-upload')).toBeInTheDocument()
      })
      
      const invalidFile = createMockFile('document.pdf', 1024 * 1024, 'application/pdf')
      
      const fileInput = screen.getByTestId('file-input')
      fireEvent.change(fileInput, { target: { files: [invalidFile] } })
      
      // Should show type error
      await waitFor(() => {
        expect(screen.getByText(/Only PNG or JPG images are allowed/)).toBeInTheDocument()
        expect(screen.getByText(/Received: application\/pdf/)).toBeInTheDocument()
      })
    })

    it('rejects files with unknown MIME type', async () => {
      render(<AIStudio />)
      
      // Go to workflow
      const startButton = screen.getByText('Start Generation')
      fireEvent.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-upload')).toBeInTheDocument()
      })
      
      const invalidFile = createMockFile('unknown.file', 1024 * 1024, '')
      
      const fileInput = screen.getByTestId('file-input')
      fireEvent.change(fileInput, { target: { files: [invalidFile] } })
      
      // Should show type error
      await waitFor(() => {
        expect(screen.getByText(/Only PNG or JPG images are allowed/)).toBeInTheDocument()
        expect(screen.getByText(/Received: unknown type/)).toBeInTheDocument()
      })
    })
  })

  describe('Image Processing Validation', () => {
    it('handles image processing errors gracefully', async () => {
      render(<AIStudio />)
      
      // Go to workflow
      const startButton = screen.getByText('Start Generation')
      fireEvent.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-upload')).toBeInTheDocument()
      })
      
      const validFile = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg')
      
      // Mock image loading failure
      Object.defineProperty(global, 'Image', {
        value: jest.fn(() => {
          const img = new Image()
          // Simulate error
          setTimeout(() => {
            if (img.onerror) img.onerror(new Error('Mock error'))
          }, 0)
          return img
        }),
        writable: true,
      })
      
      const fileInput = screen.getByTestId('file-input')
      fireEvent.change(fileInput, { target: { files: [validFile] } })
      
      // Should show processing error
      await waitFor(() => {
        expect(screen.getByText(/Failed to process image/)).toBeInTheDocument()
      })
    })
  })

  describe('User Experience', () => {
    it('clears previous errors when uploading new file', async () => {
      render(<AIStudio />)
      
      // Go to workflow
      const startButton = screen.getByText('Start Generation')
      fireEvent.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-upload')).toBeInTheDocument()
      })
      
      // First, upload an invalid file to trigger error
      const invalidFile = createMockFile('large.jpg', 15 * 1024 * 1024, 'image/jpeg')
      const fileInput = screen.getByTestId('file-input')
      fireEvent.change(fileInput, { target: { files: [invalidFile] } })
      
      // Should show size error
      await waitFor(() => {
        expect(screen.getByText(/File size must be 10MB or less/)).toBeInTheDocument()
      })
      
      // Now upload a valid file
      const validFile = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg')
      
      // Mock successful image loading
      const mockImg = createMockImage(800, 600)
      Object.defineProperty(global, 'Image', {
        value: jest.fn(() => mockImg),
        writable: true,
      })
      
      fireEvent.change(fileInput, { target: { files: [validFile] } })
      
      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/File size must be 10MB or less/)).not.toBeInTheDocument()
      })
    })
  })
})
