import mongoose, { type Document, Schema } from "mongoose"

export interface IShareBrain extends Document {
  folderId: string
  userId: string
  shareId: string // Unique identifier for the shared link
  title: string
  description?: string
  isActive: boolean
  viewCount: number
  allowedDomains?: string[] // Optional: restrict access to specific domains
  expiresAt?: Date // Optional: expiration date
  createdAt: Date
  updatedAt: Date
}

const ShareBrainSchema = new Schema<IShareBrain>(
  {
    folderId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    shareId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    allowedDomains: [
      {
        type: String,
        trim: true,
      },
    ],
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Create compound indexes for efficient queries
ShareBrainSchema.index({ userId: 1, folderId: 1 }, { unique: true })
ShareBrainSchema.index({ shareId: 1, isActive: 1 })

export default mongoose.models.ShareBrain || mongoose.model<IShareBrain>("ShareBrain", ShareBrainSchema)
