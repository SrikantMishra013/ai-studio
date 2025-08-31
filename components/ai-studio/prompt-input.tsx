import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Palette, Lightbulb } from "lucide-react"

interface PromptInputProps {
  prompt: string
  style: string
  onPromptChange: (value: string) => void
  onStyleChange: (value: string) => void
  styleOptions: Array<{ value: string; label: string }>
}

export const PromptInput = React.memo(function PromptInput({ prompt, style, onPromptChange, onStyleChange, styleOptions }: PromptInputProps) {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm" role="region" aria-labelledby="prompt-title">
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-accent" aria-hidden="true" />
            Describe your vision
          </Label>
          <div className="border border-border/50 rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all duration-200 prompt-input-container">
            <Textarea
              id="prompt"
              placeholder="Enter your creative prompt..."
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              className="min-h-[40px] resize-none text-sm border-none select-auto overflow-y-auto max-h-40 focus:outline-none focus:ring-0 focus:border-none focus:shadow-none focus:border-transparent"
              aria-describedby="prompt-help"
              aria-label="Enter your creative prompt describing what you want to generate"
              autoComplete="off"
              spellCheck="false"
            />
            <div className="border-t border-border/50">
              <Select value={style} onValueChange={onStyleChange}>
                <SelectTrigger
                  id="style"
                  aria-label="Select generation style"
                  className="border-0 focus:border-0 focus:ring-0 focus:outline-none transition-all duration-200 rounded-b-lg h-10 px-4 bg-transparent hover:bg-muted/30"
                >
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Palette className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Lightbulb className="h-3 w-3 mt-0.5 text-accent/70" aria-hidden="true" />
            <p id="prompt-help">
              Be specific and descriptive for best results. Include details about mood, lighting, composition, and artistic style.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
