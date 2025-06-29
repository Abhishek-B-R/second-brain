export interface UrlAnalysis {
  type: "youtube" | "twitter" | "instagram" | "website"
  embedId?: string
  title?: string
  description?: string
  thumbnail?: string
}

export function analyzeUrl(url: string): UrlAnalysis {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    const pathname = urlObj.pathname

    // YouTube detection
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      let videoId = ""

      if (hostname.includes("youtu.be")) {
        videoId = pathname.slice(1)
      } else if (urlObj.searchParams.has("v")) {
        videoId = urlObj.searchParams.get("v") || ""
      }

      return {
        type: "youtube",
        embedId: videoId,
        thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "",
      }
    }

    // Twitter/X detection
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      const tweetMatch = pathname.match(/\/status\/(\d+)/)
      const embedId = tweetMatch ? tweetMatch[1] : ""

      return {
        type: "twitter",
        embedId,
      }
    }

    // Instagram detection
    if (hostname.includes("instagram.com")) {
      const postMatch = pathname.match(/\/p\/([^/]+)/)
      const embedId = postMatch ? postMatch[1] : ""

      return {
        type: "instagram",
        embedId,
      }
    }

    // Default to website
    return {
      type: "website",
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      type: "website",
    }
  }
}

export async function fetchMetadata(url: string): Promise<Partial<UrlAnalysis>> {
  try {
    // In a real app, you'd use a service like Puppeteer or a metadata API
    // For now, we'll return basic info based on URL analysis
    const analysis = analyzeUrl(url)

    if (analysis.type === "youtube" && analysis.embedId) {
      // You could integrate with YouTube API here
      return {
        title: "YouTube Video",
        description: "Video content from YouTube",
        thumbnail: analysis.thumbnail,
      }
    }

    if (analysis.type === "twitter") {
      return {
        title: "Twitter Post",
        description: "Post from Twitter/X",
        thumbnail: "/placeholder.svg?height=200&width=300",
      }
    }

    if (analysis.type === "instagram") {
      return {
        title: "Instagram Post",
        description: "Post from Instagram",
        thumbnail: "/placeholder.svg?height=200&width=300",
      }
    }

    return {
      title: "Website",
      description: "Web content",
      thumbnail: "/placeholder.svg?height=200&width=300",
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      title: "Website",
      description: "Web content",
      thumbnail: "/placeholder.svg?height=200&width=300",
    }
  }
}
