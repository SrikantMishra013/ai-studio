import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

// Mock canvas and Image to avoid JSDOM issues
const mockCanvas = {
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
  })),
  toDataURL: jest.fn(() => 'data:image/jpeg;base64,mocked-data'),
  width: 800,
  height: 600,
}

const mockImage = {
  width: 800,
  height: 600,
  onload: null as any,
  onerror: null as any,
  src: '',
}

describe('Upload Validation - Simple Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    
    // Mock canvas
    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCanvas.getContext())
    HTMLCanvasElement.prototype.toDataURL = jest.fn(() => mockCanvas.toDataURL())
    
    // Mock Image constructor
    global.Image = jest.fn(() => {
      const img = { ...mockImage }
      // Simulate successful load
      setTimeout(() => {
        if (img.onload) img.onload()
      }, 0)
      return img as any
    }) as any
    
    // Mock URL.createObjectURL
    URL.createObjectURL = jest.fn(() => 'mocked-url')
  })

  const createMockFile = (name: string, size: number, type: string) => {
    const file = new File(['mock content'], name, { type })
    Object.defineProperty(file, 'size', { value: size })
    return file
  }

  describe('File Size Validation', () => {
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
      })
    })

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
      
      const fileInput = screen.getByTestId('file-input')
      fireEvent.change(fileInput, { target: { files: [validFile] } })
      
      // Should not show size error
      await waitFor(() => {
        expect(screen.queryByText(/File size must be 10MB or less/)).not.toBeInTheDocument()
      })
    })
  })

  describe('File Type Validation', () => {
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
      })
    })

    it('accepts PNG files', async () => {
      render(<AIStudio />)
      
      // Go to workflow
      const startButton = screen.getByText('Start Generation')
      fireEvent.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-upload')).toBeInTheDocument()
      })
      
      const validFile = createMockFile('test.png', 1024 * 1024, 'image/png')
      
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
      
      const fileInput = screen.getByTestId('file-input')
      fireEvent.change(fileInput, { target: { files: [validFile] } })
      
      // Should not show type error
      await waitFor(() => {
        expect(screen.queryByText(/Only PNG or JPG images are allowed/)).not.toBeInTheDocument()
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
      fireEvent.change(fileInput, { target: { files: [validFile] } })
      
      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/File size must be 10MB or less/)).not.toBeInTheDocument()
      })
    })
  })
})
