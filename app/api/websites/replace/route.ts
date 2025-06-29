import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Website from "@/models/Website"
import Tag from "@/models/Tag"
import { enhancedFetchMetadata } from "@/lib/enhanced-url-detector"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { url, title, description, tags, scheduledFor, replaceId } = await request.json()

    if (!url || !replaceId) {
      return NextResponse.json({ error: "URL and replaceId are required" }, { status: 400 })
    }

    await dbConnect()

    // Delete the old website
    await Website.findOneAndDelete({
      _id: replaceId,
      userId: session.user.email,
    })

    // Enhanced metadata fetching with AI
    const metadata = await enhancedFetchMetadata(url, title, description)

    // Process tags and update tag usage
    const processedTags = []
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const trimmedTag = tagName.trim().toLowerCase()
        if (trimmedTag) {
          // Find or create tag
          let tag = await Tag.findOne({
            userId: session.user.email,
            name: trimmedTag,
          })

          if (tag) {
            tag.usageCount += 1
            await tag.save()
          } else {
            tag = new Tag({
              userId: session.user.email,
              name: trimmedTag,
              color: getRandomColor(),
              usageCount: 1,
            })
            await tag.save()
          }

          processedTags.push(trimmedTag)
        }
      }
    }

    const website = new Website({
      userId: session.user.email,
      url: url.trim(),
      type: metadata.type,
      embedId: metadata.embedId,
      title: metadata.title,
      description: metadata.description,
      thumbnail: metadata.thumbnail,
      tags: processedTags,
      isFavorite: false,
      viewCount: 0,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      reminderSent: false,
    })

    await website.save()

    return NextResponse.json(website)
  } catch (error) {
    console.error("Error replacing website:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

function getRandomColor(): string {
  const colors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // yellow
    "#8b5cf6", // purple
    "#06b6d4", // cyan
    "#f97316", // orange
    "#84cc16", // lime
    "#ec4899", // pink
    "#6366f1", // indigo
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
