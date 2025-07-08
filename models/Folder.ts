import mongoose, { type Document, Schema } from "mongoose"

export interface IFolder extends Document {
  userId: string
  name: string
  parentId?: string // For nested folders
  color: string
  icon: string
  path: string // Full path like "/Work/Projects/AI"
  level: number // Nesting level (0 for root)
  isExpanded: boolean // UI state for folder tree
  createdAt: Date
  updatedAt: Date
}

const FolderSchema = new Schema<IFolder>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: String,
      default: null,
      index: true,
    },
    color: {
      type: String,
      default: "#3b82f6", // Default blue color
    },
    icon: {
      type: String,
      default: "folder", // Default folder icon
    },
    path: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      default: 0,
    },
    isExpanded: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Create compound indexes for efficient queries
FolderSchema.index({ userId: 1, parentId: 1 })
FolderSchema.index({ userId: 1, path: 1 })
FolderSchema.index({ userId: 1, name: 1, parentId: 1 }, { unique: true })

export default mongoose.models.Folder || mongoose.model<IFolder>("Folder", FolderSchema)
