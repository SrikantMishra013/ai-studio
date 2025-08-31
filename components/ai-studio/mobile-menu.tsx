import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Sparkles, MessageSquare, ImageIcon } from "lucide-react"

interface Generation {
  id: string
  imageUrl: string
  prompt: string
  style: string
  createdAt: string
}

interface MobileMenuProps {
  history: Generation[]
  onNewChat: () => void
  onHistoryClick: (generation: Generation) => void
  onDeleteGeneration: (id: string) => void
  styleOptions: Array<{ value: string; label: string }>
}

export function MobileMenu({ 
  history, 
  onNewChat, 
  onHistoryClick, 
  onDeleteGeneration,
  styleOptions 
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleHistoryClick = (generation: Generation) => {
    onHistoryClick(generation)
    setIsOpen(false)
  }

  const handleNewChat = () => {
    onNewChat()
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden border-border/50 bg-card/50 btn-enhanced focus-visible:scale-105"
          aria-label="Open mobile menu"
          aria-describedby="mobile-menu-help"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-gradient-to-b from-card/50 to-background/30 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Mobile navigation menu">
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="p-6 border-b border-border/50 bg-card/20" role="banner">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20" aria-hidden="true">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                AI Studio
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 btn-enhanced focus-visible:scale-110"
                aria-label="Close mobile menu"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Transform your images with AI magic
            </p>
          </header>

          {/* New Chat Button */}
          <div className="p-4 border-b border-border/50">
            <Button
              className="w-full justify-start gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 btn-enhanced focus-visible:scale-105"
              variant="default"
              onClick={handleNewChat}
              aria-describedby="mobile-new-chat-help"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              New Generation
            </Button>
            <p id="mobile-new-chat-help" className="sr-only">
              Click to start a new image generation. You can also use Ctrl+N as a keyboard shortcut.
            </p>
          </div>

          {/* Chat History */}
          <nav className="flex-1 overflow-hidden" role="navigation" aria-labelledby="mobile-history-title">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-muted/50" aria-hidden="true">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 id="mobile-history-title" className="text-sm font-semibold text-muted-foreground">Recent Generations</h3>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-8" role="status" aria-label="No generations available">
                  <div className="p-3 rounded-full bg-muted/30 mx-auto w-fit mb-3" aria-hidden="true">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No generations yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Start by uploading an image
                  </p>
                </div>
              ) : (
                <div className="space-y-2" role="list" aria-label="Generation history list">
                  {history.map((generation) => (
                    <div
                      key={generation.id}
                      className="group flex gap-3 p-3 rounded-xl hover:bg-accent/10 cursor-pointer transition-all duration-200 border border-transparent hover:border-border/50 hover:shadow-sm card-interactive focus-visible:scale-102"
                      onClick={() => handleHistoryClick(generation)}
                      role="listitem"
                      tabIndex={0}
                      aria-label={`Load generation: ${generation.prompt}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          handleHistoryClick(generation)
                        }
                      }}
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border/30 group-hover:border-border/50 transition-colors" aria-hidden="true">
                        <img
                          src={generation.imageUrl || "/placeholder.svg"}
                          alt={`Generated: ${generation.prompt}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                            target.onerror = null // Prevent infinite loop
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-start justify-between gap-2 mb-2">
                           <p className="text-xs font-medium truncate leading-tight text-foreground group-hover:text-foreground/90 transition-colors">
                             {generation.prompt}
                           </p>
                           <Button
                             variant="ghost"
                             size="sm"
                             className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:scale-110"
                             onClick={(e) => {
                               e.stopPropagation()
                               onDeleteGeneration(generation.id)
                             }}
                             aria-label={`Delete generation: ${generation.prompt}`}
                             onKeyDown={(e) => {
                               if (e.key === "Enter" || e.key === " ") {
                                 e.stopPropagation()
                                 onDeleteGeneration(generation.id)
                               }
                             }}
                           >
                             <X className="h-3 w-3" aria-hidden="true" />
                           </Button>
                         </div>
                         <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-0.5 bg-muted/50 border-border/30"
                            aria-label={`Style: ${styleOptions.find((s) => s.value === generation.style)?.label}`}
                          >
                            {styleOptions.find((s) => s.value === generation.style)?.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground/60" aria-label={`Created on ${new Date(generation.createdAt).toLocaleDateString()}`}>
                            {new Date(generation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </SheetContent>
      
      {/* Help text for screen readers */}
      <div className="sr-only">
        <p id="mobile-menu-help">
          Click to open the mobile navigation menu with generation history and new generation option.
        </p>
      </div>
    </Sheet>
  )
}
