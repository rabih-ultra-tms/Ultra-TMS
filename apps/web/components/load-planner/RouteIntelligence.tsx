'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  MapPin,
  Route,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Snowflake,
  Building2,
  DollarSign,
  Info,
  Moon,
  Car,
  Ruler,
  Siren,
} from 'lucide-react'
import type { LatLng, StateSegment, RouteResult } from '@/lib/load-planner/route-calculator'
import type { SeasonalRestriction } from '@/lib/load-planner/seasonal-restrictions'
import type { LowClearanceBridge } from '@/lib/load-planner/bridge-heights'
import type { CargoSpecs, RoutePermitSummary, DetailedPermitRequirement, DetailedRoutePermitSummary, EscortCostBreakdown, RouteRecommendation, TruckRouteRecommendation } from '@/lib/load-planner/types'
import { ExternalLink, Truck, Sparkles, ThumbsUp, ArrowRight } from 'lucide-react'
import { PermitSummaryCard } from './PermitSummaryCard'

interface TruckCargoSpecs extends CargoSpecs {
  truckIndex: number
  truckName: string
  truckId: string
  isOversize: boolean
  isOverweight: boolean
}

function generateSingleRouteReasoning(
  permitSummary: DetailedRoutePermitSummary | null,
  routeResult: RouteResult,
  bridgeWarnings: RouteIntelligenceState['bridgeWarnings']
): string[] {
  const reasoning: string[] = []

  if (routeResult.totalDistanceMiles < 500) {
    reasoning.push(`Short haul route at ${routeResult.totalDistanceMiles.toLocaleString()} miles`)
  } else if (routeResult.totalDistanceMiles < 1000) {
    reasoning.push(`Regional route at ${routeResult.totalDistanceMiles.toLocaleString()} miles`)
  } else {
    reasoning.push(`Long haul route at ${routeResult.totalDistanceMiles.toLocaleString()} miles`)
  }

  if (routeResult.statesTraversed.length === 1) {
    reasoning.push('Single state route - simplifies permitting')
  } else if (routeResult.statesTraversed.length <= 3) {
    reasoning.push(`Traverses ${routeResult.statesTraversed.length} states - manageable permit process`)
  } else {
    reasoning.push(`Traverses ${routeResult.statesTraversed.length} states - multi-state permits required`)
  }

  if (permitSummary) {
    if (permitSummary.totalPermitCost === 0) {
      reasoning.push('No permits required - legal dimensions')
    } else if (permitSummary.totalPermitCost < 50000) {
      reasoning.push(`Low permit costs: $${(permitSummary.totalPermitCost / 100).toLocaleString()}`)
    } else {
      reasoning.push(`Permit costs: $${(permitSummary.totalPermitCost / 100).toLocaleString()}`)
    }

    if (permitSummary.totalEscortCost > 0) {
      reasoning.push(`Escort services required: $${(permitSummary.totalEscortCost / 100).toLocaleString()}`)
    }

    const hasSuperload = permitSummary.statePermits.some(p => p.isSuperload)
    if (hasSuperload) {
      reasoning.push('Superload permits required - extended processing time')
    }
  }

  if (bridgeWarnings?.hasIssues) {
    reasoning.push(`${bridgeWarnings.bridges.length} bridge clearance issue(s) to review`)
  } else {
    reasoning.push('Bridge clearances OK for this route')
  }

  return reasoning
}

function generateRouteWarnings(
  permitSummary: DetailedRoutePermitSummary | null,
  bridgeWarnings: RouteIntelligenceState['bridgeWarnings'],
  seasonalWarnings: RouteIntelligenceState['seasonalWarnings']
): string[] {
  const warnings: string[] = []

  if (bridgeWarnings?.hasIssues) {
    const dangerBridges = bridgeWarnings.bridges.filter(b => b.clearanceResult.severity === 'danger')
    if (dangerBridges.length > 0) {
      warnings.push(`${dangerBridges.length} bridge(s) with insufficient clearance - alternate route may be needed`)
    }
  }

  if (permitSummary?.statePermits.some(p => p.isSuperload)) {
    warnings.push('Superload status in one or more states - expect longer permit processing')
  }

  if (seasonalWarnings?.hasRestrictions) {
    warnings.push('Seasonal restrictions in effect - weight limits may be reduced')
  }

  const totalRestrictions = permitSummary?.statePermits.reduce(
    (sum, p) => sum + p.travelRestrictions.length, 0
  ) || 0
  if (totalRestrictions > 3) {
    warnings.push('Multiple travel time restrictions - plan schedule carefully')
  }

  return warnings
}

interface RouteIntelligenceProps {
  origin: string
  destination: string
  cargoSpecs: CargoSpecs
  perTruckCargoSpecs?: TruckCargoSpecs[]
  shipDate?: Date
  routeData?: RouteResult
  onRouteCalculated?: (result: RouteResult) => void
  onPermitDataCalculated?: (permitData: DetailedRoutePermitSummary | null) => void
  className?: string
}

interface RouteIntelligenceState {
  isLoading: boolean
  error: string | null
  routeResult: RouteResult | null
  permitSummary: RoutePermitSummary | null
  detailedPermitSummary: DetailedRoutePermitSummary | null
  seasonalWarnings: {
    hasRestrictions: boolean
    affectedStates: SeasonalRestriction[]
    warnings: string[]
    recommendations: string[]
  } | null
  bridgeWarnings: {
    hasIssues: boolean
    bridges: Array<{
      bridge: LowClearanceBridge
      clearanceResult: {
        clears: boolean
        clearance: number
        deficit: number
        severity: 'ok' | 'caution' | 'warning' | 'danger'
      }
    }>
    warnings: string[]
    recommendations: string[]
  } | null
  routeRecommendation: RouteRecommendation | null
  perTruckRecommendations: TruckRouteRecommendation[] | null
}

export function RouteIntelligence({
  origin,
  destination,
  cargoSpecs,
  perTruckCargoSpecs,
  shipDate,
  routeData,
  onRouteCalculated,
  onPermitDataCalculated,
  className,
}: RouteIntelligenceProps) {
  const [state, setState] = useState<RouteIntelligenceState>({
    isLoading: false,
    error: null,
    routeResult: null,
    permitSummary: null,
    detailedPermitSummary: null,
    seasonalWarnings: null,
    bridgeWarnings: null,
    routeRecommendation: null,
    perTruckRecommendations: null,
  })
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['summary', 'states'])
  )
  const [expandedPermits, setExpandedPermits] = useState<Set<string>>(new Set())

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const analyzeRoute = useCallback(async () => {
    if (!origin || !destination) return

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      let routeToAnalyze = routeData

      if (!routeToAnalyze) {
        const { calculateRouteClientSide } = await import(
          '@/lib/load-planner/client-route-calculator'
        )
        routeToAnalyze = await calculateRouteClientSide(origin, destination)
      }

      if (routeToAnalyze) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          routeResult: routeToAnalyze,
        }))

        const { calculateRoutePermits, calculateDetailedRoutePermits } = await import('@/lib/load-planner/permit-calculator')
        const permitSummary = calculateRoutePermits(
          routeToAnalyze.statesTraversed,
          cargoSpecs,
          routeToAnalyze.stateDistances
        )

        const detailedPermitSummary = calculateDetailedRoutePermits(
          routeToAnalyze.statesTraversed,
          cargoSpecs,
          routeToAnalyze.stateDistances
        )

        const { checkRouteSeasonalRestrictions } = await import(
          '@/lib/load-planner/seasonal-restrictions'
        )
        const seasonalWarnings = checkRouteSeasonalRestrictions(
          routeToAnalyze.statesTraversed,
          shipDate
        )

        const { checkRouteBridgeClearances } = await import('@/lib/load-planner/bridge-heights')
        const totalHeight = cargoSpecs.height
        const bridgeWarnings = checkRouteBridgeClearances(routeToAnalyze.waypoints, totalHeight)

        const routeRecommendation: RouteRecommendation = {
          recommendedRouteId: 'route-0',
          recommendedRouteName: routeToAnalyze.statesTraversed.length > 0
            ? `via ${routeToAnalyze.statesTraversed.join(' → ')}`
            : 'Direct Route',
          reasoning: generateSingleRouteReasoning(
            detailedPermitSummary,
            routeToAnalyze,
            bridgeWarnings
          ),
          warnings: generateRouteWarnings(
            detailedPermitSummary,
            bridgeWarnings,
            seasonalWarnings
          ),
          alternativeConsiderations: [],
        }

        let perTruckRecommendations: TruckRouteRecommendation[] | null = null
        if (perTruckCargoSpecs && perTruckCargoSpecs.length > 1) {
          try {
            const { calculatePerTruckRoutes } = await import(
              '@/lib/load-planner/client-route-calculator'
            )
            const perTruckResult = await calculatePerTruckRoutes(origin, destination, perTruckCargoSpecs)

            perTruckRecommendations = perTruckResult.truckRoutes.map(tr => ({
              truckIndex: tr.truckIndex,
              truckId: tr.truckId,
              truckName: tr.truckName,
              cargoDescription: `${tr.cargoSpecs.width.toFixed(1)}'W × ${tr.cargoSpecs.height.toFixed(1)}'H × ${(tr.cargoSpecs.grossWeight / 1000).toFixed(0)}k lbs`,
              isOversize: tr.isOversize,
              isOverweight: tr.isOverweight,
              recommendedRouteId: tr.recommendedRouteId,
              recommendedRouteName: tr.recommendedRouteName,
              reasoning: tr.reasoning,
              alternativeRouteId: tr.usesDifferentRoute ? tr.recommendedRouteId : undefined,
              alternativeReason: tr.differentRouteReason,
            }))

            if (perTruckResult.routeGroups.length > 1) {
              routeRecommendation.warnings.push(
                `Different trucks may use different routes - ${perTruckResult.routeGroups.length} route groups identified`
              )
            }
          } catch (err) {
            console.warn('Per-truck route calculation failed, using fallback:', err)
            perTruckRecommendations = perTruckCargoSpecs.map(truck => ({
              truckIndex: truck.truckIndex,
              truckId: truck.truckId,
              truckName: truck.truckName,
              cargoDescription: `${truck.width.toFixed(1)}'W × ${truck.height.toFixed(1)}'H × ${(truck.grossWeight / 1000).toFixed(0)}k lbs`,
              isOversize: truck.isOversize,
              isOverweight: truck.isOverweight,
              recommendedRouteId: 'route-0',
              recommendedRouteName: routeRecommendation.recommendedRouteName,
              reasoning: truck.isOversize || truck.isOverweight
                ? ['Requires oversize/overweight permits', 'Using primary route for permit consistency']
                : ['Legal load dimensions', 'Can use any route'],
            }))
          }
        } else if (perTruckCargoSpecs && perTruckCargoSpecs.length === 1) {
          const truck = perTruckCargoSpecs[0]
          perTruckRecommendations = [{
            truckIndex: truck.truckIndex,
            truckId: truck.truckId,
            truckName: truck.truckName,
            cargoDescription: `${truck.width.toFixed(1)}'W × ${truck.height.toFixed(1)}'H × ${(truck.grossWeight / 1000).toFixed(0)}k lbs`,
            isOversize: truck.isOversize,
            isOverweight: truck.isOverweight,
            recommendedRouteId: 'route-0',
            recommendedRouteName: routeRecommendation.recommendedRouteName,
            reasoning: truck.isOversize || truck.isOverweight
              ? ['Requires oversize/overweight permits', 'Using primary route for permit consistency']
              : ['Legal load dimensions', 'Can use any route'],
          }]
        }

        setState((prev) => ({
          ...prev,
          permitSummary,
          detailedPermitSummary,
          seasonalWarnings,
          bridgeWarnings,
          routeRecommendation,
          perTruckRecommendations,
        }))

        onRouteCalculated?.(routeToAnalyze)
        onPermitDataCalculated?.(detailedPermitSummary)
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to analyze route',
      }))
    }
  }, [origin, destination, cargoSpecs, perTruckCargoSpecs, shipDate, routeData, onRouteCalculated, onPermitDataCalculated])

  const cargoSpecsKey = cargoSpecs
    ? `${cargoSpecs.length}-${cargoSpecs.width}-${cargoSpecs.height}-${cargoSpecs.grossWeight}`
    : ''
  const perTruckSpecsKey = perTruckCargoSpecs
    ? perTruckCargoSpecs.map(t => `${t.truckIndex}-${t.length}-${t.width}-${t.height}-${t.grossWeight}`).join('|')
    : ''
  const lastAnalyzedCargoKey = useRef('')

  useEffect(() => {
    const routeDataDistance = routeData?.totalDistanceMiles
    const stateDistance = state.routeResult?.totalDistanceMiles
    const hasAddresses = origin && destination
    const currentCargoKey = `${cargoSpecsKey}::${perTruckSpecsKey}`

    if (routeData && routeDataDistance !== stateDistance) {
      lastAnalyzedCargoKey.current = currentCargoKey
      analyzeRoute()
      return
    }

    if (hasAddresses && !state.routeResult) {
      lastAnalyzedCargoKey.current = currentCargoKey
      analyzeRoute()
      return
    }

    if (hasAddresses && lastAnalyzedCargoKey.current !== currentCargoKey) {
      lastAnalyzedCargoKey.current = currentCargoKey
      analyzeRoute()
    }
  }, [origin, destination, cargoSpecsKey, perTruckSpecsKey, routeData, state.routeResult, analyzeRoute])

  const togglePermit = (stateCode: string) => {
    setExpandedPermits((prev) => {
      const next = new Set(prev)
      if (next.has(stateCode)) {
        next.delete(stateCode)
      } else {
        next.add(stateCode)
      }
      return next
    })
  }

  const hasWarnings =
    (state.bridgeWarnings?.hasIssues ?? false) ||
    (state.seasonalWarnings?.hasRestrictions ?? false) ||
    (state.permitSummary?.warnings?.length ?? 0) > 0

  const totalEstimatedCost = state.permitSummary
    ? state.permitSummary.totalPermitFees + state.permitSummary.totalEscortCost
    : 0

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Route className="w-5 h-5" />
              Route Intelligence
            </CardTitle>
            <div className="flex items-center gap-2">
              {state.routeResult && (
                <Badge variant="secondary">
                  {state.routeResult.totalDistanceMiles.toFixed(0)} miles
                </Badge>
              )}
              {hasWarnings ? (
                <Badge variant="destructive">Warnings</Badge>
              ) : (
                <Badge variant="default">Clear</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Origin</div>
              <div className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                {origin || 'Enter origin'}
              </div>
            </div>
            <ArrowRight className="hidden sm:block w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Destination</div>
              <div className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                {destination || 'Enter destination'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={analyzeRoute} disabled={state.isLoading || !origin || !destination}>
              {state.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                'Analyze Route'
              )}
            </Button>
            {state.routeResult && (
              <Badge variant="outline">
                {state.routeResult.statesTraversed.length} states
              </Badge>
            )}
          </div>

          {state.error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              {state.error}
            </div>
          )}

          {state.routeResult && (
            <PermitSummaryCard permitSummary={state.detailedPermitSummary} />
          )}

          {state.routeResult && (
            <div className="space-y-3">
              <SectionHeader
                title="Permit Summary"
                icon={<DollarSign className="w-4 h-4" />}
                isExpanded={expandedSections.has('summary')}
                onToggle={() => toggleSection('summary')}
              />

              {expandedSections.has('summary') && (
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estimated Permit Costs</span>
                      <span className="font-medium">
                        ${(totalEstimatedCost / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {state.permitSummary?.overallRestrictions.length ? (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Overall Restrictions</span>
                      </div>
                      <ul className="text-sm text-yellow-700 list-disc list-inside">
                        {state.permitSummary?.overallRestrictions.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}

              <SectionHeader
                title="State-by-State Permits"
                icon={<Building2 className="w-4 h-4" />}
                isExpanded={expandedSections.has('states')}
                onToggle={() => toggleSection('states')}
              />

              {expandedSections.has('states') && (
                <div className="space-y-3">
                  {state.detailedPermitSummary?.statePermits?.map((permit) => (
                    <StatePermitCard
                      key={permit.stateCode}
                      permit={permit}
                      isExpanded={expandedPermits.has(permit.stateCode)}
                      onToggle={() => togglePermit(permit.stateCode)}
                    />
                  ))}
                </div>
              )}

              <SectionHeader
                title="Seasonal Restrictions"
                icon={<Snowflake className="w-4 h-4" />}
                isExpanded={expandedSections.has('seasonal')}
                onToggle={() => toggleSection('seasonal')}
              />

              {expandedSections.has('seasonal') && (
                <div className="space-y-3">
                  {state.seasonalWarnings?.hasRestrictions ? (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {state.seasonalWarnings.affectedStates.length} States Affected
                        </span>
                      </div>
                      <ul className="text-sm text-blue-700 list-disc list-inside">
                        {state.seasonalWarnings.affectedStates.map((r) => (
                          <li key={r.stateCode}>
                            {r.stateCode}: {r.restrictionType} ({r.maxWeightReductionPct}% reduction)
                          </li>
                        ))}
                      </ul>
                      {state.seasonalWarnings.recommendations.length > 0 && (
                        <div className="mt-2 text-xs text-blue-600">
                          {state.seasonalWarnings.recommendations.map((r, i) => (
                            <div key={i}>• {r}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 border rounded-lg text-sm text-muted-foreground">
                      No seasonal restrictions detected for this route.
                    </div>
                  )}
                </div>
              )}

              <SectionHeader
                title="Bridge Clearance"
                icon={<Ruler className="w-4 h-4" />}
                isExpanded={expandedSections.has('bridges')}
                onToggle={() => toggleSection('bridges')}
              />

              {expandedSections.has('bridges') && (
                <div className="space-y-3">
                  {state.bridgeWarnings?.bridges.length ? (
                    <div className="space-y-2">
                      {state.bridgeWarnings.bridges.map(({ bridge, clearanceResult }) => (
                        <div
                          key={bridge.id}
                          className={`p-3 rounded-lg border ${
                            clearanceResult.clears ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{bridge.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {bridge.state} • {bridge.routeName}
                              </div>
                            </div>
                            <Badge variant={clearanceResult.clears ? 'secondary' : 'destructive'}>
                              {clearanceResult.clears ? 'Clears' : 'Too Low'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Clearance: {bridge.clearance.toFixed(1)}' • Required: {cargoSpecs.height.toFixed(1)}'
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 border rounded-lg text-sm text-muted-foreground">
                      No bridge clearance issues detected.
                    </div>
                  )}
                </div>
              )}

              {state.routeRecommendation && (
                <SectionHeader
                  title="Route Recommendation"
                  icon={<Sparkles className="w-4 h-4" />}
                  isExpanded={expandedSections.has('recommendation')}
                  onToggle={() => toggleSection('recommendation')}
                />
              )}

              {expandedSections.has('recommendation') && state.routeRecommendation && (
                <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{state.routeRecommendation.recommendedRouteName}</span>
                  </div>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {state.routeRecommendation.reasoning.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                  {state.routeRecommendation.warnings.length > 0 && (
                    <div className="text-xs text-amber-600">
                      {state.routeRecommendation.warnings.map((warning, i) => (
                        <div key={i}>• {warning}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {state.perTruckRecommendations && state.perTruckRecommendations.length > 0 && (
                <SectionHeader
                  title="Per-Truck Route Recommendations"
                  icon={<Truck className="w-4 h-4" />}
                  isExpanded={expandedSections.has('perTruck')}
                  onToggle={() => toggleSection('perTruck')}
                />
              )}

              {expandedSections.has('perTruck') && state.perTruckRecommendations && (
                <div className="space-y-3">
                  {state.perTruckRecommendations.map((truck) => (
                    <div key={truck.truckId} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{truck.truckName}</div>
                          <div className="text-xs text-muted-foreground">{truck.cargoDescription}</div>
                        </div>
                        <Badge variant={truck.isOversize || truck.isOverweight ? 'destructive' : 'secondary'}>
                          {truck.isOversize || truck.isOverweight ? 'Permits Required' : 'Legal'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {truck.recommendedRouteName}
                      </div>
                      <ul className="text-xs text-muted-foreground list-disc list-inside mt-1">
                        {truck.reasoning.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface SectionHeaderProps {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
}

function SectionHeader({ title, icon, isExpanded, onToggle }: SectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </div>
      {isExpanded ? (
        <ChevronUp className="w-4 h-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  )
}

interface StatePermitCardProps {
  permit: DetailedPermitRequirement
  isExpanded: boolean
  onToggle: () => void
}

function StatePermitCard({ permit, isExpanded, onToggle }: StatePermitCardProps) {
  const hasIssues = permit.isSuperload || permit.overweightRequired || permit.oversizeRequired

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
            ${hasIssues ? 'bg-red-500' : 'bg-green-500'}
          `}>
            {permit.stateCode}
          </div>
          <div className="text-left">
            <div className="font-medium">{permit.stateName}</div>
            <div className="text-xs text-muted-foreground">
              {permit.oversizeRequired || permit.overweightRequired ? 'Permit required' : 'Legal load'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            ${(permit.totalCost / 100).toLocaleString()}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 border rounded">
              <div className="text-xs text-muted-foreground">Permit Fees</div>
              <div className="font-medium">${(permit.permitFees / 100).toLocaleString()}</div>
            </div>
            <div className="p-2 border rounded">
              <div className="text-xs text-muted-foreground">Escort Fees</div>
              <div className="font-medium">${(permit.escortFees / 100).toLocaleString()}</div>
            </div>
          </div>

          {permit.travelRestrictions.length > 0 && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded">
              <strong>Restrictions:</strong> {permit.travelRestrictions.join(', ')}
            </div>
          )}

          {permit.warnings.length > 0 && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-2 rounded">
              {permit.warnings.map((warning, i) => (
                <div key={i}>• {warning}</div>
              ))}
            </div>
          )}

          {permit.source && (
            <div className="text-xs text-slate-500 border-t pt-3">
              <p><strong>Source:</strong> {permit.source.agency}</p>
              <a
                href={permit.source.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Official Website <ExternalLink className="h-3 w-3" />
              </a>
              <p>Phone: {permit.source.phone}</p>
              <p className="italic mt-1">Data last updated: {permit.source.lastUpdated}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
