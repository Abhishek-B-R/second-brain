import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { enhancedFetchMetadata } from "@/lib/enhanced-url-detector"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Generate metadata without saving to database
    const metadata = await enhancedFetchMetadata(url)

    return NextResponse.json({
      title: metadata.title,
      description: metadata.description,
      thumbnail: metadata.thumbnail,
      type: metadata.type,
    })
  } catch (error) {
    console.error("Error generating preview:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
