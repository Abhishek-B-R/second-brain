/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Play, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmbeddedContentProps {
  type: "youtube" | "twitter" | "instagram" | "website"
  embedId?: string
  url: string
  title: string
  thumbnail: string
}

export function EmbeddedContent({ type, embedId, url, title }: EmbeddedContentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: "50px" },
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setError(true)
  }

  const renderYouTubeEmbed = () => {
    if (!embedId) return renderFallback()

    return (
      <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {isVisible && (
          <iframe
            src={`https://www.youtube.com/embed/${embedId}?rel=0&modestbranding=1`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {error && renderFallback()}
      </div>
    )
  }

  const renderTwitterEmbed = () => {
    if (!embedId) return renderFallback()

    return (
      <div className="relative w-full h-48 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {isVisible && (
          <iframe
            src={`https://platform.twitter.com/embed/Tweet.html?id=${embedId}&theme=${document.documentElement.classList.contains("dark") ? "dark" : "light"}&chrome=nofooter`}
            className="w-full h-full border-0"
            title={title}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {error && renderFallback()}
      </div>
    )
  }

  const renderInstagramEmbed = () => {
    if (!embedId) return renderFallback()

    return (
      <div className="relative w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {isVisible && (
          <iframe
            src={`https://www.instagram.com/p/${embedId}/embed/captioned`}
            className="w-full h-full border-0"
            title={title}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {error && renderFallback()}
      </div>
    )
  }

  const renderWebsitePreview = () => {
    return (
      <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {isVisible && (
          <>
            <img
              src={`https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={handleLoad}
              onError={handleError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="secondary"
                className="bg-white/95 text-black hover:bg-white transform hover:scale-105 transition-transform"
                onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
            </div>
          </>
        )}
        {error && renderFallback()}
      </div>
    )
  }

  const renderFallback = () => {
    const typeConfig = {
      youtube: { icon: Play, color: "bg-red-500", label: "YouTube Video" },
      twitter: { icon: ExternalLink, color: "bg-blue-500", label: "Twitter Post" },
      instagram: { icon: ExternalLink, color: "bg-pink-500", label: "Instagram Post" },
      website: { icon: ExternalLink, color: "bg-green-500", label: "Website" },
    }

    const config = typeConfig[type]
    const Icon = config.icon

    return (
      <div
        className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center group cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
      >
        <div className="text-center space-y-3">
          <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto", config.color)}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">{config.label}</p>
            <p className="text-sm text-muted-foreground">Click to open</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full">
      {type === "youtube" && renderYouTubeEmbed()}
      {type === "twitter" && renderTwitterEmbed()}
      {type === "instagram" && renderInstagramEmbed()}
      {type === "website" && renderWebsitePreview()}
    </div>
  )
}