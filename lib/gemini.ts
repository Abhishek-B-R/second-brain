import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateContentSummary(
  url: string,
  type: string,
): Promise<{ title: string; description: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    let prompt = ""

    switch (type) {
      case "youtube":
        prompt = `Analyze this YouTube video URL: ${url}
        
        Please provide:
        1. A concise, engaging title (max 80 characters)
        2. A detailed description (2-3 sentences) explaining what the video is about, key topics covered, and why someone might want to watch it.
        
        Format your response as JSON:
        {
          "title": "Your title here",
          "description": "Your description here"
        }`
        break

      case "twitter":
        prompt = `Analyze this Twitter/X post URL: ${url}
        
        Please provide:
        1. A descriptive title that captures the essence of the tweet (max 80 characters)
        2. A summary description (2-3 sentences) explaining the main point, context, or significance of the tweet.
        
        Format your response as JSON:
        {
          "title": "Your title here",
          "description": "Your description here"
        }`
        break

      case "instagram":
        prompt = `Analyze this Instagram post URL: ${url}
        
        Please provide:
        1. A descriptive title for the Instagram post (max 80 characters)
        2. A description (2-3 sentences) explaining what the post shows, its theme, or message.
        
        Format your response as JSON:
        {
          "title": "Your title here",
          "description": "Your description here"
        }`
        break

      default:
        prompt = `Analyze this website URL: ${url}
        
        Please provide:
        1. A clear, descriptive title for this webpage (max 80 characters)
        2. A comprehensive description (2-3 sentences) explaining what the website/page is about, its main content, and value to readers.
        
        Format your response as JSON:
        {
          "title": "Your title here",
          "description": "Your description here"
        }`
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          title: parsed.title || "Untitled Content",
          description: parsed.description || "No description available",
        }
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON response:", parseError)
    }

    // Fallback: extract title and description from text
    const lines = text.split("\n").filter((line: string) => line.trim())
    return {
      title: lines[0]?.replace(/^["']|["']$/g, "") || "AI Generated Title",
      description:
        lines
          .slice(1)
          .join(" ")
          .replace(/^["']|["']$/g, "") || "AI generated description",
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    return {
      title: "Content Summary",
      description: "Unable to generate summary at this time",
    }
  }
}
