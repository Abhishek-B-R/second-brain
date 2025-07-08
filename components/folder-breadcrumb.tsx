"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  id: string | null
  name: string
  path: string
}

interface FolderBreadcrumbProps {
  currentFolderId: string | null
  onNavigate: (folderId: string | null, folderName: string) => void
}

export function FolderBreadcrumb({ currentFolderId, onNavigate }: FolderBreadcrumbProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  useEffect(() => {
    const fetchBreadcrumbs = async () => {
      if (!currentFolderId) {
        setBreadcrumbs([{ id: null, name: "Home", path: "/" }])
        return
      }

      try {
        // For now, we'll build breadcrumbs by fetching the current folder
        // In a real app, you might want to store the full path or fetch parent chain
        const response = await fetch(`/api/folders/tree`)
        if (response.ok) {
          const data = await response.json()
          const breadcrumbPath = buildBreadcrumbPath(data.tree, currentFolderId)
          setBreadcrumbs([{ id: null, name: "Home", path: "/" }, ...breadcrumbPath])
        }
      } catch (error) {
        console.error("Error fetching breadcrumbs:", error)
        setBreadcrumbs([{ id: null, name: "Home", path: "/" }])
      }
    }

    fetchBreadcrumbs()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderId])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildBreadcrumbPath = (folders: any[], targetId: string): BreadcrumbItem[] => {
    for (const folder of folders) {
      if (folder._id === targetId) {
        return [{ id: folder._id, name: folder.name, path: folder.path }]
      }

      const childPath = buildBreadcrumbPath(folder.children, targetId)
      if (childPath.length > 0) {
        return [{ id: folder._id, name: folder.name, path: folder.path }, ...childPath]
      }
    }
    return []
  }

  return (
    <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      {breadcrumbs.map((item, index) => (
        <div key={item.id || "root"} className="flex items-center space-x-1">
          {index > 0 && <ChevronRight className="w-4 h-4" />}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-auto p-1 font-normal hover:text-foreground transition-colors",
              index === breadcrumbs.length - 1 && "text-foreground font-medium cursor-default hover:bg-transparent",
            )}
            onClick={() => {
              if (index < breadcrumbs.length - 1) {
                onNavigate(item.id, item.name)
              }
            }}
            disabled={index === breadcrumbs.length - 1}
          >
            {index === 0 && <Home className="w-4 h-4 mr-1" />}
            {item.name}
          </Button>
        </div>
      ))}
    </div>
  )
}
