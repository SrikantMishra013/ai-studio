export interface GenerationRequest {
  imageDataUrl: string
  prompt: string
  style: string
}

export interface GenerationResponse {
  id: string
  imageUrl: string
  prompt: string
  style: string
  createdAt: string
}

export class GenerationAPI {
  private static instance: GenerationAPI
  private abortController: AbortController | null = null

  static getInstance(): GenerationAPI {
    if (!GenerationAPI.instance) {
      GenerationAPI.instance = new GenerationAPI()
    }
    return GenerationAPI.instance
  }

  async generateImage(
    request: GenerationRequest,
    signal: AbortSignal
  ): Promise<GenerationResponse> {
    // Simulate API delay between 1-2 seconds
    const delay = Math.random() * 1000 + 1000
    await new Promise((resolve) => setTimeout(resolve, delay))

    if (signal.aborted) {
      throw new Error("Request aborted")
    }

    // 20% chance of error
    if (Math.random() < 0.2) {
      throw new Error("Model overloaded")
    }

    // Simulate network errors occasionally
    if (Math.random() < 0.1) {
      throw new Error("Network error")
    }

    // Mock successful response with the actual uploaded image
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    
    return {
      id: `gen_${timestamp}_${randomId}`,
      imageUrl: request.imageDataUrl, // Use the actual uploaded image
      prompt: request.prompt,
      style: request.style,
      createdAt: new Date().toISOString(),
    }
  }

  async generateWithRetry(
    request: GenerationRequest,
    maxRetries: number = 3,
    onRetry?: (attempt: number, error: string) => void
  ): Promise<GenerationResponse> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.abortController = new AbortController()
        const response = await this.generateImage(request, this.abortController.signal)
        this.abortController = null
        return response
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error")
        
        if (lastError.message === "Request aborted") {
          throw lastError
        }

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000
          
          if (onRetry) {
            onRetry(attempt, lastError.message)
          }

          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw new Error(`Failed after ${maxRetries} attempts: ${lastError!.message}`)
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }
}

export const generationAPI = GenerationAPI.getInstance()
