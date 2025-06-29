/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Play } from "lucide-react"

interface EmbeddedContentProps {
  type: "youtube" | "twitter" | "instagram" | "website"
  embedId?: string
  url: string
  title: string
  thumbnail: string
}

export function EmbeddedContent({ type, embedId, url, title, thumbnail }: EmbeddedContentProps) {
  const [showEmbed, setShowEmbed] = useState(false)

  const renderYouTubeEmbed = () => {
    if (!embedId) return null

    return (
      <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden">
        {showEmbed ? (
          <iframe
            src={`https://www.youtube.com/embed/${embedId}?autoplay=1`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="relative w-full h-full cursor-pointer group" onClick={() => setShowEmbed(true)}>
            <img src={thumbnail || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderTwitterEmbed = () => {
    if (!embedId) return null

    return (
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        {showEmbed ? (
          <iframe
            src={`https://platform.twitter.com/embed/Tweet.html?id=${embedId}&theme=light`}
            className="w-full h-full border-0"
            title={title}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setShowEmbed(true)}
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">Click to load Twitter post</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderInstagramEmbed = () => {
    if (!embedId) return null

    return (
      <div className="w-full h-48 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-lg overflow-hidden">
        {showEmbed ? (
          <iframe
            src={`https://www.instagram.com/p/${embedId}/embed/`}
            className="w-full h-full border-0"
            title={title}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setShowEmbed(true)}
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <p className="text-sm text-white">Click to load Instagram post</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderWebsitePreview = () => {
    return (
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <ExternalLink className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Website Link</p>
          <Button variant="outline" size="sm" onClick={() => window.open(url, "_blank")}>
            Visit Website
          </Button>
        </div>
      </div>
    )
  }

  switch (type) {
    case "youtube":
      return renderYouTubeEmbed()
    case "twitter":
      return renderTwitterEmbed()
    case "instagram":
      return renderInstagramEmbed()
    default:
      return renderWebsitePreview()
  }
}
