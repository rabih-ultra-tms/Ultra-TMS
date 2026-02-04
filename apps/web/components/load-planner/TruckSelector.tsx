'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import type { TruckType, TrailerCategory } from '@/lib/load-planner/types'
import { trucks } from '@/lib/load-planner/trucks'
import { useTruckTypes } from '@/lib/hooks/operations/use-truck-types'
import { truckTypeRecordToTruckType } from '@/lib/load-planner/truck-type-converter'
import { ChevronDown, Check, AlertTriangle, Search, X, Filter, Plus, Star } from 'lucide-react'
import { AddTruckTypeDialog } from './AddTruckTypeDialog'

type SortMode = 'score' | 'length' | 'weight'

interface TruckSelectorProps {
  currentTruck: TruckType
  onChange: (truck: TruckType) => void
  itemsWeight: number
  maxItemLength: number
  maxItemWidth: number
  maxItemHeight: number
  currentScore?: number
  itemDescriptions?: string[]
}

const FAVORITES_KEY = 'load-planner-favorite-trucks'

function computeTruckScore(
  truck: TruckType,
  itemsWeight: number,
  maxItemLength: number,
  maxItemWidth: number,
  maxItemHeight: number,
  itemDescriptions: string[]
): number {
  let score = 100

  const fitsWeight = itemsWeight <= truck.maxCargoWeight
  const fitsLength = maxItemLength <= truck.deckLength
  const fitsWidth = maxItemWidth <= truck.deckWidth
  const fitsHeight = maxItemHeight <= truck.maxLegalCargoHeight
  const fits = fitsWeight && fitsLength && fitsWidth && fitsHeight

  if (!fits) score -= 50
  if (!fitsHeight) {
    const excess = maxItemHeight - truck.maxLegalCargoHeight
    score -= Math.min(40, Math.round(excess * 10))
  }
  if (!fitsWidth) {
    const excess = maxItemWidth - truck.deckWidth
    score -= Math.min(25, Math.round(excess * 5))
  }
  if (!fitsWeight) {
    const excessPct = ((itemsWeight - truck.maxCargoWeight) / truck.maxCargoWeight) * 100
    score -= Math.min(30, Math.round(excessPct))
  }

  const heightClearance = truck.maxLegalCargoHeight - maxItemHeight
  if (heightClearance > 3) score -= 10
  if (heightClearance >= 0 && heightClearance <= 1) score += 5

  const descText = itemDescriptions.join(' ').toLowerCase()
  if (descText.match(/excavator|dozer|loader|tracked/) && ['RGN', 'LOWBOY'].includes(truck.category)) score += 15
  if (descText.match(/wind.*blade|blade/) && truck.category === 'BLADE') score += 15
  if (descText.match(/transformer|heavy/) && ['MULTI_AXLE', 'SCHNABEL'].includes(truck.category)) score += 15
  if (descText.match(/forklift|pallet|crate/) && ['FLATBED', 'DRY_VAN'].includes(truck.category)) score += 10
  if (truck.loadingMethod === 'drive-on' && descText.match(/excavator|dozer|loader|tractor|tracked/)) score += 10

  return Math.max(0, Math.min(100, Math.round(score)))
}

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-green-100 text-green-700'
  if (score >= 60) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

export function TruckSelector({
  currentTruck,
  onChange,
  itemsWeight,
  maxItemLength,
  maxItemWidth,
  maxItemHeight,
  currentScore,
  itemDescriptions = []
}: TruckSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyFitting, setShowOnlyFitting] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('score')
  const [categoryFilter, setCategoryFilter] = useState<TrailerCategory | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { data: truckTypesResponse } = useTruckTypes({ includeInactive: false, limit: 200 })

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(FAVORITES_KEY) : null
    if (stored) {
      try {
        setFavoriteIds(new Set(JSON.parse(stored)))
      } catch {
        setFavoriteIds(new Set())
      }
    }
  }, [])

  const persistFavorites = (next: Set<string>) => {
    setFavoriteIds(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(next)))
    }
  }

  const toggleFavorite = (truckId: string) => {
    const next = new Set(favoriteIds)
    if (next.has(truckId)) {
      next.delete(truckId)
    } else {
      next.add(truckId)
    }
    persistFavorites(next)
  }

  const allTrucks = useMemo(() => {
    const dbTrucks = (truckTypesResponse?.data || []).map(truckTypeRecordToTruckType)
    const hardcodedNames = new Set(trucks.map(t => t.name.toLowerCase()))
    const customDbTrucks = dbTrucks.filter(t => !hardcodedNames.has(t.name.toLowerCase()))
    return [...trucks, ...customDbTrucks]
  }, [truckTypesResponse])

  const truckScores = useMemo(() => {
    const scores = new Map<string, number>()
    allTrucks.forEach(truck => {
      scores.set(truck.id, computeTruckScore(truck, itemsWeight, maxItemLength, maxItemWidth, maxItemHeight, itemDescriptions))
    })
    return scores
  }, [allTrucks, itemsWeight, maxItemLength, maxItemWidth, maxItemHeight, itemDescriptions])

  const bestScore = useMemo(() => {
    let max = 0
    truckScores.forEach(s => { if (s > max) max = s })
    return max
  }, [truckScores])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
    if (!isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const canHandle = (truck: TruckType) => {
    const fitsWeight = itemsWeight <= truck.maxCargoWeight
    const fitsLength = maxItemLength <= truck.deckLength
    const fitsWidth = maxItemWidth <= truck.deckWidth
    const fitsHeight = maxItemHeight <= truck.maxLegalCargoHeight

    return {
      fits: fitsWeight && fitsLength && fitsWidth && fitsHeight,
      fitsWeight,
      fitsLength,
      fitsWidth,
      fitsHeight
    }
  }

  const categorizedTrucks = useMemo(() => {
    const categories: Record<string, TruckType[]> = {}
    const query = searchQuery.toLowerCase().trim()

    allTrucks.forEach(truck => {
      if (query) {
        const matchesSearch =
          truck.name.toLowerCase().includes(query) ||
          truck.category.toLowerCase().includes(query) ||
          truck.description.toLowerCase().includes(query) ||
          truck.bestFor.some(b => b.toLowerCase().includes(query))

        if (!matchesSearch) return
      }

      if (showOnlyFitting) {
        const fit = canHandle(truck)
        if (!fit.fits) return
      }

      if (categoryFilter && truck.category !== categoryFilter) return

      const category = truck.category
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(truck)
    })

    Object.keys(categories).forEach(cat => {
      categories[cat].sort((a, b) => {
        if (sortMode === 'score') return (truckScores.get(b.id) || 0) - (truckScores.get(a.id) || 0)
        if (sortMode === 'weight') return b.maxCargoWeight - a.maxCargoWeight
        return a.deckLength - b.deckLength
      })

      categories[cat].sort((a, b) => {
        const aFav = favoriteIds.has(a.id)
        const bFav = favoriteIds.has(b.id)
        if (aFav === bFav) return 0
        return aFav ? -1 : 1
      })
    })

    return categories
  }, [searchQuery, showOnlyFitting, categoryFilter, sortMode, allTrucks, truckScores, favoriteIds, itemsWeight, maxItemLength, maxItemWidth, maxItemHeight])

  const matchingTruckCount = useMemo(() => {
    return Object.values(categorizedTrucks).reduce((sum, trucks) => sum + trucks.length, 0)
  }, [categorizedTrucks])

  const categoryNames: Record<TrailerCategory, string> = {
    FLATBED: 'Flatbed Trailers',
    STEP_DECK: 'Step Deck Trailers',
    RGN: 'RGN (Removable Gooseneck)',
    LOWBOY: 'Lowboy Trailers',
    DOUBLE_DROP: 'Double Drop Trailers',
    LANDOLL: 'Landoll / Tilt Trailers',
    CONESTOGA: 'Conestoga (Covered Flatbed)',
    DRY_VAN: 'Dry Van',
    REEFER: 'Refrigerated',
    CURTAIN_SIDE: 'Curtain Side',
    MULTI_AXLE: 'Multi-Axle Heavy Haul',
    SCHNABEL: 'Schnabel',
    PERIMETER: 'Perimeter Trailers',
    STEERABLE: 'Steerable Trailers',
    BLADE: 'Blade Trailers',
    TANKER: 'Tank Trailers',
    HOPPER: 'Hopper Trailers',
    SPECIALIZED: 'Specialized Trailers',
  }

  const categoryShortNames: Partial<Record<TrailerCategory, string>> = {
    FLATBED: 'Flatbed',
    STEP_DECK: 'Step Deck',
    RGN: 'RGN',
    LOWBOY: 'Lowboy',
    DOUBLE_DROP: 'Double Drop',
    MULTI_AXLE: 'Multi-Axle',
    DRY_VAN: 'Dry Van',
    CONESTOGA: 'Conestoga',
  }

  const categoryOrder: TrailerCategory[] = [
    'FLATBED',
    'STEP_DECK',
    'RGN',
    'LOWBOY',
    'DOUBLE_DROP',
    'MULTI_AXLE',
    'LANDOLL',
    'CONESTOGA',
    'DRY_VAN',
    'REEFER',
    'CURTAIN_SIDE',
    'SCHNABEL',
    'PERIMETER',
    'STEERABLE',
    'BLADE',
    'TANKER',
    'HOPPER',
    'SPECIALIZED'
  ]

  const currentFit = canHandle(currentTruck)
  const currentTruckScore = currentScore ?? (truckScores.get(currentTruck.id) || 0)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-3 rounded-lg border
          transition-colors text-left
          ${!currentFit.fits
            ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100'
            : 'border-gray-300 bg-white hover:bg-gray-50'}
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            ${!currentFit.fits ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-100 text-blue-800'}
          `}>
            {!currentFit.fits ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{currentTruck.name}</span>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${getScoreColor(currentTruckScore)}`}>
                {currentTruckScore}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {currentTruck.deckLength}&apos; x {currentTruck.deckWidth}&apos; &bull; {(currentTruck.maxCargoWeight / 1000).toFixed(0)}k lbs max
            </div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {!currentFit.fits && (
        <div className="mt-2 text-xs text-yellow-700 space-y-0.5">
          {!currentFit.fitsWeight && <div>&bull; Weight exceeds capacity ({(itemsWeight / 1000).toFixed(1)}k lbs &gt; {(currentTruck.maxCargoWeight / 1000).toFixed(0)}k lbs)</div>}
          {!currentFit.fitsLength && <div>&bull; Item too long ({maxItemLength.toFixed(1)}&apos; &gt; {currentTruck.deckLength}&apos;)</div>}
          {!currentFit.fitsWidth && <div>&bull; Item too wide ({maxItemWidth.toFixed(1)}&apos; &gt; {currentTruck.deckWidth}&apos;)</div>}
          {!currentFit.fitsHeight && <div>&bull; Item too tall ({maxItemHeight.toFixed(1)}&apos; &gt; {currentTruck.maxLegalCargoHeight}&apos;)</div>}
        </div>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col"
            style={{ maxHeight: '32rem' }}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-2 space-y-2 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search trucks by name, type, or use..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowOnlyFitting(!showOnlyFitting)}
                    className={`
                      flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors
                      ${showOnlyFitting
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    `}
                  >
                    <Filter className="w-3 h-3" />
                    {showOnlyFitting ? 'Fitting only' : 'All'}
                  </button>

                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                    {(['score', 'length', 'weight'] as SortMode[]).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSortMode(mode)}
                        className={`px-2 py-1 text-xs transition-colors ${
                          sortMode === mode
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {mode === 'score' ? 'Score' : mode === 'length' ? 'Length' : 'Weight'}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {matchingTruckCount} found
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setCategoryFilter(null)}
                  className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                    categoryFilter === null
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {Object.entries(categoryShortNames).map(([cat, name]) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat as TrailerCategory)}
                    className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                      categoryFilter === cat
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {matchingTruckCount === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No trucks match your search</p>
                  {showOnlyFitting && (
                    <button
                      type="button"
                      onClick={() => setShowOnlyFitting(false)}
                      className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                      Try showing all trucks
                    </button>
                  )}
                </div>
              ) : (
                categoryOrder.map(category => {
                  const trucksInCategory = categorizedTrucks[category]
                  if (!trucksInCategory || trucksInCategory.length === 0) return null

                  return (
                    <div key={category}>
                      <div className="sticky top-0 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                        {categoryNames[category] || category}
                      </div>
                      {trucksInCategory.map(truck => {
                        const fit = canHandle(truck)
                        const isSelected = truck.id === currentTruck.id
                        const score = truckScores.get(truck.id) || 0
                        const isBestMatch = score === bestScore && bestScore >= 60
                        const isFavorite = favoriteIds.has(truck.id)

                        return (
                          <div
                            key={truck.id}
                            className={`
                              w-full flex items-center justify-between px-4 py-2.5 text-left
                              transition-colors
                              ${isSelected ? 'bg-blue-50' : isBestMatch ? 'bg-green-50/50 hover:bg-green-50' : 'hover:bg-gray-50'}
                              ${!fit.fits ? 'opacity-75' : ''}
                            `}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onChange(truck)
                                setIsOpen(false)
                              }}
                              className="flex items-center gap-3 flex-1 min-w-0"
                            >
                              <div className={`
                                w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0
                                ${isSelected
                                  ? 'bg-blue-500 text-white'
                                  : fit.fits
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-yellow-100 text-yellow-600'}
                              `}>
                                {isSelected ? <Check className="w-4 h-4" /> : fit.fits ? '✓' : '!'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm ${isSelected ? 'font-medium text-blue-900' : 'text-gray-900'}`}>
                                    {truck.name}
                                  </span>
                                  {isBestMatch && !isSelected && (
                                    <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
                                      <Star className="w-3 h-3 fill-green-500" />
                                      Best
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {truck.deckLength}&apos; x {truck.deckWidth}&apos; x {truck.maxLegalCargoHeight}&apos;
                                  &bull; {(truck.maxCargoWeight / 1000).toFixed(0)}k lbs
                                </div>
                                {truck.bestFor.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {truck.bestFor.slice(0, 2).map((tag, i) => (
                                      <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </button>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <button
                                type="button"
                                onClick={() => toggleFavorite(truck.id)}
                                className={`p-1 rounded ${isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                                title={isFavorite ? 'Remove favorite' : 'Add to favorites'}
                              >
                                <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400' : ''}`} />
                              </button>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${getScoreColor(score)}`}>
                                  {score}
                                </span>
                                <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      score >= 80 ? 'bg-green-500' :
                                      score >= 60 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                              </div>
                              {!fit.fits && (
                                <div className="text-[10px] text-yellow-600 text-right max-w-[4rem]">
                                  {!fit.fitsWeight && 'Weight '}
                                  {!fit.fitsLength && 'Length '}
                                  {!fit.fitsWidth && 'Width '}
                                  {!fit.fitsHeight && 'Height'}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>

            <div className="sticky bottom-0 border-t border-gray-200 bg-white p-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setShowAddDialog(true)
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Custom Truck Type
              </button>
            </div>
          </div>
        </>
      )}

      <AddTruckTypeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onCreated={(truck) => {
          onChange(truck)
        }}
      />
    </div>
  )
}
