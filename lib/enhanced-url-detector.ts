import { fetchWebsiteMetadata, extractMetadataFromMicrolink } from "./microlink"
import { generateContentSummary } from "./gemini"

export interface EnhancedUrlAnalysis {
  type: "youtube" | "twitter" | "instagram" | "website"
  embedId?: string
  title: string
  description: string
  thumbnail: string
  author?: string
  publisher?: string
}

export function analyzeUrl(url: string): { type: "youtube" | "twitter" | "instagram" | "website"; embedId?: string } {
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

export async function enhancedFetchMetadata(
  url: string,
  userTitle?: string,
  userDescription?: string,
): Promise<EnhancedUrlAnalysis> {
  const analysis = analyzeUrl(url)

  // If user provided both title and description, use them
  if (userTitle && userDescription) {
    let thumbnail = "/placeholder.svg?height=200&width=300"

    // Get thumbnail based on type
    if (analysis.type === "youtube" && analysis.embedId) {
      thumbnail = `https://img.youtube.com/vi/${analysis.embedId}/maxresdefault.jpg`
    } else if (analysis.type === "website") {
      // Use Microlink for website screenshots
      thumbnail = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
    }

    return {
      ...analysis,
      title: userTitle,
      description: userDescription,
      thumbnail,
    }
  }

  try {
    // For websites, use Microlink API for rich metadata and screenshots
    if (analysis.type === "website") {
      const microlinkData = await fetchWebsiteMetadata(url)
      const metadata = extractMetadataFromMicrolink(microlinkData)

      // If user didn't provide title/description, use AI to enhance
      if (!userTitle || !userDescription) {
        const aiSummary = await generateContentSummary(url, analysis.type)

        return {
          ...analysis,
          title: userTitle || metadata.title || aiSummary.title,
          description: userDescription || metadata.description || aiSummary.description,
          thumbnail: `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`,
          author: metadata.author,
          publisher: metadata.publisher,
        }
      }

      return {
        ...analysis,
        title: userTitle || metadata.title || "Website",
        description: userDescription || metadata.description || "Web content",
        thumbnail: `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`,
        author: metadata.author,
        publisher: metadata.publisher,
      }
    }

    // For YouTube, Twitter, Instagram - use AI if user didn't provide title/description
    if (!userTitle || !userDescription) {
      const aiSummary = await generateContentSummary(url, analysis.type)

      return {
        ...analysis,
        title: userTitle || aiSummary.title,
        description: userDescription || aiSummary.description,
        thumbnail:
          analysis.type === "youtube" && analysis.embedId
            ? `https://img.youtube.com/vi/${analysis.embedId}/maxresdefault.jpg`
            : "/placeholder.svg?height=200&width=300",
      }
    }

    // Fallback with user-provided data
    return {
      ...analysis,
      title: userTitle || getDefaultTitle(analysis.type),
      description: userDescription || getDefaultDescription(analysis.type),
      thumbnail:
        analysis.type === "youtube" && analysis.embedId
          ? `https://img.youtube.com/vi/${analysis.embedId}/maxresdefault.jpg`
          : "/placeholder.svg?height=200&width=300",
    }
  } catch (error) {
    console.error("Error fetching enhanced metadata:", error)

    return {
      ...analysis,
      title: userTitle || getDefaultTitle(analysis.type),
      description: userDescription || getDefaultDescription(analysis.type),
      thumbnail:
        analysis.type === "youtube" && analysis.embedId
          ? `https://img.youtube.com/vi/${analysis.embedId}/maxresdefault.jpg`
          : analysis.type === "website"
            ? `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
            : "/placeholder.svg?height=200&width=300",
    }
  }
}

function getDefaultTitle(type: string): string {
  switch (type) {
    case "youtube":
      return "YouTube Video"
    case "twitter":
      return "Twitter Post"
    case "instagram":
      return "Instagram Post"
    default:
      return "Website"
  }
}

function getDefaultDescription(type: string): string {
  switch (type) {
    case "youtube":
      return "Video content from YouTube"
    case "twitter":
      return "Post from Twitter/X"
    case "instagram":
      return "Post from Instagram"
    default:
      return "Web content"
  }
}
