"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Folder, FolderOpen, ChevronRight, ChevronDown, Plus, MoreVertical, Edit, Trash2, Home, X } from "lucide-react"
import { cn } from "@/lib/utils"
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

interface MobileFolderOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentFolderId: string | null
  onFolderSelect: (folderId: string | null, folderName: string) => void
  onCreateFolder: (parentId?: string) => void
  onEditFolder: (folder: FolderNode) => void
  onDeleteFolder: () => void
  refreshTrigger?: number
}

export function MobileFolderOverlay({
  open,
  onOpenChange,
  currentFolderId,
  onFolderSelect,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  refreshTrigger,
}: MobileFolderOverlayProps) {
  const [folderTree, setFolderTree] = useState<FolderNode[]>([])
  const [rootWebsiteCount, setRootWebsiteCount] = useState(0)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const fetchFolderTree = async () => {
    try {
      const response = await fetch("/api/folders/tree")
      if (response.ok) {
        const data = await response.json()
        setFolderTree(data.tree)
        setRootWebsiteCount(data.rootWebsiteCount)

        // Auto-expand folders that contain the current folder
        const expanded = new Set<string>()
        const expandParents = (folders: FolderNode[], targetId: string | null): boolean => {
          for (const folder of folders) {
            if (folder._id === targetId) {
              return true
            }
            if (expandParents(folder.children, targetId)) {
              expanded.add(folder._id)
              return true
            }
          }
          return false
        }
        expandParents(data.tree, currentFolderId)
        setExpandedFolders(expanded)
      }
    } catch (error) {
      console.error("Error fetching folder tree:", error)
    }
  }

  useEffect(() => {
    if (open) {
      fetchFolderTree()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentFolderId, refreshTrigger])

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleFolderSelect = (folderId: string | null, folderName: string) => {
    onFolderSelect(folderId, folderName)
    onOpenChange(false) // Close overlay after selection
  }

  const handleDeleteFolder = async (folder: FolderNode) => {
    try {
      const response = await fetch(`/api/folders/${folder._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: "Folder deleted",
        description: `${folder.name} has been deleted`,
      })

      // If we're currently in the deleted folder, go to root
      if (currentFolderId === folder._id) {
        onFolderSelect(null, "Home")
      }

      fetchFolderTree()
      onDeleteFolder()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete folder",
        variant: "destructive",
      })
    }
  }

  const renderFolder = (folder: FolderNode) => {
    const isExpanded = expandedFolders.has(folder._id)
    const isSelected = currentFolderId === folder._id
    const hasChildren = folder.children.length > 0

    return (
      <div key={folder._id} className="select-none">
        <div
          className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer group hover:bg-accent/50 transition-colors",
            isSelected && "bg-accent text-accent-foreground",
          )}
          style={{ paddingLeft: `${folder.level * 16 + 12}px` }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(folder._id)
              }}
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          ) : (
            <div className="w-4" />
          )}

          <div
            className="flex items-center space-x-2 flex-1 min-w-0"
            onClick={() => handleFolderSelect(folder._id, folder.name)}
          >
            {isExpanded && hasChildren ? (
              <FolderOpen className="h-4 w-4 flex-shrink-0" style={{ color: folder.color }} />
            ) : (
              <Folder className="h-4 w-4 flex-shrink-0" style={{ color: folder.color }} />
            )}
            <span className="text-sm font-medium truncate">{folder.name}</span>
            {folder.websiteCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                {folder.websiteCount}
              </Badge>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onCreateFolder(folder._id)}>
                <Plus className="w-4 h-4 mr-2" />
                New Subfolder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditFolder(folder)}>
                <Edit className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteFolder(folder)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isExpanded && hasChildren && <div className="ml-2">{folder.children.map((child) => renderFolder(child))}</div>}
      </div>
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-x-4 top-4 bottom-4 bg-background border rounded-lg shadow-lg overflow-hidden">
        <Card className="h-full border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Folders</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => onCreateFolder()} className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 h-full overflow-y-auto">
            <div className="space-y-1">
              {/* Root Folder */}
              <div
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer group hover:bg-accent/50 transition-colors",
                  currentFolderId === null && "bg-accent text-accent-foreground",
                )}
                onClick={() => handleFolderSelect(null, "Home")}
              >
                <Home className="h-4 w-4 flex-shrink-0 text-blue-500" />
                <span className="text-sm font-medium">Home</span>
                {rootWebsiteCount > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                    {rootWebsiteCount}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCreateFolder()
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Folder Tree */}
              {folderTree.map((folder) => renderFolder(folder))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}