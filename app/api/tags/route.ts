import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Tag from "@/models/Tag"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { userId: session.user.email }

    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    const tags = await Tag.find(query).sort({ usageCount: -1, name: 1 }).limit(50).lean()

    return NextResponse.json(tags)
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, color } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 })
    }

    await dbConnect()

    // Check if tag already exists
    const existingTag = await Tag.findOne({
      userId: session.user.email,
      name: name.toLowerCase().trim(),
    })

    if (existingTag) {
      // Increment usage count
      existingTag.usageCount += 1
      await existingTag.save()
      return NextResponse.json(existingTag)
    }

    // Create new tag
    const tag = new Tag({
      userId: session.user.email,
      name: name.toLowerCase().trim(),
      color: color || "#3b82f6",
      usageCount: 1,
    })

    await tag.save()
    return NextResponse.json(tag)
  } catch (error) {
    console.error("Error creating tag:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
