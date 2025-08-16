"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Plus,
  X,
  Link,
  Loader2,
  Sparkles,
  Check,
  ChevronsUpDown,
  Wand2,
  CalendarIcon,
  Clock,
  Folder,
  Home,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Tag {
  _id: string;
  name: string;
  color: string;
  usageCount: number;
}

interface FolderOption {
  _id: string;
  name: string;
  path: string;
  level: number;
  color: string;
}

interface EnhancedAddWebsiteDialogProps {
  onWebsiteAdded: () => void;
  currentFolderId?: string | null;
}

export function EnhancedAddWebsiteDialog({
  onWebsiteAdded,
  currentFolderId,
}: EnhancedAddWebsiteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagSearchOpen, setTagSearchOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [scheduledFor, setScheduledFor] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    currentFolderId || null
  );
  const [availableFolders, setAvailableFolders] = useState<FolderOption[]>([]);

  // Duplicate handling
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [existingWebsite, setExistingWebsite] = useState<any>(null);

  // Fetch available tags and folders
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tags
        const tagsResponse = await fetch("/api/tags");
        if (tagsResponse.ok) {
          const tags = await tagsResponse.json();
          setAvailableTags(tags);
        }

        // Fetch folders
        const foldersResponse = await fetch("/api/folders/tree");
        if (foldersResponse.ok) {
          const data = await foldersResponse.json();
          const flatFolders = flattenFolders(data.tree);
          setAvailableFolders(flatFolders);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (open) {
      fetchData();
      setSelectedFolderId(currentFolderId || null);
    }
  }, [open, currentFolderId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flattenFolders = (folders: any[]): FolderOption[] => {
    const result: FolderOption[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flatten = (folderList: any[]) => {
      for (const folder of folderList) {
        result.push({
          _id: folder._id,
          name: folder.name,
          path: folder.path,
          level: folder.level,
          color: folder.color,
        });
        if (folder.children && folder.children.length > 0) {
          flatten(folder.children);
        }
      }
    };

    flatten(folders);
    return result;
  };

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
    }
    setNewTagName("");
    setTagSearchOpen(false);
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const generateAIContent = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL first to generate AI content",
        variant: "destructive",
      });
      return;
    }

    setAiGenerating(true);
    try {
      const response = await fetch("/api/websites/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setTitle(data.title || "");
        setDescription(data.description || "");
        toast({
          title: "AI Content Generated!",
          description:
            "Title and description have been automatically generated",
        });
      } else {
        throw new Error("Failed to generate content");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "AI Generation Failed",
        description:
          "Could not generate content. Please try again or enter manually.",
        variant: "destructive",
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim(),
          description: description.trim(),
          tags: selectedTags,
          scheduledFor: scheduledFor?.toISOString(),
          folderId: selectedFolderId,
        }),
      });

      if (response.status === 409) {
        // URL already exists
        const data = await response.json();
        setExistingWebsite(data.existingWebsite);
        setShowReplaceDialog(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to add website");
      }

      const website = await response.json();

      const folderName = selectedFolderId
        ? availableFolders.find((f) => f._id === selectedFolderId)?.name ||
          "folder"
        : "root";

      toast({
        title: "Website Added!",
        description: `${website.title} has been added to ${folderName}${
          scheduledFor ? " with reminder set" : ""
        }`,
      });

      resetForm();
      onWebsiteAdded();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReplace = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/websites/replace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim(),
          description: description.trim(),
          tags: selectedTags,
          scheduledFor: scheduledFor?.toISOString(),
          replaceId: existingWebsite._id,
          folderId: selectedFolderId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to replace website");
      }

      const website = await response.json();

      toast({
        title: "Website Replaced!",
        description: `${website.title} has been updated in your collection`,
      });

      resetForm();
      setShowReplaceDialog(false);
      onWebsiteAdded();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to replace website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUrl("");
    setTitle("");
    setDescription("");
    setSelectedTags([]);
    setNewTagName("");
    setScheduledFor(undefined);
    setSelectedFolderId(currentFolderId || null);
    setOpen(false);
    setExistingWebsite(null);
  };

  const getTagColor = (tagName: string) => {
    const tag = availableTags.find((t) => t.name === tagName);
    return tag?.color || "#3b82f6";
  };

  const getFolderDisplayName = (folderId: string | null) => {
    if (!folderId) return "Home (Root)";
    const folder = availableFolders.find((f) => f._id === folderId);
    return folder ? folder.path : "Unknown Folder";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center text-white space-x-2 bg-gradient-to-r from-rose-600 to-yellow-600 hover:from-rose-700 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="w-4 h-4" />
            <span>Add Website</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Link className="w-5 h-5" />
              <span>Add New Website</span>
            </DialogTitle>
            <DialogDescription>
              Add any website, YouTube video, Twitter post, or Instagram post.
              Our AI will automatically generate titles and descriptions if you
              don&apos;t provide them.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <div className="flex space-x-2">
                <Input
                  id="url"
                  placeholder="https://example.com or paste any YouTube, Twitter, Instagram link"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={generateAIContent}
                  disabled={aiGenerating || !url.trim()}
                  variant="outline"
                  className="flex items-center space-x-2 bg-transparent"
                >
                  {aiGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">AI Generate</span>
                </Button>
              </div>
            </div>

            {/* Folder Selection */}
            <div className="space-y-2">
              <Label htmlFor="folder">Save to Folder</Label>
              <Select
                value={selectedFolderId || "root"}
                onValueChange={(value) =>
                  setSelectedFolderId(value === "root" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder">
                    <div className="flex items-center space-x-2">
                      {selectedFolderId ? (
                        <Folder
                          className="w-4 h-4"
                          style={{
                            color: availableFolders.find(
                              (f) => f._id === selectedFolderId
                            )?.color,
                          }}
                        />
                      ) : (
                        <Home className="w-4 h-4 text-rose-500" />
                      )}
                      <span>{getFolderDisplayName(selectedFolderId)}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-rose-500" />
                      <span>Home (Root)</span>
                    </div>
                  </SelectItem>
                  {availableFolders.map((folder) => (
                    <SelectItem key={folder._id} value={folder._id}>
                      <div
                        className="flex items-center space-x-2"
                        style={{ paddingLeft: `${folder.level * 16}px` }}
                      >
                        <Folder
                          className="w-4 h-4"
                          style={{ color: folder.color }}
                        />
                        <span>{folder.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Auto-generated if empty"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Auto-generated if empty"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Schedule/Reminder Section */}
            <div className="space-y-3">
              <Label className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Schedule Reminder (Optional)</span>
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !scheduledFor && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledFor
                      ? format(scheduledFor, "PPP")
                      : "Pick a date for reminder"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledFor}
                    onSelect={(date) => {
                      setScheduledFor(date);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {scheduledFor && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    You&apos;ll receive an email reminder on{" "}
                    {format(scheduledFor, "PPP")}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setScheduledFor(undefined)}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Tags</Label>

              {/* Tag Selection */}
              <div className="flex space-x-2">
                <Popover open={tagSearchOpen} onOpenChange={setTagSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={tagSearchOpen}
                      className="flex-1 justify-between bg-transparent"
                    >
                      Select tags...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search tags..."
                        value={newTagName}
                        onValueChange={setNewTagName}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-2">
                            <Button
                              onClick={() => addTag(newTagName)}
                              disabled={!newTagName.trim()}
                              className="w-full"
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Create &quot;{newTagName}&quot;
                            </Button>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {availableTags
                            .filter((tag) => !selectedTags.includes(tag.name))
                            .map((tag) => (
                              <CommandItem
                                key={tag._id}
                                value={tag.name}
                                onSelect={() => addTag(tag.name)}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  <span>{tag.name}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <span>{tag.usageCount}</span>
                                  <Check className="h-4 w-4" />
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center space-x-1 px-3 py-1"
                      style={{
                        backgroundColor: `${getTagColor(tag)}20`,
                        color: getTagColor(tag),
                      }}
                    >
                      <span>{tag}</span>
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* AI Notice */}
            {(!title || !description) && (
              <div className="flex items-center space-x-2 p-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <p className="text-sm text-rose-700 dark:text-rose-300">
                  Empty fields will be automatically filled using AI when you
                  submit
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || aiGenerating}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Website
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Replace Dialog */}
      <AlertDialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Website Already Exists</AlertDialogTitle>
            <AlertDialogDescription>
              This URL already exists in your collection: &quot;
              {existingWebsite?.title}&quot;. Would you like to replace it with
              the new information?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowReplaceDialog(false)}>
              Keep Existing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReplace} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Replacing...
                </>
              ) : (
                "Replace"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
