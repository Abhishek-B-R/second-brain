import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Folder from "@/models/Folder"
import Website from "@/models/Website"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const email = session.user.email
    await dbConnect()

    // Get all folders for the user
    const folders = await Folder.find({ userId: session.user.email }).sort({ level: 1, name: 1 }).lean()

    // Get website counts for each folder
    if(!session?.user?.email) { 
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const folderCounts = await Promise.all(
      folders.map(async (folder) => {
        const websiteCount = await Website.countDocuments({
          userId: email,
          folderId: String(folder._id),
        })
        return { folderId: String(folder._id), count: websiteCount }
      }),
    )

    // Get root website count
    const rootWebsiteCount = await Website.countDocuments({
      userId: session.user.email,
      folderId: null,
    })

    // Build folder tree
    const folderMap = new Map()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tree: any[] = []

    // Initialize all folders
    folders.forEach((folder) => {
      const count = folderCounts.find((c) => c.folderId === String(folder._id))?.count || 0
      folderMap.set(String(folder._id), {
        ...folder,
        websiteCount: count,
        children: [],
      })
    })

    // Build tree structure
    folders.forEach((folder) => {
      const folderWithChildren = folderMap.get(String(folder._id))
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId)
        if (parent) {
          parent.children.push(folderWithChildren)
        }
      } else {
        tree.push(folderWithChildren)
      }
    })

    return NextResponse.json({
      tree,
      rootWebsiteCount,
    })
  } catch (error) {
    console.error("Error fetching folder tree:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
