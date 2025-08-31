import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, Palette, MessageSquare } from "lucide-react"

interface ImagePreviewProps {
  uploadedImage: string
  prompt: string
  style: string
  styleOptions: Array<{ value: string; label: string }>
}

export function ImagePreview({ uploadedImage, prompt, style, styleOptions }: ImagePreviewProps) {
  return (
    <Card className="py-4 border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
            <Eye className="h-4 w-4 text-primary" />
          </div>
          Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="space-y-3">
            <div className="relative group">
              <img
                src={uploadedImage}
                alt="Current image preview"
                className="w-64 h-64 object-contain rounded-md transition-all duration-300"
              />
              {/* <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0  transition-opacity duration-300 rounded-lg" /> */}
            </div>
          </div>
          
          <div className="space-y-4 max-w-xl">
            {prompt && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-3 w-3 text-accent" />
                  Your Vision
                </Label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30 overflow-y-auto max-h-30 ">
                  <p className="text-xs text-foreground leading-relaxed">{prompt}</p>
                </div>
              </div>
            )}
            
            {style && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-3 w-3 text-accent" />
                  Selected Style
                </Label>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className="px-2 py-1 text-xs bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30"
                  >
                    {styleOptions.find((s) => s.value === style)?.label}
                  </Badge>
                </div>
              </div>
            )}
            
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-lg bg-primary/20">
                  <MessageSquare className="h-3 w-3 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground">Ready to Generate</p>
                  <p className="text-xs text-muted-foreground">
                    Your image and prompt are ready. Click generate to create your AI masterpiece.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
