import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Plus, MessageSquare, ImageIcon, Clock, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DeleteConfirmation } from "./delete-confirmation"

interface Generation {
  id: string
  imageUrl: string
  prompt: string
  style: string
  createdAt: string
}

interface SidebarProps {
  history: Generation[]
  onNewChat: () => void
  onHistoryClick: (generation: Generation) => void
  onDeleteGeneration: (id: string) => void
  styleOptions: Array<{ value: string; label: string }>
}

export function Sidebar({ 
  history, 
  onNewChat, 
  onHistoryClick, 
  onDeleteGeneration,
  styleOptions 
}: SidebarProps) {
  return (
    <div className="w-80 h-screen bg-gradient-to-b from-card/50 to-card/30 border-r border-border/50 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-border/30" role="banner">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30" aria-hidden="true">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Studio
          </h1>
        </div>
        
        <Button 
          onClick={onNewChat}
          className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl font-semibold btn-enhanced focus-visible:scale-105"
          aria-describedby="new-chat-help"
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          New Generation
        </Button>
        <p id="new-chat-help" className="sr-only">
          Click to start a new image generation. You can also use Ctrl+N as a keyboard shortcut.
        </p>
      </header>

      {/* History Section */}
      <nav className="flex-1 p-6 overflow-hidden" role="navigation" aria-labelledby="history-title">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h2 id="history-title" className="text-sm font-semibold text-foreground">Recent Generations</h2>
        </div>
        
        {history.length === 0 ? (
          <div className="text-center py-8" role="status" aria-label="No generations available">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/30 mx-auto w-16 h-16 flex items-center justify-center mb-3" aria-hidden="true">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No generations yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Start creating to see your history</p>
          </div>
        ) : (
          <ScrollArea className="h-full w-full pr-2 " aria-label="Generation history list">
            <div className="space-y-3" role="list">
              {history.map((generation) => (
                <Card 
                  key={generation.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-border/30 bg-card/50 hover:bg-card/70 card-interactive focus-visible:scale-102"
                  onClick={() => onHistoryClick(generation)}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`Load generation: ${generation.prompt}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onHistoryClick(generation)
                    }
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {/* Image Thumbnail */}
                      <div className="flex-shrink-0">
                        <img
                          src={generation.imageUrl}
                          alt={`Preview of ${generation.prompt}`}
                          className="w-12 h-10 rounded-lg object-cover border border-border/30"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                            target.onerror = null // Prevent infinite loop
                          }}
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-foreground truncate leading-tight max-w-[180px] flex-1 pr-2">
                            {generation.prompt}
                          </p>
                          <DeleteConfirmation
                            onDelete={() => onDeleteGeneration(generation.id)}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:scale-110 flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Delete generation: ${generation.prompt}`}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.stopPropagation()
                                    onDeleteGeneration(generation.id)
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" aria-hidden="true" />
                              </Button>
                            }
                          />
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="secondary" 
                            className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 flex-shrink-0"
                            aria-label={`Style: ${styleOptions.find((s) => s.value === generation.style)?.label}`}
                          >
                            {styleOptions.find((s) => s.value === generation.style)?.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex-shrink-0" aria-label={`Created on ${new Date(generation.createdAt).toLocaleDateString()}`}>
                            {new Date(generation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </nav>
    </div>
  )
}
