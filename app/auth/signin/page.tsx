"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Brain, Chrome, Sparkles, User, Shield } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGuestLoading, setIsGuestLoading] = useState(false)
  const [guestName, setGuestName] = useState("")

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push("/")
      }
    }
    checkSession()
  }, [router])

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (error) {
      console.error("Sign in error:", error)
      toast({
        title: "Sign in failed",
        description: "There was an error signing in with Google. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestSignIn = async () => {
    if (!guestName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue as guest.",
        variant: "destructive",
      })
      return
    }

    setIsGuestLoading(true)
    try {
      const result = await signIn("credentials", {
        email: "guest@secondbrain.demo",
        name: guestName.trim(),
        isGuest: "true",
        callbackUrl: "/",
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Guest sign in failed",
          description: "There was an error signing in as guest. Please try again.",
          variant: "destructive",
        })
      } else if (result?.ok) {
        const session = await getSession()
        if (session) {
          router.push("/")
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Guest sign in failed",
        description: "There was an error signing in as guest. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGuestLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <Card className="w-full max-w-md glass-effect shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SecondBrain
            </CardTitle>
            <CardDescription className="text-base mt-2">Your digital knowledge hub awaits</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Welcome back</h3>
            <p className="text-sm text-muted-foreground">
              Sign in to access your curated collection of websites, videos, and insights
            </p>
          </div>

          {/* Google Sign In */}
          <Button
            onClick={handleSignIn}
            disabled={isLoading || isGuestLoading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Chrome className="w-5 h-5" />
                <span>Continue with Google</span>
              </div>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or try without account</span>
            </div>
          </div>

          {/* Guest Sign In */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Demo mode - no personal data required</span>
            </div>

            <Input
              placeholder="Enter your name..."
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="h-12"
              maxLength={50}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleGuestSignIn()
                }
              }}
            />

            <Button
              onClick={handleGuestSignIn}
              disabled={isLoading || isGuestLoading || !guestName.trim()}
              variant="outline"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              {isGuestLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Continue as Guest</span>
                </div>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            <span>Secure authentication powered by NextAuth</span>
          </div>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}
