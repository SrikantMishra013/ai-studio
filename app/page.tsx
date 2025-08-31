"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import {
  Sidebar,
  ImageUpload,
  PromptInput,
  ImagePreview,
  WelcomeSection,
  GenerationControls,
  MobileMenu
} from "@/components/ai-studio"
import { Sparkles } from "lucide-react"
import { generationAPI, type GenerationRequest, type GenerationResponse } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Generation {
  id: string
  imageUrl: string
  prompt: string
  style: string
  createdAt: string
}

const STYLE_OPTIONS = [
  { value: "editorial", label: "Editorial" },
  { value: "streetwear", label: "Streetwear" },
  { value: "vintage", label: "Vintage" },
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_DIMENSION = 1920
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg"])

type AppRoute = 'welcome' | 'workflow'

export default function AIStudio() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('welcome')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<Generation[]>([])
  const [retryCount, setRetryCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("ai-studio-history")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to parse history from localStorage:", e)
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("ai-studio-history", JSON.stringify(history))
  }, [history])

  const resizeImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      img.onload = () => {
        let { width, height } = img

        // Calculate new dimensions if image is too large
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }

        canvas.width = width
        canvas.height = height

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL("image/jpeg", 0.9))
        } else {
          reject(new Error("Failed to get canvas context"))
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }, [])

  const handleFileUpload = useCallback(
    async (file: File) => {
      // Size validation (<= 10MB)
      if (file.size > MAX_FILE_SIZE) {
        setError("File size must be 10MB or less")
        return
      }

      // Type validation (PNG or JPG only)
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        setError("Only PNG or JPG images are allowed (max 10MB)")
        return
      }

      try {
        setError(null)
        const resizedDataUrl = await resizeImage(file)
        setUploadedImage(resizedDataUrl)
      } catch (err) {
        setError("Failed to process image")
      }
    },
    [resizeImage],
  )



  const handleGenerate = useCallback(async () => {
    if (!uploadedImage || !prompt || !style) {
      setError("Please upload an image, enter a prompt, and select a style")
      return
    }

    setIsGenerating(true)
    setError(null)
    setRetryCount(0)

      try {
      const response = await generationAPI.generateWithRetry(
          { imageDataUrl: uploadedImage, prompt, style },
        3,
        (attempt, errorMessage) => {
          setRetryCount(attempt)
          setError(`${errorMessage} - Retrying... (${attempt}/3)`)
        }
        )

        // Add to history (keep only last 5)
        setHistory((prev) => {
          const newHistory = [response, ...prev].slice(0, 5)
          return newHistory
        })

        setIsGenerating(false)
        setRetryCount(0)
      setError(null)
      } catch (err) {
        if (err instanceof Error && err.message === "Request aborted") {
          setIsGenerating(false)
        setError(null)
          return
        }

          setError(err instanceof Error ? err.message : "Generation failed")
          setIsGenerating(false)
          setRetryCount(0)
        }
  }, [uploadedImage, prompt, style])

  const handleAbort = useCallback(() => {
    generationAPI.abort()
      setIsGenerating(false)
      setRetryCount(0)
    setError(null)
  }, [])

  const handlePromptChange = useCallback((value: string) => {
    setPrompt(value)
  }, [])

  const handleStyleChange = useCallback((value: string) => {
    setStyle(value)
  }, [])

  const handleHistoryClick = useCallback((generation: Generation) => {
    setUploadedImage(generation.imageUrl)
    setPrompt(generation.prompt)
    setStyle(generation.style)
    setCurrentRoute('workflow')
  }, [])

  const handleDeleteGeneration = useCallback((generationId: string) => {
    const deletedGeneration = history.find(gen => gen.id === generationId)
    
    // Check if the deleted generation is currently displayed in the main workflow
    if (deletedGeneration && uploadedImage === deletedGeneration.imageUrl) {
      // Clear the main workflow since the image was deleted
      setUploadedImage(null)
      setPrompt("")
      setStyle("")
      setError(null)
      // Redirect back to welcome screen
      setCurrentRoute('welcome')
      
      toast({
        title: "Workflow Cleared",
        description: "This generation was currently displayed and has been removed. The workflow has been cleared.",
        variant: "destructive",
      })
    }
    
    // Remove from history
    setHistory((prev) => prev.filter((gen) => gen.id !== generationId))
    
    // Only show the success toast if we didn't already show the workflow cleared toast
    if (!deletedGeneration || uploadedImage !== deletedGeneration.imageUrl) {
      toast({
        title: "Generation Deleted",
        description: deletedGeneration ? `"${deletedGeneration.prompt.substring(0, 50)}..." has been removed from history.`:"",
        variant: "default",
      })
    }
  }, [history, uploadedImage, toast])

  const handleNewChat = useCallback(() => {
    setUploadedImage(null)
    setPrompt("")
    setStyle("")
    setError(null)
    setCurrentRoute('workflow')
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const handleStartGeneration = useCallback(() => {
    setCurrentRoute('workflow')
  }, [])

  const handleBackToWelcome = useCallback(() => {
    setCurrentRoute('welcome')
    setUploadedImage(null)
    setPrompt("")
    setStyle("")
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const removeImage = useCallback(() => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const canGenerate = Boolean(uploadedImage && prompt && style)

  // Focus management for accessibility
  useEffect(() => {
    if (currentRoute === 'workflow') {
      // Focus the main content area when switching to workflow
      const mainContent = document.getElementById('main-content')
      if (mainContent) {
        mainContent.focus()
      }
    }
  }, [currentRoute])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return
      }

      // Ctrl/Cmd + N: New generation
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleNewChat()
      }

      // Ctrl/Cmd + Enter: Generate (when in workflow)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && currentRoute === 'workflow') {
        e.preventDefault()
        if (canGenerate && !isGenerating) {
          handleGenerate()
        }
      }

      // Escape: Back to welcome or abort generation
      if (e.key === 'Escape') {
        if (isGenerating) {
          handleAbort()
        } else if (currentRoute === 'workflow') {
          handleBackToWelcome()
        }
      }

      // Ctrl/Cmd + K: Focus prompt input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && currentRoute === 'workflow') {
        e.preventDefault()
        const promptInput = document.getElementById('prompt')
        if (promptInput) {
          promptInput.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentRoute, canGenerate, isGenerating, handleNewChat, handleGenerate, handleAbort, handleBackToWelcome])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex" role="application" aria-label="AI Studio - Transform your images with AI">
      
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block" role="complementary" aria-label="Generation history and navigation">
        <Sidebar
          history={history}
          onNewChat={handleNewChat}
          onHistoryClick={handleHistoryClick}
          onDeleteGeneration={handleDeleteGeneration}
          styleOptions={STYLE_OPTIONS}
        />
      </aside>

      {/* Main Content */}
      <main id="main-content" className="flex-1 flex flex-col" role="main" aria-label="Main content area">
        {/* Mobile Header */}
        <header className="md:hidden p-4 border-b border-border/50 bg-card/20" role="banner">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            AI Studio
          </h1>
            <MobileMenu
              history={history}
              onNewChat={handleNewChat}
              onHistoryClick={handleHistoryClick}
              onDeleteGeneration={handleDeleteGeneration}
              styleOptions={STYLE_OPTIONS}
            />
        </div>
        </header>

        <div className="flex-1 p-3 md:p-4 overflow-hidden">
          <div className="max-w-5xl mx-auto h-full space-y-4 md:space-y-5">
                        {/* Route-based content rendering */}
            {currentRoute === 'welcome' ? (
              <section className="animate-fade-in-up h-full flex items-center justify-center" aria-label="Welcome section">
                <WelcomeSection onStartGeneration={handleStartGeneration} />
              </section>
            ) : (
              <section 
                className="animate-fade-in-up h-full" 
                aria-label="Image generation workflow"
                tabIndex={-1}
              >
                <div className="flex flex-col min-h-0 gap-3">
                  {/* Preview Section - grows */}
                  <div className="flex-1 min-h-0 overflow-auto rounded-xl" role="region" aria-label="Image preview">
                    {uploadedImage && (
                      <ImagePreview
                        uploadedImage={uploadedImage}
                        prompt={prompt}
                        style={style}
                        styleOptions={STYLE_OPTIONS}
                      />
                    )}
                  </div>

                  {/* File Upload */}
                  <div className="shrink-0" role="region" aria-label="Image upload section">
                    <ImageUpload
                      uploadedImage={uploadedImage}
                      onFileUpload={handleFileUpload}
                      onRemoveImage={removeImage}
                      onBackToWelcome={handleBackToWelcome}
                      fileInputRef={fileInputRef}
                    />
      </div>

                  {/* Prompt Input */}
                  <div className="flex-1 min-h-0 overflow-auto rounded-xl scrollbar-neon" role="region" aria-label="Prompt and style input">
                    <PromptInput
                      prompt={prompt}
                      style={style}
                      onPromptChange={handlePromptChange}
                      onStyleChange={handleStyleChange}
                      styleOptions={STYLE_OPTIONS}
                    />
                  </div>

                  {/* Generation Controls */}
                  <div className="shrink-0" role="region" aria-label="Generation controls">
                    <GenerationControls
                      isGenerating={isGenerating}
                      retryCount={retryCount}
                      error={error}
                      canGenerate={canGenerate}
                      onGenerate={handleGenerate}
                      onAbort={handleAbort}
                    />
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Keyboard shortcuts help - screen reader only */}
        <div className="sr-only" aria-live="polite">
          <p>Keyboard shortcuts available: Ctrl+N for new generation, Ctrl+Enter to generate, Escape to go back or abort, Ctrl+K to focus prompt input</p>
      </div>
      </main>
    </div>
  )
}
