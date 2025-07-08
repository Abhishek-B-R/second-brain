/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { EnhancedWebsiteCard } from "@/components/enhanced-website-card"
import { EnhancedAddWebsiteDialog } from "@/components/enhanced-add-website-dialog"
import { FolderTree } from "@/components/folder-tree"
import { FolderBreadcrumb } from "@/components/folder-breadcrumb"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import { EditFolderDialog } from "@/components/edit-folder-dialog"
import { MobileFolderOverlay } from "@/components/mobile-folder-overlay"
import { LoadingScreen } from "@/components/loading-screen"
import { Toaster } from "@/components/ui/toaster"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Heart, TrendingUp, Clock, Sparkles, Loader2, FolderPlus, Sidebar, Folder } from "lucide-react"
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
  folderId?: string
}

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

type SortOption = "newest" | "oldest" | "title" | "type" | "views"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [websites, setWebsites] = useState<Website[]>([])
  const [displayedWebsites, setDisplayedWebsites] = useState<Website[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [currentFolderName, setCurrentFolderName] = useState("Home")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileFolderOpen, setMobileFolderOpen] = useState(false)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [createFolderParentId, setCreateFolderParentId] = useState<string | undefined>()
  const [editFolderOpen, setEditFolderOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<FolderNode | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const ITEMS_PER_PAGE = 30
  const [currentPage, setCurrentPage] = useState(1)

  const fetchWebsites = async () => {
    try {
      const params = new URLSearchParams()
      if (filterType !== "all") params.append("type", filterType)
      if (searchTerm) params.append("search", searchTerm)
      if (showFavoritesOnly) params.append("favorites", "true")
      if (currentFolderId) {
        params.append("folderId", currentFolderId)
      } else {
        params.append("folderId", "null")
      }

      const response = await fetch(`/api/websites?${params}`)
      if (response.ok) {
        const data = await response.json()

        // Sort data on client side
        const sortedData = [...data].sort((a, b) => {
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

        setWebsites(sortedData)

        // Implement pagination for large datasets
        if (sortedData.length > ITEMS_PER_PAGE) {
          setDisplayedWebsites(sortedData.slice(0, ITEMS_PER_PAGE))
          setCurrentPage(1)
        } else {
          setDisplayedWebsites(sortedData)
        }
      }
    } catch (error) {
      console.error("Error fetching websites:", error)
    }
  }

  const loadMoreWebsites = () => {
    setLoadingMore(true)
    const nextPage = currentPage + 1
    const startIndex = (nextPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const newWebsites = websites.slice(startIndex, endIndex)

    setTimeout(() => {
      setDisplayedWebsites((prev) => [...prev, ...newWebsites])
      setCurrentPage(nextPage)
      setLoadingMore(false)
    }, 500) // Small delay for better UX
  }

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/landing")
      return
    }

    const initializeData = async () => {
      await fetchWebsites()
      setIsLoading(false)
    }

    initializeData()
  }, [session, status, router])

  useEffect(() => {
    if (!isLoading) {
      fetchWebsites()
    }
  }, [searchTerm, filterType, sortBy, showFavoritesOnly, currentFolderId])

  const handleFolderSelect = (folderId: string | null, folderName: string) => {
    setCurrentFolderId(folderId)
    setCurrentFolderName(folderName)
  }

  const handleCreateFolder = (parentId?: string) => {
    setCreateFolderParentId(parentId)
    setCreateFolderOpen(true)
  }

  const handleEditFolder = (folder: FolderNode) => {
    setEditingFolder(folder)
    setEditFolderOpen(true)
  }

  const handleFolderCreated = () => {
    setRefreshTrigger((prev) => prev + 1) // Trigger refresh
    fetchWebsites()
  }

  const handleFolderUpdated = () => {
    setRefreshTrigger((prev) => prev + 1) // Trigger refresh
    fetchWebsites()
  }

  const handleWebsiteMoved = () => {
    setRefreshTrigger((prev) => prev + 1) // Trigger refresh
    fetchWebsites()
  }

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

      fetchWebsites()
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

      fetchWebsites()
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

  if (status === "loading" || isLoading) {
    return <LoadingScreen />
  }

  if (!session) {
    return null
  }

  const stats = {
    total: websites.length,
    favorites: websites.filter((w) => w.isFavorite).length,
    youtube: websites.filter((w) => w.type === "youtube").length,
    twitter: websites.filter((w) => w.type === "twitter").length,
    instagram: websites.filter((w) => w.type === "instagram").length,
    websites: websites.filter((w) => w.type === "website").length,
  }

  const hasMoreWebsites = websites.length > displayedWebsites.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <Header user={session.user} />

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className={`hidden md:block ${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden`}>
          <div className="min-h-screen h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-border/50 p-3 overflow-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Folders</h2>
                <Button variant="ghost" size="icon" onClick={() => handleCreateFolder()} className="h-7 w-7">
                  <FolderPlus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <FolderTree
                currentFolderId={currentFolderId}
                onFolderSelect={handleFolderSelect}
                onCreateFolder={handleCreateFolder}
                onEditFolder={handleEditFolder}
                onDeleteFolder={() => {
                  setRefreshTrigger((prev) => prev + 1)
                  fetchWebsites()
                }}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header with Breadcrumb */}
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Desktop Sidebar Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden md:flex h-10 w-10"
                  >
                    <Sidebar className="h-5 w-5" />
                  </Button>

                  {/* Mobile Folder Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileFolderOpen(true)}
                    className="md:hidden h-10 w-10"
                  >
                    <Folder className="h-5 w-5" />
                  </Button>

                  <div>
                    <FolderBreadcrumb currentFolderId={currentFolderId} onNavigate={handleFolderSelect} />
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                      {currentFolderName}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 xl:ml-30 max-w-4xl">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Items</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.favorites}</div>
                    <div className="text-sm text-muted-foreground">Favorites</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-500">{stats.youtube}</div>
                    <div className="text-sm text-muted-foreground">YouTube</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500">{stats.twitter}</div>
                    <div className="text-sm text-muted-foreground">Twitter</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-pink-500">{stats.instagram}</div>
                    <div className="text-sm text-muted-foreground">Instagram</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">{stats.websites}</div>
                    <div className="text-sm text-muted-foreground">Websites</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile Folder Overlay - Shows above content */}
            {mobileFolderOpen && (
              <div className="mb-8">
                <MobileFolderOverlay
                  open={mobileFolderOpen}
                  onOpenChange={setMobileFolderOpen}
                  currentFolderId={currentFolderId}
                  onFolderSelect={handleFolderSelect}
                  onCreateFolder={handleCreateFolder}
                  onEditFolder={handleEditFolder}
                  onDeleteFolder={() => {
                    setRefreshTrigger((prev) => prev + 1)
                    fetchWebsites()
                  }}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            )}

            {/* Enhanced Search and Filter Controls */}
            <div className="mb-8 space-y-6">
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 shadow-lg rounded-2xl"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap gap-4 items-center justify-center">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[160px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 shadow-lg">
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
                  <SelectTrigger className="w-[160px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 shadow-lg">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Newest First</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="views">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Most Viewed</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 shadow-lg"
                >
                  <Heart className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                  <span>Favorites</span>
                </Button>

                <EnhancedAddWebsiteDialog onWebsiteAdded={fetchWebsites} currentFolderId={currentFolderId} />
              </div>

              {/* Active Filters */}
              {(searchTerm || filterType !== "all" || showFavoritesOnly) && (
                <div className="flex flex-wrap gap-2 items-center justify-center">
                  <span className="text-sm text-muted-foreground flex items-center space-x-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Active filters:</span>
                  </span>
                  {searchTerm && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => setSearchTerm("")}
                    >
                      Search: {searchTerm} ×
                    </Badge>
                  )}
                  {filterType !== "all" && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => setFilterType("all")}
                    >
                      Type: {filterType} ×
                    </Badge>
                  )}
                  {showFavoritesOnly && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => setShowFavoritesOnly(false)}
                    >
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
            <div className="flex items-center justify-between mb-6">
              <div className="text-lg text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{websites.length}</span> items in{" "}
                <span className="font-semibold text-foreground">{currentFolderName}</span>
              </div>
            </div>

            {/* Enhanced Grid - 4 columns with lazy loading */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayedWebsites.map((website) => (
                <div key={website._id} className="embed-container">
                  <EnhancedWebsiteCard
                    website={website}
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={handleDelete}
                    onWebsiteMoved={handleWebsiteMoved}
                    currentFolderId={currentFolderId}
                  />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreWebsites && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={loadMoreWebsites}
                  disabled={loadingMore}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    <>Load More ({websites.length - displayedWebsites.length} remaining)</>
                  )}
                </Button>
              </div>
            )}

            {/* Enhanced Empty State */}
            {displayedWebsites.length === 0 && (
              <div className="text-center py-20 space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-muted-foreground">
                    {websites.length === 0 && !searchTerm && filterType === "all" && !showFavoritesOnly
                      ? `No content in ${currentFolderName} yet`
                      : "No items found"}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {websites.length === 0 && !searchTerm && filterType === "all" && !showFavoritesOnly
                      ? `Start adding websites, YouTube videos, or social media posts to ${currentFolderName}`
                      : "Try adjusting your search terms or filters to find what you're looking for"}
                  </p>
                </div>
                {websites.length === 0 && !searchTerm && filterType === "all" && !showFavoritesOnly ? (
                  <EnhancedAddWebsiteDialog onWebsiteAdded={fetchWebsites} currentFolderId={currentFolderId} />
                ) : (
                  <Button variant="outline" onClick={clearAllFilters} className="mt-4 bg-transparent">
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        parentId={createFolderParentId}
        parentName={
          createFolderParentId
            ? "Folder" // You might want to fetch the actual parent name
            : undefined
        }
        onFolderCreated={handleFolderCreated}
      />

      {/* Edit Folder Dialog */}
      <EditFolderDialog
        open={editFolderOpen}
        onOpenChange={setEditFolderOpen}
        folder={editingFolder}
        onFolderUpdated={handleFolderUpdated}
      />

      <Toaster />
    </div>
  )
}
