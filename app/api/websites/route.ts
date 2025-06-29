import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Website from "@/models/Website"
import { analyzeUrl, fetchMetadata } from "@/lib/url-detector"

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { userId: session.user.email }

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

    const { url, title, description, tags } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    await dbConnect()

    // Analyze URL to determine type and extract metadata
    const analysis = analyzeUrl(url)
    const metadata = await fetchMetadata(url)

    const website = new Website({
      userId: session.user.email,
      url,
      type: analysis.type,
      embedId: analysis.embedId,
      title: title || metadata.title || "Untitled",
      description: description || metadata.description || "",
      thumbnail: metadata.thumbnail || "/placeholder.svg?height=200&width=300",
      tags: tags || [],
      isFavorite: false,
      viewCount: 0,
    })

    await website.save()

    return NextResponse.json(website)
  } catch (error) {
    console.error("Error creating website:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
