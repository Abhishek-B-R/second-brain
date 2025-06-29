"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ExternalLink,
  Play,
  MessageCircle,
  Instagram,
  Globe,
  Calendar,
  Heart,
  Share2,
  Bookmark,
  MoreVertical,
  Copy,
  Trash2,
  Edit,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Website {
  id: string
  type: "youtube" | "twitter" | "instagram" | "website"
  url: string
  title: string
  description: string
  thumbnail: string
  createdAt: Date
  tags?: string[]
  isFavorite?: boolean
  isBookmarked?: boolean
  viewCount?: number
}

interface AdvancedEmbedCardProps {
  website: Website
  onToggleFavorite?: (id: string) => void
  onToggleBookmark?: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
}

const typeConfig = {
  youtube: {
    icon: Play,
    color: "bg-red-500",
    label: "YouTube",
    gradient: "from-red-500 to-red-600",
    hoverGradient: "from-red-600 to-red-700",
  },
  twitter: {
    icon: MessageCircle,
    color: "bg-blue-500",
    label: "Twitter",
    gradient: "from-blue-500 to-blue-600",
    hoverGradient: "from-blue-600 to-blue-700",
  },
  instagram: {
    icon: Instagram,
    color: "bg-pink-500",
    label: "Instagram",
    gradient: "from-pink-500 to-purple-600",
    hoverGradient: "from-pink-600 to-purple-700",
  },
  website: {
    icon: Globe,
    color: "bg-green-500",
    label: "Website",
    gradient: "from-green-500 to-green-600",
    hoverGradient: "from-green-600 to-green-700",
  },
}

export function AdvancedEmbedCard({
  website,
  onToggleFavorite,
  onToggleBookmark,
  onDelete,
  onEdit,
}: AdvancedEmbedCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const config = typeConfig[website.type]
  const Icon = config.icon

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in")
        }
      },
      { threshold: 0.1 },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const handleOpenLink = () => {
    window.open(website.url, "_blank", "noopener,noreferrer")
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
      ref={cardRef}
      className={cn(
        "group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2",
        "bg-card/80 backdrop-blur-md border-border/50 overflow-hidden",
        "transform-gpu will-change-transform",
        isHovered && "shadow-2xl scale-[1.02]",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <div className="relative h-48 w-full">
          <Image
            src={website.thumbnail || "/placeholder.svg"}
            alt={website.title}
            fill
            className={cn(
              "object-cover transition-all duration-700 group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

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
                onToggleFavorite?.(website.id)
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
                <DropdownMenuItem onClick={() => onToggleBookmark?.(website.id)}>
                  <Bookmark className={cn("w-4 h-4 mr-2", website.isBookmarked && "fill-current")} />
                  {website.isBookmarked ? "Remove Bookmark" : "Bookmark"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit?.(website.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(website.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Hover overlay with action button */}
        <div
          className={cn(
            "absolute inset-0 bg-black/60 flex items-center justify-center transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0",
          )}
        >
          <Button
            variant="secondary"
            className="bg-white/95 text-black hover:bg-white transform hover:scale-105 transition-transform"
            onClick={(e) => {
              e.stopPropagation()
              handleOpenLink()
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Link
          </Button>
        </div>

        {/* View count badge */}
        {website.viewCount && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {website.viewCount} views
          </div>
        )}
      </div>

      <CardHeader className="pb-2" onClick={handleOpenLink}>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors flex-1 mr-2">
            {website.title}
          </CardTitle>
          {(website.isFavorite || website.isBookmarked) && (
            <div className="flex space-x-1">
              {website.isFavorite && <Heart className="w-4 h-4 fill-red-500 text-red-500" />}
              {website.isBookmarked && <Bookmark className="w-4 h-4 fill-blue-500 text-blue-500" />}
            </div>
          )}
        </div>
        <CardDescription className="line-clamp-2">{website.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0" onClick={handleOpenLink}>
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
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-3 h-3" />
            <span>View</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
