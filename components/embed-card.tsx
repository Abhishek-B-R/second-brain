"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Play, MessageCircle, Instagram, Globe, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface Website {
  id: string
  type: "youtube" | "twitter" | "instagram" | "website"
  url: string
  title: string
  description: string
  thumbnail: string
  createdAt: Date
}

interface EmbedCardProps {
  website: Website
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

export function EmbedCard({ website }: EmbedCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const config = typeConfig[website.type]
  const Icon = config.icon

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

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        "bg-card/50 backdrop-blur-sm border-border/50",
        isHovered && "shadow-2xl",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpenLink}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <Image
          src={website.thumbnail || "/placeholder.svg"}
          alt={website.title}
          width={400}
          height={200}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Overlay with type badge */}
        <div className="absolute top-3 left-3">
          <Badge className={cn("text-white border-0 shadow-lg", `bg-gradient-to-r ${config.gradient}`)}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        {/* Hover overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0",
          )}
        >
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 text-black hover:bg-white"
            onClick={(e) => {
              e.stopPropagation()
              handleOpenLink()
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open
          </Button>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {website.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">{website.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
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
