import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Website from "@/models/Website"
import Tag from "@/models/Tag"
import { enhancedFetchMetadata } from "@/lib/enhanced-url-detector"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const favorites = searchParams.get("favorites") === "true"
    const folderId = searchParams.get("folderId")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { userId: session.user.email }

    // Handle folder filtering
    if (folderId === "null" || folderId === null) {
      query.folderId = null // Root folder
    } else if (folderId) {
      query.folderId = folderId
    }

    if (type && type !== "all") {
      query.type = type
    }

    if (favorites) {
      query.isFavorite = true
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    const websites = await Website.find(query).sort({ createdAt: -1 }).lean()

    return NextResponse.json(websites)
  } catch (error) {
    console.error("Error fetching websites:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { url, title, description, tags, scheduledFor, folderId } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    await dbConnect()

    // Check if URL already exists for this user
    const existingWebsite = await Website.findOne({
      userId: session.user.email,
      url: url.trim(),
    })

    if (existingWebsite) {
      return NextResponse.json(
        {
          error: "URL_EXISTS",
          message: "This website already exists in your collection",
          existingWebsite,
        },
        { status: 409 },
      )
    }

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
      folderId: folderId || null, // null for root folder
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
    console.error("Error creating website:", error)
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
