import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, ImageIcon, Sparkles, ArrowLeft } from "lucide-react"

interface ImageUploadProps {
  uploadedImage: string | null
  onFileUpload: (file: File) => void
  onRemoveImage: () => void
  onBackToWelcome: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

export const ImageUpload = React.memo(function ImageUpload({ uploadedImage, onFileUpload, onRemoveImage, onBackToWelcome, fileInputRef }: ImageUploadProps) {
  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFileUpload(files[0])
    }
  }, [onFileUpload])

  const handleFileInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileUpload(files[0])
    }
  }, [onFileUpload])

  const handleUploadAreaClick = React.useCallback(() => {
    fileInputRef.current?.click()
  }, [fileInputRef])

  const handleUploadAreaKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleUploadAreaClick()
    }
  }, [handleUploadAreaClick])

  return (
    <Card className=" py-4 border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm" role="region" aria-labelledby="upload-title">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle id="upload-title" className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20" aria-hidden="true">
              <Upload className="h-4 w-4 text-primary" />
            </div>
            Upload Image
          </CardTitle>
          
        </div>
      </CardHeader>
      <CardContent className="p-4 pb-0">
        <div
          className="group border-2 border-dashed border-border/50 rounded-xl p-3 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer bg-gradient-to-br from-muted/20 to-muted/10 hover:from-muted/30 hover:to-muted/20 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleUploadAreaClick}
          onKeyDown={handleUploadAreaKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Upload image file. Click or press Enter to browse files. Drag and drop is also supported."
          aria-describedby="upload-instructions"
        >
          {uploadedImage ? (
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded preview"
                className="max-h-20 rounded-md shadow-lg border border-border/30"
                aria-label="Preview of uploaded image"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-0.5 left-9 cursor-pointer rounded-full transition-all duration-200 h-6 w-6 p-0 bg-black/50 hover:bg-black/50 focus-visible:bg-black/70 focus-visible:scale-110"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveImage()
                }}
                aria-label="Remove uploaded image"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation()
                    onRemoveImage()
                  }
                }}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-dashed border-primary/30 flex items-center justify-center group-hover:border-primary/50 transition-colors" aria-hidden="true">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Drop your image here or click to browse
                </h3>
                <p id="upload-instructions" className="text-xs text-muted-foreground">
                  PNG or JPG up to 10MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileInputChange}
                className="hidden"
                aria-label="File input for image upload"
                aria-describedby="upload-instructions"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
