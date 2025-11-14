"use client"

import React, { useState, useEffect } from "react"
import { X, Sliders } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdvancedFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterState) => void
  currentFilters?: FilterState
}

interface FilterState {
  colors: string[]
  orientation: "all" | "landscape" | "portrait" | "squarish"
  moodTags: string[]
}

const defaultFilters: FilterState = {
  colors: [],
  orientation: "all",
  moodTags: [],
}

const COLOR_OPTIONS = [
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

const ORIENTATION_OPTIONS = [
  { label: "All", value: "all" as const },
  { label: "Landscape", value: "landscape" as const },
  { label: "Portrait", value: "portrait" as const },
  { label: "Square", value: "squarish" as const },
]

const MOOD_TAG_OPTIONS = [
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

export const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentFilters = defaultFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)

  // Sync filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters)
    }
  }, [isOpen, currentFilters])

  const handleColorChange = (color: string, isChecked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      colors: isChecked
        ? [...prev.colors, color]
        : prev.colors.filter((c) => c !== color),
    }))
  }

  const handleOrientationChange = (orientation: "all" | "landscape" | "portrait" | "squarish") => {
    setFilters((prev) => ({
      ...prev,
      orientation,
    }))
  }

  const handleMoodTagChange = (tag: string, isChecked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      moodTags: isChecked
        ? [...prev.moodTags, tag]
        : prev.moodTags.filter((t) => t !== tag),
    }))
  }

  const handleClearFilters = () => {
    setFilters(defaultFilters)
  }

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Close filter modal"
      />

      {/* Modal */}
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
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Color Filter Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Dominant Color</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Select one or more colors</p>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value, !filters.colors.includes(color.value))}
                  className={cn(
                    "relative p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1",
                    filters.colors.includes(color.value)
                      ? "border-slate-900 dark:border-white ring-2 ring-slate-900 dark:ring-white"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {filters.colors.includes(color.value) && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-white/90 dark:bg-slate-900/90 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-slate-900 dark:bg-white rounded-full" />
                    </div>
                  )}
                  <span
                    className={cn(
                      "text-xs font-medium text-center",
                      ["white", "yellow"].includes(color.value) ? "text-black" : "text-white"
                    )}
                  >
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Orientation Filter Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Orientation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Select preferred orientation</p>
            <div className="space-y-2">
              {ORIENTATION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                    filters.orientation === option.value
                      ? "border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                  )}
                >
                  <input
                    type="radio"
                    name="orientation"
                    value={option.value}
                    checked={filters.orientation === option.value}
                    onChange={() => handleOrientationChange(option.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mood Tags Filter Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4">AI Mood Tags</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Select multiple mood tags (optional)</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleMoodTagChange(tag, !filters.moodTags.includes(tag))}
                  className={cn(
                    "px-4 py-2 rounded-full font-medium transition-all duration-200 border text-sm",
                    filters.moodTags.includes(tag)
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
          {(filters.colors.length > 0 || filters.orientation !== "all" || filters.moodTags.length > 0) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Active Filters:</p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                {filters.colors.length > 0 && <li>• Colors: {filters.colors.join(", ")}</li>}
                {filters.orientation !== "all" && <li>• Orientation: {filters.orientation}</li>}
                {filters.moodTags.length > 0 && <li>• Moods: {filters.moodTags.join(", ")}</li>}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-3 shrink-0">
          <button
            onClick={handleApply}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-3 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold py-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Clear Filters
          </button>
          <button
            onClick={onClose}
            className="w-full bg-transparent border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-semibold py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}

export default AdvancedFilterModal