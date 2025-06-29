import mongoose, { type Document, Schema } from "mongoose"

export interface ITag extends Document {
  userId: string
  name: string
  color: string
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

const TagSchema = new Schema<ITag>(
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
      lowercase: true,
    },
    color: {
      type: String,
      default: "#3b82f6", // Default blue color
    },
    usageCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
)

// Create compound index for efficient queries
TagSchema.index({ userId: 1, name: 1 }, { unique: true })
TagSchema.index({ userId: 1, usageCount: -1 })

export default mongoose.models.Tag || mongoose.model<ITag>("Tag", TagSchema)
