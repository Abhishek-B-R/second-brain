"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
  Brain,
  Chrome,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  Check,
  Star,
  Download,
  Globe,
  Heart,
  Search,
  Calendar,
  MessageCircle,
  Instagram,
  Youtube,
  ExternalLink,
} from "lucide-react"
import { signIn } from "next-auth/react"
import { Header } from "@/components/header"

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (session) {
      router.push("/")
    }
  }, [session, status, router])

  const handleGetStarted = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Organization",
      description: "Automatically categorize and tag your content with advanced AI",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Chrome,
      title: "Chrome Extension",
      description: "One-click capture of any website directly from your browser",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Find anything instantly with intelligent search across all your content",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Calendar,
      title: "Smart Reminders",
      description: "Schedule email reminders to revisit important content",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Heart,
      title: "Favorites & Tags",
      description: "Organize with favorites, custom tags, and smart filtering",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and stored securely with Google OAuth",
      color: "from-indigo-500 to-purple-500",
    },
  ]

  const contentTypes = [
    { icon: Youtube, label: "YouTube Videos", color: "text-red-500" },
    { icon: MessageCircle, label: "Twitter Posts", color: "text-blue-500" },
    { icon: Instagram, label: "Instagram Posts", color: "text-pink-500" },
    { icon: Globe, label: "Websites", color: "text-green-500" },
  ]

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading...
            </h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <Header user={{ name: null, email: null, image: null }} />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-8"
        >
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Brain className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Knowledge Management
              </Badge>

              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Your Digital
                <br />
                <span className="relative text-black dark:text-white">
                  Second Brain
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Capture, organize, and rediscover your digital knowledge with AI-powered intelligence. Never lose track
                of important content again.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Getting Started...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Start Your Journey</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>

              <Button
                variant="outline"
                className="px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-purple-200 hover:border-purple-400 bg-white/80 backdrop-blur-sm"
                onClick={() => window.open("https://github.com/Abhishek-B-R/second-brain-chrome-extension", "_blank")}
              >
                <Chrome className="w-5 h-5 mr-2" />
                Get Chrome Extension
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 pt-8 opacity-70">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">Lightning Fast</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
        </motion.div>
      </section>

      {/* Chrome Extension Spotlight */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge className="bg-white/20 text-white border-0 px-4 py-2">
                    <Chrome className="w-4 h-4 mr-2" />
                    Chrome Extension
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                    Capture Content
                    <br />
                    <span className="text-yellow-300">Instantly</span>
                  </h2>
                  <p className="text-xl text-blue-100 leading-relaxed">
                    Our powerful Chrome extension automatically captures and saves any website you visit with just one
                    click. No more copy-pasting URLs or losing track of important content.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg">One-click capture from any website</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg">Automatic AI-powered categorization</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg">Smart duplicate detection</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg">Seamless sync with your dashboard</span>
                  </div>
                </div>

                <Button
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open("https://github.com/Abhishek-B-R/second-brain-chrome-extension", "_blank")}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Install Extension
                </Button>
              </div>

              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                        <Chrome className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">SecondBrain Extension</h3>
                        <p className="text-blue-100">Auto-capture websites</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Globe className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">Website Detected</p>
                            <p className="text-sm text-blue-100">AI analyzing content...</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">Content Processed</p>
                            <p className="text-sm text-blue-100">Tags and description generated</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">Saved to SecondBrain</p>
                            <p className="text-sm text-blue-100">Ready for discovery</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <div className="container mx-auto px-4">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Powerful Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to build and maintain your digital knowledge base
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700"
                  >
                    <CardContent className="p-8 text-center space-y-4">
                      <div
                        className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Content Types */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Support for All Content Types
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Seamlessly capture and organize content from your favorite platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {contentTypes.map((type, index) => (
              <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 dark:bg-gray-800 dark:border-gray-700"
              >
                <CardContent className="p-6 text-center space-y-4">
                  <type.icon className={`w-12 h-12 mx-auto ${type.color} group-hover:scale-110 transition-transform`} />
                  <h3 className="font-semibold">{type.label}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to Build Your Second Brain?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join thousands of users who have transformed how they manage digital knowledge
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Starting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>

            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 bg-transparent"
              onClick={() => window.open("https://github.com/Abhishek-B-R/second-brain-chrome-extension", "_blank")}
              >
              <Chrome className="w-5 h-5 mr-2" />
              Install Extension
            </Button>
          </div>
        </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">SecondBrain</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>© 2025 SecondBrain. All rights reserved.</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => window.open("https://github.com/Abhishek-B-R/second-brain-chrome-extension", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
