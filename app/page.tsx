"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { WebsitesGrid } from "@/components/websites-grid"
import { LoadingScreen } from "@/components/loading-screen"
import { Toaster } from "@/components/ui/toaster"

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

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [websites, setWebsites] = useState<Website[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchWebsites = async () => {
    try {
      const response = await fetch("/api/websites")
      if (response.ok) {
        const data = await response.json()
        setWebsites(data)
      }
    } catch (error) {
      console.error("Error fetching websites:", error)
    }
  }

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    const initializeData = async () => {
      await fetchWebsites()
      setIsLoading(false)
    }

    initializeData()
  }, [session, status, router])

  if (status === "loading" || isLoading) {
    return <LoadingScreen />
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <Header user={session.user || { name: null, email: null, image: null }} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Your Digital Knowledge Hub
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover, organize, and revisit your curated collection of insights from across the web. Your personal
              library of knowledge, beautifully organized.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{websites.length} Total Items</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>{websites.filter((w) => w.isFavorite).length} Favorites</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{websites.filter((w) => w.type === "youtube").length} YouTube Videos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>{websites.filter((w) => w.type === "twitter").length} Twitter Posts</span>
            </div>
          </div>
        </div>

        <WebsitesGrid websites={websites} onWebsitesChange={fetchWebsites} />
      </main>
      <Toaster />
    </div>
  )
}
