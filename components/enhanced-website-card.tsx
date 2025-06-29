"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmbeddedContent } from "./embedded-content"
import {
  Heart,
  MoreVertical,
  Share2,
  Copy,
  Trash2,
  Calendar,
  Play,
  MessageCircle,
  Instagram,
  Globe,
  Eye,
  ExternalLink,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Website {
  _id: string
  type: "youtube" | "twitter" | "instagram" | "website"
  url: string
  title: string
  description: string
  thumbnail: string
  tags: string[]
  isFavorite: boolean
  viewCount: number
  embedId?: string
  createdAt: string
}

interface EnhancedWebsiteCardProps {
  website: Website
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
}

const typeConfig = {
  youtube: {
    icon: Play,
    color: "bg-red-500",
    label: "YouTube",
    gradient: "from-red-500 to-red-600",
    bgGradient: "from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20",
  },
  twitter: {
    icon: MessageCircle,
    color: "bg-blue-500",
    label: "Twitter",
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20",
  },
  instagram: {
    icon: Instagram,
    color: "bg-pink-500",
    label: "Instagram",
    gradient: "from-pink-500 to-purple-600",
    bgGradient: "from-pink-50 to-purple-100 dark:from-pink-950/20 dark:to-purple-900/20",
  },
  website: {
    icon: Globe,
    color: "bg-green-500",
    label: "Website",
    gradient: "from-green-500 to-green-600",
    bgGradient: "from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20",
  },
}

const tagColors = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
  "#ec4899",
  "#6366f1",
]

export function EnhancedWebsiteCard({ website, onToggleFavorite, onDelete }: EnhancedWebsiteCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const config = typeConfig[website.type]
  const Icon = config.icon

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString))
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(website.url)
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: website.title,
          text: website.description,
          url: website.url,
        })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleVisit = () => {
    window.open(website.url, "_blank", "noopener,noreferrer")
  }

  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length]
  }

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-3",
        "bg-gradient-to-br backdrop-blur-md border-border/50 overflow-hidden",
        "transform-gpu will-change-transform relative",
        "h-[520px] flex flex-col", // Fixed height for all cards
        config.bgGradient,
        isHovered && "shadow-2xl scale-[1.02] ring-2 ring-primary/20",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Embedded Content - Fixed height */}
        <div className="relative overflow-hidden rounded-t-lg">
          <div className="relative z-10">
            <EmbeddedContent
              type={website.type}
              embedId={website.embedId}
              url={website.url}
              title={website.title}
              thumbnail={website.thumbnail}
            />
          </div>

          {/* Gradient overlay only at bottom for text readability */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-20" />
        </div>

        {/* Top badges and actions - positioned over the embed */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-30 pointer-events-none">
          <Badge
            className={cn(
              "text-white border-0 shadow-lg backdrop-blur-sm font-medium px-3 py-1 pointer-events-auto",
              `bg-gradient-to-r ${config.gradient}`,
              "hover:scale-105 transition-transform duration-200",
            )}
          >
            <Icon className="w-3 h-3 mr-1.5" />
            {config.label}
          </Badge>

          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-auto">
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 bg-white/95 hover:bg-white backdrop-blur-sm shadow-lg hover:scale-110 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(website._id)
              }}
            >
              <Heart className={cn("w-4 h-4", website.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600")} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 bg-white/95 hover:bg-white backdrop-blur-sm shadow-lg hover:scale-110 transition-all duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleVisit}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(website._id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* View count indicator */}
        {website.viewCount > 0 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center space-x-1 z-30 pointer-events-none">
            <Eye className="w-3 h-3" />
            <span>{website.viewCount}</span>
          </div>
        )}
      </div>

      {/* Card content below the embed - Flexible height with constraints */}
      <div className="flex-1 flex flex-col">
        <CardHeader className="pb-3 relative z-10 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors flex-1 mr-2 font-semibold min-h-[3.5rem]">
              {website.title}
            </CardTitle>
            {website.isFavorite && <Heart className="w-5 h-5 fill-red-500 text-red-500 flex-shrink-0 animate-pulse" />}
          </div>
          {website.description && (
            <CardDescription className="line-clamp-3 text-sm leading-relaxed min-h-[4rem]">
              {website.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent
          className="pt-0 relative z-10 flex-1 flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tags */}
          <div className="flex-1">
            {website.tags && website.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {website.tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs px-2 py-1 font-medium hover:scale-105 transition-transform duration-200"
                    style={{
                      backgroundColor: `${getTagColor(index)}15`,
                      color: getTagColor(index),
                      borderColor: `${getTagColor(index)}30`,
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
                {website.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    +{website.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Footer - Always at bottom */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(website.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ExternalLink className="w-3 h-3" />
              <span>View</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
