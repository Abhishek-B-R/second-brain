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

interface WebsiteCardProps {
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
  },
  twitter: {
    icon: MessageCircle,
    color: "bg-blue-500",
    label: "Twitter",
    gradient: "from-blue-500 to-blue-600",
  },
  instagram: {
    icon: Instagram,
    color: "bg-pink-500",
    label: "Instagram",
    gradient: "from-pink-500 to-purple-600",
  },
  website: {
    icon: Globe,
    color: "bg-green-500",
    label: "Website",
    gradient: "from-green-500 to-green-600",
  },
}

export function WebsiteCard({ website, onToggleFavorite, onDelete }: WebsiteCardProps) {
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

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2",
        "bg-card/80 backdrop-blur-md border-border/50 overflow-hidden",
        "transform-gpu will-change-transform",
        isHovered && "shadow-2xl scale-[1.02]",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Embedded Content */}
        <EmbeddedContent
          type={website.type}
          embedId={website.embedId}
          url={website.url}
          title={website.title}
          thumbnail={website.thumbnail}
        />

        {/* Top badges and actions */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <Badge
            className={cn("text-white border-0 shadow-lg backdrop-blur-sm", `bg-gradient-to-r ${config.gradient}`)}
          >
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>

          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white backdrop-blur-sm"
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
                  className="h-8 w-8 bg-white/90 hover:bg-white backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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

        {/* View count badge */}
        {website.viewCount > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {website.viewCount} views
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors flex-1 mr-2">
            {website.title}
          </CardTitle>
          {website.isFavorite && <Heart className="w-4 h-4 fill-red-500 text-red-500 flex-shrink-0" />}
        </div>
        {website.description && <CardDescription className="line-clamp-2">{website.description}</CardDescription>}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Tags */}
        {website.tags && website.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {website.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {website.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{website.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(website.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
