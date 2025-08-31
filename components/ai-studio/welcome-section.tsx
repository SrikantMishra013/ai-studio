import React from "react"
import { Sparkles, ImageIcon, Palette, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WelcomeSectionProps {
  onStartGeneration: () => void
}

export const WelcomeSection = React.memo(function WelcomeSection({ onStartGeneration }: WelcomeSectionProps) {
  return (
    <div className="text-center space-y-6 py-8" role="region" aria-labelledby="welcome-title">
      <div className="space-y-4">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/20 flex items-center justify-center" aria-hidden="true">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        
        <div className="space-y-3">
          <h1 id="welcome-title" className="text-3xl md:text-4xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Transform your images with AI
          </h1>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
            Upload an image, describe your vision, and let AI create something amazing
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto" role="list" aria-label="How it works">
        <div className="space-y-2 p-4 rounded-2xl bg-gradient-to-br from-card/50 to-card/30 border border-border/30" role="listitem">
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center" aria-hidden="true">
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">Upload Image</h3>
          <p className="text-xs text-muted-foreground">
            Drag & drop or browse to upload your image
          </p>
        </div>

        <div className="space-y-2 p-4 rounded-2xl bg-gradient-to-br from-card/50 to-card/30 border border-border/30" role="listitem">
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center" aria-hidden="true">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">Describe Vision</h3>
          <p className="text-xs text-muted-foreground">
            Write a detailed prompt of what you want to create
          </p>
        </div>

        <div className="space-y-2 p-4 rounded-2xl bg-gradient-to-br from-card/50 to-card/30 border border-border/30" role="listitem">
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center" aria-hidden="true">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">Generate Magic</h3>
          <p className="text-xs text-muted-foreground">
            Watch AI transform your image into art
          </p>
        </div>
      </div>

      <div className="pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20" aria-label="AI technology information">
          <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">
            Powered by advanced AI models
          </span>
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={onStartGeneration}
          className="h-12 px-6 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl btn-enhanced focus-visible:scale-105"
          size="lg"
          aria-describedby="start-generation-help"
        >
          <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
          Start Generation
        </Button>
        <p id="start-generation-help" className="sr-only">
          Click to begin the image generation process. You can also use Ctrl+N as a keyboard shortcut.
        </p>
      </div>
    </div>
  )
})
