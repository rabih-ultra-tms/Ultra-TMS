'use client'

import { useState } from 'react'
import type { TruckType, LoadItem, ItemPlacement } from '@/lib/load-planner/types'
import { getItemColor, getItemColorConfig, ITEM_COLOR_CONFIG } from './LoadPlanVisualizer'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

interface TrailerDiagramProps {
  truck: TruckType
  items: LoadItem[]
  placements: ItemPlacement[]
}

export function TrailerDiagram({ truck, items, placements }: TrailerDiagramProps) {
  const [scale, setScale] = useState(10)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const SCALE = scale
  const PADDING = 20

  const deckLength = truck.deckLength
  const deckWidth = truck.deckWidth
  const maxLegalHeight = 13.5

  const topViewWidth = deckLength * SCALE + PADDING * 2
  const topViewHeight = deckWidth * SCALE + PADDING * 2
  const sideViewWidth = deckLength * SCALE + PADDING * 2
  const sideViewHeight = maxLegalHeight * SCALE + PADDING * 2

  const getPlacement = (itemId: string) => placements.find(p => p.itemId === itemId)

  const handleZoomIn = () => setScale(s => Math.min(s + 2, 16))
  const handleZoomOut = () => setScale(s => Math.max(s - 2, 6))
  const handleResetZoom = () => setScale(10)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Reset zoom"
          >
            <Maximize2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-xs text-gray-400 ml-2">{scale}px/ft</span>
        </div>
        <div className="text-xs text-gray-500">
          {items.length} item{items.length !== 1 ? 's' : ''} placed
          {placements.some(p => p.failed) && (
            <span className="text-red-600 ml-1">
              ({placements.filter(p => p.failed).length} need manual arrangement)
            </span>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => {
            const placement = getPlacement(item.id)
            const isFailed = placement?.failed === true
            return (
              <div
                key={item.id}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer
                  transition-all border
                  ${hoveredItem === item.id ? 'ring-2 ring-blue-400 border-blue-300' : 'border-transparent'}
                  ${isFailed ? 'bg-red-50' : ''}
                `}
                style={isFailed ? undefined : { backgroundColor: `${getItemColor(index)}15` }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div
                  className="w-4 h-4 rounded flex-shrink-0"
                  style={{ backgroundColor: isFailed ? '#dc2626' : getItemColor(index) }}
                />
                <div className="flex flex-col gap-0.5">
                  <span className={isFailed ? 'text-red-800 font-medium' : 'text-gray-800 font-medium'}>
                    {item.description}
                    {isFailed && <span className="ml-1 text-red-600">(not placed)</span>}
                  </span>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>{item.length}&apos; × {item.width}&apos; × {item.height}&apos;</span>
                    <span className="text-gray-300">•</span>
                    <span>{item.weight.toLocaleString()} lbs</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">Top View (Looking Down)</h4>
        <div className="bg-gray-100 rounded-lg p-2 overflow-x-auto">
          <svg
            width={topViewWidth + 40}
            height={topViewHeight}
            viewBox={`0 0 ${topViewWidth + 40} ${topViewHeight}`}
            className="mx-auto"
          >
            <defs>
              <linearGradient id="deckGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e5e7eb" />
                <stop offset="50%" stopColor="#f3f4f6" />
                <stop offset="100%" stopColor="#d1d5db" />
              </linearGradient>

              <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9ca3af" />
                <stop offset="40%" stopColor="#6b7280" />
                <stop offset="100%" stopColor="#4b5563" />
              </linearGradient>

              <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.15" />
              </filter>

              {ITEM_COLOR_CONFIG.map((color, i) => (
                <linearGradient key={`itemGrad-${i}`} id={`itemGradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={color.light} />
                  <stop offset="50%" stopColor={color.base} />
                  <stop offset="100%" stopColor={color.dark} />
                </linearGradient>
              ))}

              <pattern id="failedHatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#dc2626" strokeWidth="2" opacity="0.4" />
              </pattern>
              <linearGradient id="failedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="50%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>

            <g filter="url(#dropShadow)">
              <rect
                x={PADDING}
                y={PADDING}
                width={deckLength * SCALE}
                height={deckWidth * SCALE}
                fill="url(#deckGradient)"
                stroke="#6b7280"
                strokeWidth="2"
                rx="3"
              />
              <rect
                x={PADDING + 3}
                y={PADDING + 3}
                width={deckLength * SCALE - 6}
                height={deckWidth * SCALE - 6}
                fill="none"
                stroke="#9ca3af"
                strokeWidth="1"
                rx="2"
                opacity="0.4"
              />
            </g>

            {Array.from({ length: Math.floor(deckLength / 5) + 1 }).map((_, i) => (
              <g key={`grid-${i}`}>
                <line
                  x1={PADDING + i * 5 * SCALE}
                  y1={PADDING}
                  x2={PADDING + i * 5 * SCALE}
                  y2={PADDING + deckWidth * SCALE}
                  stroke="#d1d5db"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.6"
                />
                {i % 2 === 0 && i > 0 && (
                  <text
                    x={PADDING + i * 5 * SCALE}
                    y={PADDING - 6}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="8"
                  >
                      {i * 5}&apos;
                  </text>
                )}
              </g>
            ))}

            <g>
              <polygon
                points={`
                  ${PADDING - 12},${PADDING + deckWidth * SCALE / 2 - 18}
                  ${PADDING},${PADDING + deckWidth * SCALE / 2 - 6}
                  ${PADDING},${PADDING + deckWidth * SCALE / 2 + 6}
                  ${PADDING - 12},${PADDING + deckWidth * SCALE / 2 + 18}
                `}
                fill="url(#metalGradient)"
                stroke="#4b5563"
                strokeWidth="1"
              />
              <circle
                cx={PADDING - 6}
                cy={PADDING + deckWidth * SCALE / 2}
                r={4}
                fill="#374151"
                stroke="#1f2937"
                strokeWidth="1"
              />
            </g>

            {items.map((item, index) => {
              const placement = getPlacement(item.id)
              if (!placement) return null

              const isFailed = placement.failed === true
              const itemLength = placement.rotated ? item.width : item.length
              const itemWidth = placement.rotated ? item.length : item.width
              const isHovered = hoveredItem === item.id
              const colorConfig = getItemColorConfig(index)
              const x = PADDING + placement.x * SCALE
              const y = PADDING + placement.z * SCALE
              const w = itemLength * SCALE
              const h = itemWidth * SCALE

              const isOversize = item.width > 8.5 || item.height > 13.5 || item.length > 53
              const isOverweight = item.weight > 20000

              return (
                <g
                  key={item.id}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="cursor-pointer"
                >
                  <rect
                    x={x + 3}
                    y={y + 3}
                    width={w}
                    height={h}
                    fill="rgba(0,0,0,0.2)"
                    rx="3"
                    style={{
                      opacity: isHovered ? 0.3 : 0.2,
                      transition: 'opacity 0.15s ease'
                    }}
                  />

                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={isFailed ? 'url(#failedGradient)' : `url(#itemGradient-${index % ITEM_COLOR_CONFIG.length})`}
                    stroke={isFailed ? '#991b1b' : isHovered ? '#1f2937' : colorConfig.dark}
                    strokeWidth={isHovered ? 2.5 : isFailed ? 2 : 1.5}
                    rx="3"
                    opacity={isFailed ? 0.7 : 1}
                    style={{ transition: 'all 0.15s ease' }}
                  />

                  {isFailed && (
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill="url(#failedHatch)"
                      rx="3"
                    />
                  )}

                  {!isFailed && (
                    <rect
                      x={x + 2}
                      y={y + 2}
                      width={w - 4}
                      height={Math.min(h * 0.25, 8)}
                      fill="rgba(255,255,255,0.3)"
                      rx="2"
                    />
                  )}

                  {!isFailed && (
                    <rect
                      x={x + 2}
                      y={y + h - Math.min(h * 0.15, 5)}
                      width={w - 4}
                      height={Math.min(h * 0.15, 5)}
                      fill="rgba(0,0,0,0.15)"
                      rx="2"
                    />
                  )}

                  {!isFailed && (isOversize || isOverweight) && (
                    <rect
                      x={x}
                      y={y}
                      width={4}
                      height={h}
                      fill={isOverweight ? '#dc2626' : '#f59e0b'}
                      rx="3"
                      style={{ clipPath: 'inset(0 0 0 0 round 3px 0 0 3px)' }}
                    />
                  )}

                  {(isFailed || ((isOversize || isOverweight) && w > 35 && h > 25)) && (
                    <g>
                      <circle
                        cx={x + w - 10}
                        cy={y + 10}
                        r={7}
                        fill={isFailed ? '#991b1b' : isOverweight ? '#dc2626' : '#f59e0b'}
                        stroke="white"
                        strokeWidth="1.5"
                      />
                      <text
                        x={x + w - 10}
                        y={y + 13}
                        textAnchor="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        !
                      </text>
                    </g>
                  )}

                  {w > 45 && h > 22 && (
                    <text
                      x={x + w / 2}
                      y={y + h / 2 - (w > 60 ? 4 : 0)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="600"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {isFailed ? 'NOT PLACED' : `${item.description.slice(0, 10)}${item.description.length > 10 ? '..' : ''}`}
                    </text>
                  )}

                  {w > 60 && h > 35 && (
                    <text
                      x={x + w / 2}
                      y={y + h / 2 + 12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="rgba(255,255,255,0.9)"
                      fontSize="8"
                      fontWeight="500"
                    >
                      {isFailed ? 'Manual arrangement needed' : `${itemLength.toFixed(1)}' × ${itemWidth.toFixed(1)}'`}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">Side View (Height Profile)</h4>
        <div className="bg-gray-100 rounded-lg p-2 overflow-x-auto">
          <svg
            width={sideViewWidth + 40}
            height={sideViewHeight}
            viewBox={`0 0 ${sideViewWidth + 40} ${sideViewHeight}`}
            className="mx-auto"
          >
            <rect
              x={PADDING}
              y={PADDING}
              width={deckLength * SCALE}
              height={maxLegalHeight * SCALE}
              fill="#f8fafc"
              stroke="#e2e8f0"
            />

            <line
              x1={PADDING}
              y1={PADDING + (maxLegalHeight - truck.maxLegalCargoHeight) * SCALE}
              x2={PADDING + deckLength * SCALE}
              y2={PADDING + (maxLegalHeight - truck.maxLegalCargoHeight) * SCALE}
              stroke="#94a3b8"
              strokeDasharray="4,4"
            />
            <text
              x={PADDING + deckLength * SCALE - 5}
              y={PADDING + (maxLegalHeight - truck.maxLegalCargoHeight) * SCALE - 4}
              textAnchor="end"
              fill="#94a3b8"
              fontSize="8"
            >
              Legal height limit
            </text>

            <rect
              x={PADDING}
              y={PADDING + maxLegalHeight * SCALE - truck.deckHeight * SCALE}
              width={deckLength * SCALE}
              height={truck.deckHeight * SCALE}
              fill="#94a3b8"
              opacity={0.6}
            />

            {items.map((item, index) => {
              const placement = getPlacement(item.id)
              if (!placement) return null

              const itemLength = placement.rotated ? item.width : item.length
              const x = PADDING + placement.x * SCALE
              const w = itemLength * SCALE
              const h = item.height * SCALE
              const y = PADDING + maxLegalHeight * SCALE - truck.deckHeight * SCALE - h
              const isFailed = placement.failed === true

              return (
                <g key={item.id}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={isFailed ? '#fecaca' : getItemColor(index)}
                    opacity={isFailed ? 0.4 : 0.8}
                    stroke={isFailed ? '#dc2626' : getItemColorConfig(index).dark}
                    strokeWidth={1}
                  />
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
