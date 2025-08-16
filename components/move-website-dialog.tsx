"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Folder, Home, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Website {
  _id: string;
  type: "youtube" | "twitter" | "instagram" | "website";
  url: string;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  isFavorite: boolean;
  viewCount: number;
  embedId?: string;
  createdAt: string;
  folderId?: string;
}

interface FolderNode {
  _id: string;
  name: string;
  parentId?: string;
  color: string;
  icon: string;
  path: string;
  level: number;
  isExpanded: boolean;
  websiteCount: number;
  children: FolderNode[];
}

interface MoveWebsiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  website: Website | null;
  currentFolderId: string | null;
  onWebsiteMoved: () => void;
}

export function MoveWebsiteDialog({
  open,
  onOpenChange,
  website,
  currentFolderId,
  onWebsiteMoved,
}: MoveWebsiteDialogProps) {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/folders/tree");
      if (response.ok) {
        const data = await response.json();
        setFolders(data.tree);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchFolders();
      setSelectedFolderId(null);
    }
  }, [open]);

  const handleMove = async () => {
    if (!website) return;

    setIsMoving(true);

    try {
      const response = await fetch(`/api/websites/${website._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId: selectedFolderId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to move website");
      }

      const destinationName = selectedFolderId
        ? findFolderById(folders, selectedFolderId)?.name || "Unknown Folder"
        : "Home";

      toast({
        title: "Website moved",
        description: `${website.title} moved to ${destinationName}`,
      });

      onWebsiteMoved();
      onOpenChange(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move website",
        variant: "destructive",
      });
    } finally {
      setIsMoving(false);
    }
  };

  const findFolderById = (
    folders: FolderNode[],
    id: string
  ): FolderNode | null => {
    for (const folder of folders) {
      if (folder._id === id) return folder;
      const found = findFolderById(folder.children, id);
      if (found) return found;
    }
    return null;
  };

  const renderFolder = (folder: FolderNode) => {
    const isSelected = selectedFolderId === folder._id;
    const isCurrent = currentFolderId === folder._id;
    const isDisabled = isCurrent;

    return (
      <div key={folder._id}>
        <div
          className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
            isSelected && "bg-accent text-accent-foreground",
            isDisabled && "opacity-50 cursor-not-allowed",
            !isDisabled && !isSelected && "hover:bg-accent/50"
          )}
          style={{ paddingLeft: `${folder.level * 16 + 12}px` }}
          onClick={() => !isDisabled && setSelectedFolderId(folder._id)}
        >
          <Folder
            className="h-4 w-4 flex-shrink-0"
            style={{ color: folder.color }}
          />
          <span className="text-sm font-medium truncate flex-1">
            {folder.name}
          </span>
          {folder.websiteCount > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
              {folder.websiteCount}
            </Badge>
          )}
          {isCurrent && (
            <Badge variant="outline" className="text-xs">
              Current
            </Badge>
          )}
        </div>
        {folder.children.map((child) => renderFolder(child))}
      </div>
    );
  };

  const currentFolderName = currentFolderId
    ? findFolderById(folders, currentFolderId)?.name || "Unknown Folder"
    : "Home";

  const selectedFolderName = selectedFolderId
    ? findFolderById(folders, selectedFolderId)?.name || "Unknown Folder"
    : "Home";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Move Website</DialogTitle>
          <DialogDescription>
            Choose a destination folder for &quot;{website?.title}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Location */}
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Currently in:</div>
            <div className="flex items-center space-x-1">
              {currentFolderId ? (
                <Folder
                  className="h-4 w-4"
                  style={{
                    color:
                      findFolderById(folders, currentFolderId)?.color ||
                      "#3b82f6",
                  }}
                />
              ) : (
                <Home className="h-4 w-4 text-rose-500" />
              )}
              <span className="text-sm font-medium">{currentFolderName}</span>
            </div>
          </div>

          {/* Destination Preview */}
          {selectedFolderId !== null && (
            <div className="flex items-center space-x-2 p-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800">
              <div className="text-sm text-rose-600 dark:text-rose-400">
                Moving to:
              </div>
              <div className="flex items-center space-x-1">
                <ArrowRight className="h-3 w-3 text-rose-500" />
                {selectedFolderId ? (
                  <Folder
                    className="h-4 w-4"
                    style={{
                      color:
                        findFolderById(folders, selectedFolderId)?.color ||
                        "#3b82f6",
                    }}
                  />
                ) : (
                  <Home className="h-4 w-4 text-rose-500" />
                )}
                <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  {selectedFolderName}
                </span>
              </div>
            </div>
          )}

          {/* Folder List */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Select destination:</div>
            <ScrollArea className="h-[300px] border rounded-lg p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Root Folder */}
                  <div
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                      selectedFolderId === null &&
                        "bg-accent text-accent-foreground",
                      currentFolderId === null &&
                        "opacity-50 cursor-not-allowed",
                      currentFolderId !== null &&
                        selectedFolderId !== null &&
                        "hover:bg-accent/50"
                    )}
                    onClick={() =>
                      currentFolderId !== null && setSelectedFolderId(null)
                    }
                  >
                    <Home className="h-4 w-4 flex-shrink-0 text-rose-500" />
                    <span className="text-sm font-medium">Home</span>
                    {currentFolderId === null && (
                      <Badge variant="outline" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>

                  {/* Folder Tree */}
                  {folders.map((folder) => renderFolder(folder))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isMoving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={
              isMoving ||
              selectedFolderId === currentFolderId ||
              (selectedFolderId === null && currentFolderId === null)
            }
          >
            {isMoving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Moving...
              </>
            ) : (
              "Move Website"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
