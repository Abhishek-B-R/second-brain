import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Folder from "@/models/Folder"
import Website from "@/models/Website"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const updates = await request.json()

    await dbConnect()

    const folder = await Folder.findOneAndUpdate({ _id: id, userId: session.user.email }, updates, { new: true })

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    return NextResponse.json(folder)
  } catch (error) {
    console.error("Error updating folder:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await dbConnect()

    // Check if folder exists
    const folder = await Folder.findOne({
      _id: id,
      userId: session.user.email,
    })

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // Check if folder has subfolders
    const subfolderCount = await Folder.countDocuments({
      userId: session.user.email,
      parentId: id,
    })

    if (subfolderCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete folder with subfolders. Please delete subfolders first." },
        { status: 400 },
      )
    }

    // Move all websites in this folder to root
    await Website.updateMany({ userId: session.user.email, folderId: id }, { $unset: { folderId: 1 } })

    // Delete the folder
    await Folder.findByIdAndDelete(id)

    return NextResponse.json({ message: "Folder deleted successfully" })
  } catch (error) {
    console.error("Error deleting folder:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
