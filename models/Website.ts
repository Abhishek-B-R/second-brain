import mongoose, { type Document, Schema } from "mongoose"

export interface IWebsite extends Document {
  userId: string
  type: "youtube" | "twitter" | "instagram" | "website"
  url: string
  title: string
  description: string
  thumbnail: string
  tags: string[]
  isFavorite: boolean
  viewCount: number
  embedId?: string // For YouTube video ID, Twitter tweet ID, Instagram post ID
  scheduledFor?: Date // For reminders
  reminderSent: boolean
  createdAt: Date
  updatedAt: Date
}

const WebsiteSchema = new Schema<IWebsite>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["youtube", "twitter", "instagram", "website"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
      },
    ],
    isFavorite: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    embedId: {
      type: String,
    },
    scheduledFor: {
      type: Date,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Create compound index for efficient queries
WebsiteSchema.index({ userId: 1, createdAt: -1 })
WebsiteSchema.index({ userId: 1, type: 1 })
WebsiteSchema.index({ userId: 1, isFavorite: 1 })
WebsiteSchema.index({ userId: 1, url: 1 }, { unique: true })
WebsiteSchema.index({ scheduledFor: 1, reminderSent: 1 })

export default mongoose.models.Website || mongoose.model<IWebsite>("Website", WebsiteSchema)
