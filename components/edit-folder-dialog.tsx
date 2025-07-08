"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Palette, Folder } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface FolderNode {
  _id: string
  name: string
  parentId?: string
  color: string
  icon: string
  path: string
  level: number
  isExpanded: boolean
  websiteCount: number
  children: FolderNode[]
}

interface EditFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder: FolderNode | null
  onFolderUpdated: () => void
}

const FOLDER_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Green
  "#f59e0b", // Yellow
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
  "#6366f1", // Indigo
]

export function EditFolderDialog({ open, onOpenChange, folder, onFolderUpdated }: EditFolderDialogProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState("#3b82f6")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (folder) {
      setName(folder.name)
      setColor(folder.color)
    }
  }, [folder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folder || !name.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/folders/${folder._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          color,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update folder")
      }

      toast({
        title: "Folder updated",
        description: `${name} has been updated successfully`,
      })

      onFolderUpdated()
      onOpenChange(false)
      setName("")
      setColor("#3b82f6")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update folder",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setName("")
    setColor("#3b82f6")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Folder className="w-5 h-5" style={{ color }} />
            <span>Edit Folder</span>
          </DialogTitle>
          <DialogDescription>Update the folder name and color. Changes will be applied immediately.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="Enter folder name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              maxLength={50}
              required
            />
            <div className="text-xs text-muted-foreground">{name.length}/50 characters</div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Folder Color</span>
            </Label>
            <div className="grid grid-cols-5 gap-3">
              {FOLDER_COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                    color === colorOption
                      ? "border-foreground shadow-lg scale-110"
                      : "border-border hover:border-foreground/50"
                  }`}
                  style={{ backgroundColor: colorOption }}
                  title={`Select ${colorOption}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Folder className="w-4 h-4" style={{ color }} />
            <span className="text-sm font-medium">{name || "Folder Name"}</span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Folder"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
