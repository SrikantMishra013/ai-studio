import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIStudio from '@/app/page'

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

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe('AIStudio', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  it('renders welcome section by default', () => {
    render(<AIStudio />)
    
    expect(screen.getByTestId('welcome-section')).toBeInTheDocument()
    expect(screen.queryByTestId('image-upload')).not.toBeInTheDocument()
  })

  it('switches to workflow when Start Generation is clicked', async () => {
    render(<AIStudio />)
    
    const startButton = screen.getByText('Start Generation')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('image-upload')).toBeInTheDocument()
      expect(screen.queryByTestId('welcome-section')).not.toBeInTheDocument()
    })
  })

  it('switches back to welcome when Back button is clicked', async () => {
    render(<AIStudio />)
    
    // First go to workflow
    const startButton = screen.getByText('Start Generation')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('image-upload')).toBeInTheDocument()
    })
    
    // Then go back
    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('welcome-section')).toBeInTheDocument()
      expect(screen.queryByTestId('image-upload')).not.toBeInTheDocument()
    })
  })

  it('handles file upload correctly', async () => {
    render(<AIStudio />)
    
    // Go to workflow
    const startButton = screen.getByText('Start Generation')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('image-upload')).toBeInTheDocument()
    })
    
    // Upload a file
    const fileInput = screen.getByTestId('image-upload').querySelector('input[type="file"]')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    fireEvent.change(fileInput!, { target: { files: [file] } })
    
    // Wait for image processing
    await waitFor(() => {
      expect(screen.getByTestId('image-preview')).toBeInTheDocument()
    })
  })

  it('handles prompt input correctly', async () => {
    render(<AIStudio />)
    
    // Go to workflow
    const startButton = screen.getByText('Start Generation')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('prompt-input')).toBeInTheDocument()
    })
    
    // Enter prompt
    const textarea = screen.getByPlaceholderText('Enter prompt here...')
    fireEvent.change(textarea, { target: { value: 'A beautiful sunset' } })
    
    expect(textarea).toHaveValue('A beautiful sunset')
  })

  it('handles style selection correctly', async () => {
    render(<AIStudio />)
    
    // Go to workflow
    const startButton = screen.getByText('Start Generation')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('prompt-input')).toBeInTheDocument()
    })
    
    // Select style
    const select = screen.getByTestId('prompt-input').querySelector('select')
    fireEvent.change(select!, { target: { value: 'editorial' } })
    
    expect(select).toHaveValue('editorial')
  })

  it('enables generate button when all required fields are filled', async () => {
    render(<AIStudio />)
    
    // Go to workflow
    const startButton = screen.getByText('Start Generation')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('image-upload')).toBeInTheDocument()
    })
    
    // Upload image
    const fileInput = screen.getByTestId('image-upload').querySelector('input[type="file"]')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput!, { target: { files: [file] } })
    
    // Enter prompt
    const textarea = screen.getByPlaceholderText('Enter prompt here...')
    fireEvent.change(textarea, { target: { value: 'A beautiful sunset' } })
    
    // Select style
    const select = screen.getByTestId('prompt-input').querySelector('select')
    fireEvent.change(select!, { target: { value: 'editorial' } })
    
    await waitFor(() => {
      const generateButton = screen.getByText('Generate')
      expect(generateButton).not.toBeDisabled()
    })
  })

  it('handles new chat correctly', async () => {
    render(<AIStudio />)
    
    // Go to workflow first
    const startButton = screen.getByText('Start Generation')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('image-upload')).toBeInTheDocument()
    })
    
    // Click new chat from sidebar
    const newChatButton = screen.getByText('New Generation')
    fireEvent.click(newChatButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('image-upload')).toBeInTheDocument()
      // Should be in workflow mode but with cleared state
    })
  })

  it('loads history from localStorage on mount', () => {
    const mockHistory = [
      {
        id: '1',
        imageUrl: 'data:image/jpeg;base64,test1',
        prompt: 'Test prompt 1',
        style: 'editorial',
        createdAt: new Date().toISOString(),
      },
    ]
    
    localStorage.setItem('ai-studio-history', JSON.stringify(mockHistory))
    
    render(<AIStudio />)
    
    // Check that history is loaded in sidebar
    expect(screen.getByText('Test prompt 1')).toBeInTheDocument()
  })

  it('saves history to localStorage when updated', async () => {
    const setItemSpy = jest.spyOn(localStorage, 'setItem')
    
    render(<AIStudio />)
    
    // Go to workflow
    const startButton = screen.getByText('Start Generation')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('image-upload')).toBeInTheDocument()
    })
    
    // Upload image and fill form
    const fileInput = screen.getByTestId('image-upload').querySelector('input[type="file"]')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput!, { target: { files: [file] } })
    
    const textarea = screen.getByPlaceholderText('Enter prompt here...')
    fireEvent.change(textarea, { target: { value: 'A beautiful sunset' } })
    
    const select = screen.getByTestId('prompt-input').querySelector('select')
    fireEvent.change(select!, { target: { value: 'editorial' } })
    
    // Generate (this would normally add to history)
    await waitFor(() => {
      const generateButton = screen.getByText('Generate')
      expect(generateButton).not.toBeDisabled()
    })
    
    // Check that localStorage was called
    expect(setItemSpy).toHaveBeenCalled()
  })

  it('handles keyboard shortcuts correctly', async () => {
    render(<AIStudio />)
    
    // Test Ctrl+N for new generation
    fireEvent.keyDown(document, { key: 'n', ctrlKey: true })
    
    await waitFor(() => {
      expect(screen.getByTestId('image-upload')).toBeInTheDocument()
    })
    
    // Test Escape to go back
    fireEvent.keyDown(document, { key: 'Escape' })
    
    await waitFor(() => {
      expect(screen.getByTestId('welcome-section')).toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes', () => {
    render(<AIStudio />)
    
    // Check for proper ARIA labels
    expect(screen.getByRole('application')).toHaveAttribute('aria-label', 'AI Studio - Transform your images with AI')
    expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Main content area')
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    
    // Check for proper button accessibility
    const startButton = screen.getByRole('button', { name: /start generation/i })
    expect(startButton).toBeInTheDocument()
  })

  it('handles image removal correctly', async () => {
    render(<AIStudio />)
    
    // Go to workflow
    const startButton = screen.getByText('Start Generation')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('image-upload')).toBeInTheDocument()
    })
    
    // Upload image
    const fileInput = screen.getByTestId('image-upload').querySelector('input[type="file"]')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput!, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByTestId('image-preview')).toBeInTheDocument()
    })
    
    // Remove image
    const removeButton = screen.getByText('Remove Image')
    fireEvent.click(removeButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument()
    })
  })
})
