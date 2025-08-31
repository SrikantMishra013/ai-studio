import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { WelcomeSection } from '@/components/ai-studio/welcome-section'

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

describe('WelcomeSection', () => {
  const mockOnStartGeneration = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<WelcomeSection onStartGeneration={mockOnStartGeneration} />)
    
    expect(screen.getByText('Transform your images with AI')).toBeInTheDocument()
    expect(screen.getByText('Start Generation')).toBeInTheDocument()
  })

  it('displays all feature cards', () => {
    render(<WelcomeSection onStartGeneration={mockOnStartGeneration} />)
    
    expect(screen.getByText('Upload Image')).toBeInTheDocument()
    expect(screen.getByText('Describe Vision')).toBeInTheDocument()
    expect(screen.getByText('Generate Magic')).toBeInTheDocument()
  })

  it('calls onStartGeneration when Start Generation button is clicked', () => {
    render(<WelcomeSection onStartGeneration={mockOnStartGeneration} />)
    
    const startButton = screen.getByText('Start Generation')
    fireEvent.click(startButton)
    
    expect(mockOnStartGeneration).toHaveBeenCalledTimes(1)
  })

  it('calls onStartGeneration when Start Generation button is pressed with Enter', () => {
    render(<WelcomeSection onStartGeneration={mockOnStartGeneration} />)
    
    const startButton = screen.getByText('Start Generation')
    fireEvent.keyDown(startButton, { key: 'Enter', code: 'Enter' })
    
    expect(mockOnStartGeneration).toHaveBeenCalledTimes(1)
  })

  it('calls onStartGeneration when Start Generation button is pressed with Space', () => {
    render(<WelcomeSection onStartGeneration={mockOnStartGeneration} />)
    
    const startButton = screen.getByText('Start Generation')
    fireEvent.keyDown(startButton, { key: ' ', code: 'Space' })
    
    expect(mockOnStartGeneration).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    render(<WelcomeSection onStartGeneration={mockOnStartGeneration} />)
    
    // Check for proper ARIA labels
    expect(screen.getByRole('region')).toHaveAttribute('aria-labelledby', 'welcome-title')
    expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'How it works')
    
    // Check for list items
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('displays AI technology information', () => {
    render(<WelcomeSection onStartGeneration={mockOnStartGeneration} />)
    
    expect(screen.getByText('Powered by advanced AI models')).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<WelcomeSection onStartGeneration={mockOnStartGeneration} />)
    
    // Check that decorative icons are properly marked
    const icons = screen.getAllByRole('img', { hidden: true })
    expect(icons.length).toBeGreaterThan(0)
    
    // Check for proper button accessibility
    const startButton = screen.getByRole('button', { name: /start generation/i })
    expect(startButton).toHaveAttribute('aria-describedby', 'start-generation-help')
  })

  it('displays help text for screen readers', () => {
    render(<WelcomeSection onStartGeneration={mockOnStartGeneration} />)
    
    const helpText = screen.getByText(/Click to begin the image generation process/)
    expect(helpText).toBeInTheDocument()
    expect(helpText).toHaveClass('sr-only')
  })

  it('renders with proper styling classes', () => {
    render(<WelcomeSection onStartGeneration={mockOnStartGeneration} />)
    
    const startButton = screen.getByText('Start Generation')
    expect(startButton).toHaveClass('btn-enhanced')
    expect(startButton).toHaveClass('focus-visible:scale-105')
  })

  it('handles multiple rapid clicks gracefully', () => {
    render(<WelcomeSection onStartGeneration={mockOnStartGeneration} />)
    
    const startButton = screen.getByText('Start Generation')
    
    // Click multiple times rapidly
    fireEvent.click(startButton)
    fireEvent.click(startButton)
    fireEvent.click(startButton)
    
    // Should only call once per click
    expect(mockOnStartGeneration).toHaveBeenCalledTimes(3)
  })
})
