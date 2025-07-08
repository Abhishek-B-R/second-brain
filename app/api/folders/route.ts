import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Folder from "@/models/Folder"
import Website from "@/models/Website"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get("parentId")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { userId: session.user.email }

    if (parentId === "null" || parentId === null) {
      query.parentId = null
    } else if (parentId) {
      query.parentId = parentId
    }

    const folders = await Folder.find(query).sort({ name: 1 }).lean()

    // Get website counts for each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        if(!session.user?.email) {
          throw new Error("User email not found in session")
        }
        const idString = String(folder._id)
    
        const websiteCount = await Website.countDocuments({
          userId: session.user.email,
          folderId: idString,
        })
    
        const subfolderCount = await Folder.countDocuments({
          userId: session.user.email,
          parentId: idString,
        })
    
        return {
          ...folder,
          websiteCount,
          subfolderCount,
        }
      }),
    )

    return NextResponse.json(foldersWithCounts)
  } catch (error) {
    console.error("Error fetching folders:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, parentId, color, icon } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    await dbConnect()

    // Check if folder with same name exists in same parent
    const existingFolder = await Folder.findOne({
      userId: session.user.email,
      name: name.trim(),
      parentId: parentId || null,
    })

    if (existingFolder) {
      return NextResponse.json({ error: "Folder with this name already exists" }, { status: 409 })
    }

    // Calculate path and level
    let path = `/${name.trim()}`
    let level = 0

    if (parentId) {
      const parentFolder = await Folder.findOne({
        _id: parentId,
        userId: session.user.email,
      })

      if (!parentFolder) {
        return NextResponse.json({ error: "Parent folder not found" }, { status: 404 })
      }

      path = `${parentFolder.path}/${name.trim()}`
      level = parentFolder.level + 1
    }

    const folder = new Folder({
      userId: session.user.email,
      name: name.trim(),
      parentId: parentId || null,
      color: color || getRandomColor(),
      icon: icon || "folder",
      path,
      level,
      isExpanded: true,
    })

    await folder.save()
    return NextResponse.json(folder)
  } catch (error) {
    console.error("Error creating folder:", error)
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
