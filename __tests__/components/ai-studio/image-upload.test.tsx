import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageUpload } from '@/components/ai-studio/image-upload'

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

describe('ImageUpload', () => {
  const mockOnFileUpload = jest.fn()
  const mockOnRemoveImage = jest.fn()
  const mockOnBackToWelcome = jest.fn()
  const mockFileInputRef = { current: null }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock file input click
    mockFileInputRef.current = {
      click: jest.fn(),
    } as any
  })

  it('renders without crashing', () => {
    render(
      <ImageUpload
        uploadedImage={null}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    expect(screen.getByText('Upload Image')).toBeInTheDocument()
    expect(screen.getByText('Drop your image here or click to browse')).toBeInTheDocument()
  })

  it('displays upload instructions', () => {
    render(
      <ImageUpload
        uploadedImage={null}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    expect(screen.getByText('PNG or JPG up to 10MB')).toBeInTheDocument()
  })

  it('calls file input click when upload area is clicked', () => {
    render(
      <ImageUpload
        uploadedImage={null}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    const uploadArea = screen.getByRole('button', { name: /upload image file/i })
    fireEvent.click(uploadArea)
    
    expect(mockFileInputRef.current?.click).toHaveBeenCalledTimes(1)
  })

  it('calls file input click when Enter is pressed on upload area', () => {
    render(
      <ImageUpload
        uploadedImage={null}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    const uploadArea = screen.getByRole('button', { name: /upload image file/i })
    fireEvent.keyDown(uploadArea, { key: 'Enter', code: 'Enter' })
    
    expect(mockFileInputRef.current?.click).toHaveBeenCalledTimes(1)
  })

  it('calls file input click when Space is pressed on upload area', () => {
    render(
      <ImageUpload
        uploadedImage={null}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    const uploadArea = screen.getByRole('button', { name: /upload image file/i })
    fireEvent.keyDown(uploadArea, { key: ' ', code: 'Space' })
    
    expect(mockFileInputRef.current?.click).toHaveBeenCalledTimes(1)
  })

  it('displays uploaded image when image is provided', () => {
    const mockImageUrl = 'data:image/jpeg;base64,mocked-image'
    render(
      <ImageUpload
        uploadedImage={mockImageUrl}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    const image = screen.getByAltText('Uploaded preview')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockImageUrl)
  })

  it('shows remove button when image is uploaded', () => {
    const mockImageUrl = 'data:image/jpeg;base64,mocked-image'
    render(
      <ImageUpload
        uploadedImage={mockImageUrl}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    const removeButton = screen.getByRole('button', { name: /remove uploaded image/i })
    expect(removeButton).toBeInTheDocument()
  })

  it('calls onRemoveImage when remove button is clicked', () => {
    const mockImageUrl = 'data:image/jpeg;base64,mocked-image'
    render(
      <ImageUpload
        uploadedImage={mockImageUrl}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    const removeButton = screen.getByRole('button', { name: /remove uploaded image/i })
    fireEvent.click(removeButton)
    
    expect(mockOnRemoveImage).toHaveBeenCalledTimes(1)
  })

  it('calls onRemoveImage when remove button is pressed with Enter', () => {
    const mockImageUrl = 'data:image/jpeg;base64,mocked-image'
    render(
      <ImageUpload
        uploadedImage={mockImageUrl}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    const removeButton = screen.getByRole('button', { name: /remove uploaded image/i })
    fireEvent.keyDown(removeButton, { key: 'Enter', code: 'Enter' })
    
    expect(mockOnRemoveImage).toHaveBeenCalledTimes(1)
  })

  it('calls onRemoveImage when remove button is pressed with Space', () => {
    const mockImageUrl = 'data:image/jpeg;base64,mocked-image'
    render(
      <ImageUpload
        uploadedImage={mockImageUrl}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    const removeButton = screen.getByRole('button', { name: /remove uploaded image/i })
    fireEvent.keyDown(removeButton, { key: ' ', code: 'Space' })
    
    expect(mockOnRemoveImage).toHaveBeenCalledTimes(1)
  })

  it('calls onBackToWelcome when back button is clicked', () => {
    render(
      <ImageUpload
        uploadedImage={null}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    const backButton = screen.getByRole('button', { name: /go back to welcome screen/i })
    fireEvent.click(backButton)
    
    expect(mockOnBackToWelcome).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    render(
      <ImageUpload
        uploadedImage={null}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    // Check for proper ARIA labels
    expect(screen.getByRole('region')).toHaveAttribute('aria-labelledby', 'upload-title')
    expect(screen.getByRole('button', { name: /upload image file/i })).toHaveAttribute('aria-describedby', 'upload-instructions')
    
    // Check for proper button accessibility
    const uploadArea = screen.getByRole('button', { name: /upload image file/i })
    expect(uploadArea).toHaveAttribute('tabIndex', '0')
  })

  it('handles drag and drop events', () => {
    render(
      <ImageUpload
        uploadedImage={null}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    const uploadArea = screen.getByRole('button', { name: /upload image file/i })
    
    // Test drag over
    fireEvent.dragOver(uploadArea)
    
    // Test drop with mock file
    const mockFile = new File(['mock content'], 'test.jpg', { type: 'image/jpeg' })
    const dropEvent = new Event('drop', { bubbles: true })
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        files: [mockFile],
      },
    })
    
    fireEvent(uploadArea, dropEvent)
    
    expect(mockOnFileUpload).toHaveBeenCalledWith(mockFile)
  })

  it('prevents default on drag over', () => {
    render(
      <ImageUpload
        uploadedImage={null}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    const uploadArea = screen.getByRole('button', { name: /upload image file/i })
    
    const dragOverEvent = new Event('dragover', { bubbles: true })
    const preventDefaultSpy = jest.spyOn(dragOverEvent, 'preventDefault')
    
    fireEvent(uploadArea, dragOverEvent)
    
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('renders with proper styling classes', () => {
    render(
      <ImageUpload
        uploadedImage={null}
        onFileUpload={mockOnFileUpload}
        onRemoveImage={mockOnRemoveImage}
        onBackToWelcome={mockOnBackToWelcome}
        fileInputRef={mockFileInputRef}
      />
    )
    
    const uploadArea = screen.getByRole('button', { name: /upload image file/i })
    expect(uploadArea).toHaveClass('focus-visible:border-primary/50')
    expect(uploadArea).toHaveClass('focus-visible:ring-2')
  })
})
