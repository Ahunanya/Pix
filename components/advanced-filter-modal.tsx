"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Sliders } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FilterOptions {
  colors: string[]
  orientation: "all" | "landscape" | "portrait" | "squarish"
  moodTags: string[]
}

interface AdvancedFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterOptions) => void
  currentFilters?: FilterOptions
}

const MOOD_TAGS = [
  "Minimalist",
  "Moody",
  "Vibrant",
  "Calm",
  "Energetic",
  "Dark",
  "Bright",
  "Nature",
  "Urban",
  "Abstract",
]

const COLOR_PALETTES = [
  { name: "Red", value: "red", hex: "#FF0000" },
  { name: "Blue", value: "blue", hex: "#0000FF" },
  { name: "Green", value: "green", hex: "#00FF00" },
  { name: "Yellow", value: "yellow", hex: "#FFFF00" },
  { name: "Purple", value: "purple", hex: "#800080" },
  { name: "Orange", value: "orange", hex: "#FFA500" },
  { name: "Black", value: "black", hex: "#000000" },
  { name: "White", value: "white", hex: "#FFFFFF" },
  { name: "Gray", value: "gray", hex: "#808080" },
]

const ORIENTATIONS = [
  { label: "All", value: "all" },
  { label: "Landscape", value: "landscape" },
  { label: "Portrait", value: "portrait" },
  { label: "Square", value: "squarish" },
]

const defaultFilters: FilterOptions = {
  colors: [],
  orientation: "all",
  moodTags: [],
}

export default function AdvancedFilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilters = defaultFilters,
}: AdvancedFilterModalProps) {
  const [tempFilters, setTempFilters] = useState<FilterOptions>(defaultFilters)

  useEffect(() => {
    if (isOpen) {
      setTempFilters(currentFilters)
    }
  }, [isOpen, currentFilters])

  const handleColorToggle = (colorValue: string) => {
    setTempFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(colorValue)
        ? prev.colors.filter((c) => c !== colorValue)
        : [...prev.colors, colorValue],
    }))
  }

  const handleOrientationSelect = (orientation: "all" | "landscape" | "portrait" | "squarish") => {
    setTempFilters((prev) => ({
      ...prev,
      orientation,
    }))
  }

  const handleMoodTagToggle = (tag: string) => {
    setTempFilters((prev) => ({
      ...prev,
      moodTags: prev.moodTags.includes(tag)
        ? prev.moodTags.filter((t) => t !== tag)
        : [...prev.moodTags, tag],
    }))
  }

  const handleReset = () => {
    setTempFilters(defaultFilters)
  }

  const handleApply = () => {
    onApply(tempFilters)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close filter modal"
      />

      {/* Modal/Sidebar */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white dark:bg-slate-950 shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sliders className="h-6 w-6" />
            Advanced Filters
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Color Palettes Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Color Palette</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Select one or more dominant colors
            </p>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_PALETTES.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorToggle(color.value)}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1",
                    tempFilters.colors.includes(color.value)
                      ? "border-slate-900 dark:border-white ring-2 ring-slate-900 dark:ring-white"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                  )}
                  style={{
                    backgroundColor: color.hex,
                  }}
                  title={color.name}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      ["white", "yellow"].includes(color.value) ? "text-black" : "text-white"
                    )}
                  >
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Orientation Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Image Orientation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Select preferred orientation
            </p>
            <div className="space-y-2">
              {ORIENTATIONS.map((orientation) => (
                <button
                  key={orientation.value}
                  onClick={() =>
                    handleOrientationSelect(orientation.value as "all" | "landscape" | "portrait" | "squarish")
                  }
                  className={cn(
                    "w-full p-3 rounded-lg border-2 transition-all duration-200 text-left font-medium flex items-center gap-3",
                    tempFilters.orientation === orientation.value
                      ? "border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      tempFilters.orientation === orientation.value
                        ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white"
                        : "border-slate-300 dark:border-slate-600"
                    )}
                  >
                    {tempFilters.orientation === orientation.value && (
                      <div className="w-2 h-2 bg-white dark:bg-slate-900 rounded-full" />
                    )}
                  </div>
                  {orientation.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Tags Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">AI Mood Tags</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Select multiple mood tags (optional)
            </p>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleMoodTagToggle(tag)}
                  className={cn(
                    "px-4 py-2 rounded-full font-medium transition-all duration-200 border text-sm",
                    tempFilters.moodTags.includes(tag)
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                      : "bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {(tempFilters.colors.length > 0 ||
            tempFilters.orientation !== "all" ||
            tempFilters.moodTags.length > 0) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Active Filters:</p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                {tempFilters.colors.length > 0 && (
                  <li>• Colors: {tempFilters.colors.join(", ")}</li>
                )}
                {tempFilters.orientation !== "all" && (
                  <li>• Orientation: {tempFilters.orientation}</li>
                )}
                {tempFilters.moodTags.length > 0 && (
                  <li>• Moods: {tempFilters.moodTags.join(", ")}</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-3 shrink-0">
          <Button onClick={handleApply} className="w-full" size="lg">
            Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full" size="lg">
            Reset All
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full" size="lg">
            Cancel
          </Button>
        </div>
      </div>
    </>
  )
}