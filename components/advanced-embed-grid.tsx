"use client"

import { cn } from "@/lib/utils"

import { useState, useMemo } from "react"
import { AdvancedEmbedCard } from "./advanced-embed-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Grid3X3, List, Heart, Bookmark, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Website {
  id: string
  type: "youtube" | "twitter" | "instagram" | "website"
  url: string
  title: string
  description: string
  thumbnail: string
  createdAt: Date
  tags?: string[]
  isFavorite?: boolean
  isBookmarked?: boolean
  viewCount?: number
}

interface AdvancedEmbedGridProps {
  websites: Website[]
  onWebsitesChange: (websites: Website[]) => void
}

type SortOption = "newest" | "oldest" | "title" | "type" | "views"
type ViewMode = "grid" | "list"

export function AdvancedEmbedGrid({ websites, onWebsitesChange }: AdvancedEmbedGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false)

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    websites.forEach((website) => {
      website.tags?.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags)
  }, [websites])

  const filteredAndSortedWebsites = useMemo(() => {
    const filtered = websites.filter((website) => {
      const matchesSearch =
        website.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        website.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        website.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesFilter = filterType === "all" || website.type === filterType
      const matchesFavorites = !showFavoritesOnly || website.isFavorite
      const matchesBookmarks = !showBookmarksOnly || website.isBookmarked

      return matchesSearch && matchesFilter && matchesFavorites && matchesBookmarks
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "type":
          return a.type.localeCompare(b.type)
        case "views":
          return (b.viewCount || 0) - (a.viewCount || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [websites, searchTerm, filterType, sortBy, showFavoritesOnly, showBookmarksOnly])

  const handleToggleFavorite = (id: string) => {
    const updatedWebsites = websites.map((website) =>
      website.id === id ? { ...website, isFavorite: !website.isFavorite } : website,
    )
    onWebsitesChange(updatedWebsites)

    const website = websites.find((w) => w.id === id)
    toast({
      title: website?.isFavorite ? "Removed from favorites" : "Added to favorites",
      description: website?.title,
    })
  }

  const handleToggleBookmark = (id: string) => {
    const updatedWebsites = websites.map((website) =>
      website.id === id ? { ...website, isBookmarked: !website.isBookmarked } : website,
    )
    onWebsitesChange(updatedWebsites)

    const website = websites.find((w) => w.id === id)
    toast({
      title: website?.isBookmarked ? "Bookmark removed" : "Bookmarked",
      description: website?.title,
    })
  }

  const handleDelete = (id: string) => {
    const updatedWebsites = websites.filter((website) => website.id !== id)
    onWebsitesChange(updatedWebsites)

    const website = websites.find((w) => w.id === id)
    toast({
      title: "Website deleted",
      description: website?.title,
      variant: "destructive",
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEdit = (id: string) => {
    // Placeholder for edit functionality
    toast({
      title: "Edit functionality",
      description: "Edit feature coming soon!",
    })
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setFilterType("all")
    setShowFavoritesOnly(false)
    setShowBookmarksOnly(false)
    setSortBy("newest")
  }

  return (
    <div className="space-y-6">
      {/* Advanced Search and Filter Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="website">Websites</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="flex items-center space-x-2"
          >
            <Heart className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
            <span>Favorites</span>
          </Button>

          <Button
            variant={showBookmarksOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            className="flex items-center space-x-2"
          >
            <Bookmark className={`w-4 h-4 ${showBookmarksOnly ? "fill-current" : ""}`} />
            <span>Bookmarks</span>
          </Button>

          <div className="flex items-center space-x-1 ml-auto">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || filterType !== "all" || showFavoritesOnly || showBookmarksOnly) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm("")}>
                Search: {searchTerm} ×
              </Badge>
            )}
            {filterType !== "all" && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setFilterType("all")}>
                Type: {filterType} ×
              </Badge>
            )}
            {showFavoritesOnly && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setShowFavoritesOnly(false)}>
                Favorites ×
              </Badge>
            )}
            {showBookmarksOnly && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setShowBookmarksOnly(false)}>
                Bookmarks ×
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedWebsites.length} of {websites.length} items
        </div>
        <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
          <Plus className="w-4 h-4" />
          <span>Add Website</span>
        </Button>
      </div>

      {/* Grid/List View */}
      <div className={cn(viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4")}>
        {filteredAndSortedWebsites.map((website) => (
          <div key={website.id} className="embed-container">
            <AdvancedEmbedCard
              website={website}
              onToggleFavorite={handleToggleFavorite}
              onToggleBookmark={handleToggleBookmark}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedWebsites.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="text-muted-foreground text-lg mb-2">No items found</div>
          <p className="text-sm text-muted-foreground mb-4">Try adjusting your search terms or filters</p>
          <Button variant="outline" onClick={clearAllFilters}>
            Clear all filters
          </Button>
        </div>
      )}

      {/* Popular Tags */}
      {allTags.length > 0 && (
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Popular Tags</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 10).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSearchTerm(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
