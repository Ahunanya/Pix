

"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import DashboardHeader from "@/components/dashboard-header"
import SearchBar from "@/components/search-bar"
import ImageGrid from "@/components/image-grid"
import ImageModal from "@/components/image-model"
import TrendingSection from "@/components/trending-section"
import Collections from "@/components/collections"
import { AdvancedFilterModal } from "@/components/ui/advanced-filter-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { UnsplashImage } from "@/lib/types"
import { unsplashAPI } from "@/lib/unsplash"
import { deepSeekAPI } from "@/lib/deepseek"
import { Button } from "@/components/ui/button"
import { RefreshCw, Grid, TrendingUp, Folder, Sliders } from "lucide-react"
import { toast } from "sonner"
import { useUserStorage } from "@/lib/use-user-storage"

interface FilterState {
  colors: string[]
  orientation: "all" | "landscape" | "portrait" | "squarish"
  moodTags: string[]
}

export default function DashboardPage() {
  const { user } = useUser()
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [currentQuery, setCurrentQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("gallery")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    colors: [],
    orientation: "all",
    moodTags: [],
  })

  // Load initial random images
  useEffect(() => {
    loadRandomImages()
  }, [])

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = getItem("favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [getItem])

  const loadRandomImages = async () => {
    try {
      setLoading(true)
      const randomImages = await unsplashAPI.getRandomPhotos(30)
      setImages(randomImages)
      setCurrentQuery("")
      setFilters({
        colors: [],
        orientation: "all",
        moodTags: [],
      })
    } catch (error) {
      console.error("Error loading images:", error)
      toast.error("Failed to load images. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    try {
      setSearchLoading(true)
      setCurrentQuery(query)
      setPage(1)

      // Get search results
      const searchResults = await unsplashAPI.searchPhotos(query, 1, 30)
      let results = searchResults.results

      // Apply filters
      results = applyFilters(results)

      setImages(results)

      // Get AI suggestions
      const aiSuggestions = await deepSeekAPI.generateSearchSuggestions(query)
      setSuggestions(aiSuggestions)

      // Save search to history
      const savedSearches = getItem("searches")
      const searches = savedSearches ? JSON.parse(savedSearches) : []
      const updatedSearches = [query, ...searches.filter((s: string) => s !== query)].slice(0, 10)
      setItem("searches", updatedSearches)
    } catch (error) {
      console.error("Error searching images:", error)
      toast.error("Failed to search images. Please try again.")
    } finally {
      setSearchLoading(false)
    }
  }

  const applyFilters = (imagesToFilter: UnsplashImage[]): UnsplashImage[] => {
    return imagesToFilter.filter((image) => {
      // Color filter - match multiple colors
      if (filters.colors.length > 0) {
        const colorMap: { [key: string]: string } = {
          red: "#FF0000",
          blue: "#0000FF",
          green: "#00FF00",
          yellow: "#FFFF00",
          purple: "#800080",
          orange: "#FFA500",
          black: "#000000",
          white: "#FFFFFF",
          gray: "#808080",
        }

        const imageColor = image.color?.toUpperCase()
        const matchesColor = filters.colors.some(
          (color) => imageColor === colorMap[color].toUpperCase()
        )

        if (!matchesColor) {
          return false
        }
      }

      // Orientation filter
      if (filters.orientation && filters.orientation !== "all") {
        const ratio = image.width / image.height

        if (filters.orientation === "landscape" && ratio <= 1.2) {
          return false
        }
        if (filters.orientation === "portrait" && ratio >= 0.8) {
          return false
        }
        if (filters.orientation === "squarish" && (ratio < 0.9 || ratio > 1.1)) {
          return false
        }
      }

      // Mood tags filter (mock - in production, use AI image analysis API)
      if (filters.moodTags.length > 0) {
        // Placeholder: real implementation would analyze image and match mood
        return true
      }

      return true
    })
  }

  const handleApplyFilters = async (newFilters: FilterState) => {
    setFilters(newFilters)
    setIsFilterOpen(false)

    try {
      setSearchLoading(true)
      setPage(1)

      let results: UnsplashImage[]
      if (currentQuery) {
        const searchResults = await unsplashAPI.searchPhotos(currentQuery, 1, 30)
        results = searchResults.results
      } else {
        results = await unsplashAPI.getRandomPhotos(30)
      }

      results = applyFilters(results)
      setImages(results)
      toast.success("Filters applied successfully!")
    } catch (error) {
      console.error("Error applying filters:", error)
      toast.error("Failed to apply filters. Please try again.")
    } finally {
      setSearchLoading(false)
    }
  }

  const handleCategorySelect = (category: string) => {
    handleSearch(category)
    setActiveTab("gallery")
  }

  const handleImageClick = (image: UnsplashImage) => {
    setSelectedImage(image)
    setIsModalOpen(true)
  }

  const handleDownload = async (image: UnsplashImage) => {
    try {
      const res = await fetch(image.links.download_location, {
        headers: {
          Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`,
        },
      })
      const data = await res.json()
      const downloadUrl = data.url

      const imgRes = await fetch(downloadUrl)
      const blob = await imgRes.blob()

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `pix-${image.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      const downloads = JSON.parse(localStorage.getItem("pixelvault-downloads") || "[]")
      const updatedDownloads = [
        image.id,
        ...downloads.filter((id: string) => id !== image.id),
      ]
      localStorage.setItem("pixelvault-downloads", JSON.stringify(updatedDownloads))

      toast.success("Your image is being downloaded.")
    } catch (error) {
      console.error("Error downloading image:", error)
      toast.error("Failed to download image. Please try again.")
    }
  }

  const handleFavorite = (image: UnsplashImage) => {
    const isFavorited = favorites.includes(image.id)
    const newFavorites = isFavorited
      ? favorites.filter((id) => id !== image.id)
      : [...favorites, image.id]

    setFavorites(newFavorites)
    localStorage.setItem("pixelvault-favorites", JSON.stringify(newFavorites))

    toast.success(
      isFavorited
        ? "Image removed from your favorites."
        : "Image added to your favorites."
    )
  }

  const loadMoreImages = async () => {
    if (searchLoading) return

    try {
      setSearchLoading(true)
      const nextPage = page + 1

      let newImages: UnsplashImage[]
      if (currentQuery) {
        const searchResults = await unsplashAPI.searchPhotos(currentQuery, nextPage, 30)
        newImages = searchResults.results
      } else {
        newImages = await unsplashAPI.getRandomPhotos(30)
      }

      newImages = applyFilters(newImages)
      setImages((prev) => [...prev, ...newImages])
      setPage(nextPage)
    } catch (error) {
      console.error("Error loading more images:", error)
      toast.error("Failed to load more images.")
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8 relative overflow-x-hidden max-w-full">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="mb-2 mt-5 text-4xl font-bold md:text-6xl xl:text-7xl xl:[line-height:1.125]">
            Welcome back, {user?.firstName || "Explorer"}!
          </h1>
          <p className="text-muted-foreground mb-6">
            Discover amazing images powered by AI. Search, explore, and build your collection.
          </p>

          <SearchBar
            onSearch={handleSearch}
            onCategorySelect={handleCategorySelect}
            loading={searchLoading}
            suggestions={suggestions}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Collections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {currentQuery ? `Results for "${currentQuery}"` : "Discover Images"}
                </h2>
                {currentQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadRandomImages}
                    disabled={loading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Show Random
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Sliders className="h-4 w-4" />
                  Filters
                </Button>
                <div className="text-sm text-muted-foreground">
                  {images.length} images
                </div>
              </div>
            </div>

            {/* Image Grid */}
            <ImageGrid
              images={images}
              loading={loading}
              onImageClick={handleImageClick}
              onDownload={handleDownload}
              onFavorite={handleFavorite}
              favorites={favorites}
            />

            {/* Load More */}
            {images.length > 0 && !loading && (
              <div className="text-center mt-12">
                <Button
                  onClick={loadMoreImages}
                  disabled={searchLoading}
                  size="lg"
                  variant="outline"
                >
                  {searchLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>Load More Images</>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending">
            <TrendingSection
              onImageClick={handleImageClick}
              onCategoryClick={handleCategorySelect}
            />
          </TabsContent>

          <TabsContent value="collections">
            <Collections images={images} />
          </TabsContent>
        </Tabs>

        {/* Image Modal */}
        <ImageModal
          image={selectedImage}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDownload={handleDownload}
          onFavorite={handleFavorite}
          imagesPool={images}
          onOpenImage={(img) => {
            setSelectedImage(img)
            setIsModalOpen(true)
          }}
          isFavorite={selectedImage ? favorites.includes(selectedImage.id) : false}
        />

        {/* Advanced Filter Modal */}
        <AdvancedFilterModal
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onApply={handleApplyFilters}
          currentFilters={filters}
        />
      </main>
    </div>
  )
}