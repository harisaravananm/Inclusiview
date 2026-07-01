import { useEffect, useState } from 'react'
import { api } from '../services/api'

interface EquityItem {
  neighborhood_id: number; neighborhood_name: string
  transportation: number; healthcare: number; education: number; accessibility: number
  overall: number; population: number; median_income: number
}

interface Neighborhood {
  id: number; name: string; latitude: number; longitude: number
}

function getColor(score: number): string {
  if (score >= 0.8) return '#22c55e'
  if (score >= 0.6) return '#84cc16'
  if (score >= 0.4) return '#eab308'
  if (score >= 0.2) return '#f97316'
  return '#ef4444'
}

function getTextColor(score: number): string {
  if (score >= 0.4) return '#1a1a1a'
  return '#ffffff'
}

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = (lng - (-74.06)) / ((-73.78) - (-74.06)) * 650 + 40
  const y = ((40.79) - lat) / ((40.79) - (40.67)) * 400 + 40
  return { x, y }
}

const dimLabels: Record<string, string> = {
  overall: 'Overall Equity', transportation: 'Transportation',
  healthcare: 'Healthcare', education: 'Education', accessibility: 'Accessibility',
}

export default function EquityHeatmap() {
  const [summary, setSummary] = useState<EquityItem[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDim, setSelectedDim] = useState('overall')
  const [tooltip, setTooltip] = useState<{ x: number; y: number; item: any; score: number } | null>(null)

  useEffect(() => {
    Promise.all([api.getEquitySummary(), api.getNeighborhoods()])
      .then(([s, n]) => { setSummary(s); setNeighborhoods(n) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const dims = ['overall', 'transportation', 'healthcare', 'education', 'accessibility']

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
  }

  const points = neighborhoods.map((nh) => {
    const equity = summary.find((s) => s.neighborhood_id === nh.id)
    const score = equity ? (equity as any)[selectedDim] ?? equity.overall : 0.5
    const pos = latLngToSvg(nh.latitude, nh.longitude)
    return { ...pos, nh, equity, score }
  })

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {dims.map((d) => (
          <button key={d} onClick={() => setSelectedDim(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedDim === d ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {dimLabels[d]}
          </button>
        ))}
      </div>

      <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
        <svg viewBox="0 0 730 480" className="w-full" style={{ maxHeight: 460 }}>
          <rect x="0" y="0" width="730" height="480" fill="#f8fafc" rx="8" />

          <text x="365" y="30" textAnchor="middle" fontSize="13" fill="#64748b" fontFamily="system-ui">
            NYC Neighborhood Equity Map ({dimLabels[selectedDim]})
          </text>

          <line x1="60" y1="440" x2="690" y2="440" stroke="#cbd5e1" strokeWidth="0.5" />
          <line x1="60" y1="440" x2="60" y2="50" stroke="#cbd5e1" strokeWidth="0.5" />

          <g opacity="0.15">
            {[...Array(10)].map((_, i) => (
              <line key={`h${i}`} x1="60" y1={440 - i * 39} x2="690" y2={440 - i * 39} stroke="#94a3b8" strokeWidth="0.3" />
            ))}
            {[...Array(10)].map((_, i) => (
              <line key={`v${i}`} x1={60 + i * 63} y1="50" x2={60 + i * 63} y2="440" stroke="#94a3b8" strokeWidth="0.3" />
            ))}
          </g>

          {points.map((p) => (
            <g key={p.nh.id} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setTooltip({ x: p.x, y: p.y, item: p.equity ?? { neighborhood_name: p.nh.name, population: 0, median_income: 0 }, score: p.score })}
              onMouseLeave={() => setTooltip(null)}
            >
              <circle cx={p.x} cy={p.y} r={18} fill={getColor(p.score)} fillOpacity={0.7} stroke={getColor(p.score)} strokeWidth={2} />
              <circle cx={p.x} cy={p.y} r={18} fill="transparent" stroke="#ffffff" strokeWidth={1} strokeOpacity={0.5} />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={10} fill={getTextColor(p.score)} fontWeight="bold" fontFamily="system-ui">
                {(p.score * 100).toFixed(0)}
              </text>
              <text x={p.x} y={p.y - 22} textAnchor="middle" fontSize={9} fill="#334155" fontWeight="500" fontFamily="system-ui">
                {p.nh.name}
              </text>
            </g>
          ))}
        </svg>

        {tooltip && (
          <div className="absolute bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-xs pointer-events-none z-10"
            style={{ left: Math.min(tooltip.x + 20, 600), top: tooltip.y - 60 }}>
            <p className="font-bold text-gray-900 text-sm mb-1">{tooltip.item.neighborhood_name}</p>
            <p>Population: {(tooltip.item.population ?? 0).toLocaleString()}</p>
            <p>Income: ${(tooltip.item.median_income ?? 0).toLocaleString()}</p>
            <p className="mt-1 font-medium">{dimLabels[selectedDim]}: {((tooltip.score ?? 0) * 100).toFixed(0)}%</p>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> 80-100%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-lime-500 inline-block" /> 60-80%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> 40-60%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> 20-40%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> 0-20%</span>
      </div>
    </div>
  )
}
