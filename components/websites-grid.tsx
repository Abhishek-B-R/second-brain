"use client"

import { useState, useMemo } from "react"
import { WebsiteCard } from "./website-card"
import { AddWebsiteDialog } from "./add-website-dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Heart } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Website {
  _id: string
  type: "youtube" | "twitter" | "instagram" | "website"
  url: string
  title: string
  description: string
  thumbnail: string
  tags: string[]
  isFavorite: boolean
  viewCount: number
  embedId?: string
  createdAt: string
}

interface WebsitesGridProps {
  websites: Website[]
  onWebsitesChange: () => void
}

type SortOption = "newest" | "oldest" | "title" | "type" | "views"

export function WebsitesGrid({ websites, onWebsitesChange }: WebsitesGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const filteredAndSortedWebsites = useMemo(() => {
    const filtered = websites.filter((website) => {
      const matchesSearch =
        website.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        website.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        website.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesFilter = filterType === "all" || website.type === filterType
      const matchesFavorites = !showFavoritesOnly || website.isFavorite

      return matchesSearch && matchesFilter && matchesFavorites
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
  }, [websites, searchTerm, filterType, sortBy, showFavoritesOnly])

  const handleToggleFavorite = async (id: string) => {
    try {
      const website = websites.find((w) => w._id === id)
      const response = await fetch(`/api/websites/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isFavorite: !website?.isFavorite,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update favorite")
      }

      toast({
        title: website?.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: website?.title,
      })

      onWebsitesChange()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/websites/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete website")
      }

      const website = websites.find((w) => w._id === id)
      toast({
        title: "Website deleted",
        description: website?.title,
        variant: "destructive",
      })

      onWebsitesChange()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete website",
        variant: "destructive",
      })
    }
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setFilterType("all")
    setShowFavoritesOnly(false)
    setSortBy("newest")
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
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

          <div className="ml-auto">
            <AddWebsiteDialog onWebsiteAdded={onWebsitesChange} />
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || filterType !== "all" || showFavoritesOnly) && (
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
      </div>

      {/* Grid - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedWebsites.map((website) => (
          <div key={website._id} className="embed-container">
            <WebsiteCard website={website} onToggleFavorite={handleToggleFavorite} onDelete={handleDelete} />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedWebsites.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="text-muted-foreground text-lg mb-2">
            {websites.length === 0 ? "No websites added yet" : "No items found"}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {websites.length === 0
              ? "Start building your digital knowledge hub by adding your first website"
              : "Try adjusting your search terms or filters"}
          </p>
          {websites.length === 0 ? (
            <AddWebsiteDialog onWebsiteAdded={onWebsitesChange} />
          ) : (
            <Button variant="outline" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
