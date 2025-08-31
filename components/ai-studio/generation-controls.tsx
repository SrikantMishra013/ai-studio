import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sparkles, X, AlertCircle } from "lucide-react"

interface GenerationControlsProps {
  isGenerating: boolean
  retryCount: number
  error: string | null
  canGenerate: boolean
  onGenerate: () => void
  onAbort: () => void
}

export function GenerationControls({ 
  isGenerating, 
  retryCount, 
  error, 
  canGenerate, 
  onGenerate, 
  onAbort 
}: GenerationControlsProps) {
  return (
    <div className="space-y-4" role="region" aria-label="Generation controls">
      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 py-3" role="alert" aria-live="assertive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription className="text-destructive-foreground text-sm">
            {error}
            {retryCount > 0 && (
              <span className="block mt-1 text-xs opacity-80">
                Retry attempt {retryCount} of 3
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Generation Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed btn-enhanced focus-visible:scale-105"
          size="lg"
          aria-describedby={canGenerate ? "generate-help" : "generate-disabled-help"}
          aria-label={isGenerating ? "Generating image..." : "Generate image from uploaded image and prompt"}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Generating...</span>
              {retryCount > 0 && (
                <span className="ml-2 text-sm opacity-80">
                  (Retry {retryCount}/3)
                </span>
              )}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Generate</span>
            </>
          )}
        </Button>

        {isGenerating && (
          <Button 
            variant="outline" 
            onClick={onAbort} 
            size="lg"
            className="h-12 px-6 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-200 rounded-lg btn-enhanced focus-visible:scale-105"
            aria-label="Abort generation process"
            aria-describedby="abort-help"
          >
            <X className="mr-2 h-4 w-4" aria-hidden="true" />
            Abort
          </Button>
        )}
      </div>

      {/* Help text for screen readers */}
      <div className="sr-only">
        <p id="generate-help">
          Click to generate an image based on your uploaded image and prompt. You can also use Ctrl+Enter as a keyboard shortcut.
        </p>
        <p id="generate-disabled-help">
          Please upload an image, enter a prompt, and select a style to enable generation.
        </p>
        <p id="abort-help">
          Click to stop the current generation process.
        </p>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20" role="status" aria-live="polite">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
            <span>AI is working its magic...</span>
          </div>
          {retryCount > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground/70">
                Attempt {retryCount} of 3 - Please wait
              </p>
              <div className="flex justify-center">
                <div className="flex gap-1" role="progressbar" aria-label={`Retry attempt ${retryCount} of 3`} aria-valuenow={retryCount} aria-valuemin={1} aria-valuemax={3}>
                  {[1, 2, 3].map((attempt) => (
                    <div
                      key={attempt}
                      className={`w-2 h-2 rounded-full ${
                        attempt <= retryCount 
                          ? 'bg-primary' 
                          : 'bg-muted-foreground/30'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
