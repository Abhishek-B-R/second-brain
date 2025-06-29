export interface MicrolinkResponse {
  status: string
  data: {
    title?: string
    description?: string
    image?: {
      url: string
      width: number
      height: number
    }
    logo?: {
      url: string
    }
    url: string
    lang?: string
    author?: string
    date?: string
    publisher?: string
  }
}

export async function fetchWebsiteMetadata(url: string): Promise<MicrolinkResponse | null> {
  try {
    const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&insights=true`

    const response = await fetch(microlinkUrl, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Microlink API error: ${response.status}`)
    }

    const data: MicrolinkResponse = await response.json()
    return data
  } catch (error) {
    console.error("Microlink API error:", error)
    return null
  }
}

export function extractMetadataFromMicrolink(data: MicrolinkResponse | null) {
  if (!data || data.status !== "success") {
    return {
      title: "",
      description: "",
      thumbnail: "",
      author: "",
      publisher: "",
    }
  }

  return {
    title: data.data.title || "",
    description: data.data.description || "",
    thumbnail: data.data.image?.url || "",
    author: data.data.author || "",
    publisher: data.data.publisher || "",
  }
}
