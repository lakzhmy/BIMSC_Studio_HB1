export type KPILogic = 'MAX' | 'MIN' | 'STRICT'

export function cleanUnit(unit: string): string {
  return unit.split('[')[0].trim()
}

export function formatKPIValue(value: number): string {
  const abs = Math.abs(value)
  if (abs === 0) return '0'
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000)     return `${(value / 1_000).toFixed(1)}k`
  if (abs >= 100)       return `${value.toFixed(1)}`
  if (abs >= 1)         return `${value.toFixed(2)}`
  if (abs >= 0.01)      return `${value.toFixed(3)}`
  return `${value.toFixed(4)}`
}

export function formatDeviation(
  value: number,
  target: number,
  logic: KPILogic,
  unit: string,
): { text: string; isPositive: boolean } {
  const delta = value - target
  const absDelta = Math.abs(delta)
  const cu = cleanUnit(unit)
  const fDelta = formatKPIValue(absDelta)
  const fTarget = formatKPIValue(target)

  // Build unit suffix: no space for %, no unit for unitless/ratio
  const isPercent = cu === '%'
  const hasUnit = cu.length > 0 && cu !== 'unitless' && cu !== 'ratio'
  const unitStr = isPercent ? '%' : (hasUnit ? ` ${cu}` : '')

  const direction = delta >= 0 ? 'above' : 'below'
  const sign = delta >= 0 ? '+' : '−'

  if (logic === 'MAX') {
    const isPositive = delta >= 0
    return {
      text: `${sign}${fDelta}${unitStr} ${direction} target (${fTarget}${unitStr})`,
      isPositive,
    }
  }

  if (logic === 'MIN') {
    // For MIN: being below target is good
    const isPositive = delta <= 0
    return {
      text: `${sign}${fDelta}${unitStr} ${direction} target (${fTarget}${unitStr})`,
      isPositive,
    }
  }

  // STRICT: within ±10% of target is good
  const isPositive = Math.abs(delta) <= Math.abs(target) * 0.1
  return {
    text: `${sign}${fDelta}${unitStr} ${direction} target (${fTarget}${unitStr})`,
    isPositive,
  }
}

export function getStrictBand(target: number): { low: number; high: number } {
  return { low: target * 0.9, high: target * 1.1 }
}

export function getLogicChipStyle(logic: string): string {
  if (logic === 'MAX')    return 'bg-blue-100 text-blue-700 border border-blue-200'
  if (logic === 'MIN')    return 'bg-orange-100 text-orange-700 border border-orange-200'
  if (logic === 'STRICT') return 'bg-purple-100 text-purple-700 border border-purple-200'
  return 'bg-slate-100 text-slate-600'
}
