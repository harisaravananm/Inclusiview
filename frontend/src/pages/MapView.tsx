import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { MapPin, AlertTriangle, Bus, Building2 } from 'lucide-react'

interface Neighborhood {
  id: number; name: string; latitude: number; longitude: number
  population: number; median_income: number
}

interface Issue {
  id: number; title: string; severity: string; status: string
  latitude: number; longitude: number; issue_type: string
}

interface TransitStop {
  id: number; name: string; accessibility_score: number
  latitude: number; longitude: number; wheelchair_accessible: number
}

interface ServiceCenter {
  id: number; name: string; center_type: string
  latitude: number; longitude: number; accessibility_rating: number
}

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = (lng - (-74.06)) / ((-73.78) - (-74.06)) * 650 + 40
  const y = ((40.79) - lat) / ((40.79) - (40.67)) * 400 + 40
  return { x, y }
}

const severityColor = (s: string) => {
  switch (s) {
    case 'critical': return '#ef4444'
    case 'high': return '#f97316'
    case 'medium': return '#eab308'
    default: return '#84cc16'
  }
}

export default function MapView() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [stops, setStops] = useState<TransitStop[]>([])
  const [centers, setCenters] = useState<ServiceCenter[]>([])
  const [layer, setLayer] = useState('issues')
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null)

  useEffect(() => {
    Promise.all([api.getNeighborhoods(), api.getIssues(), api.getTransitStops(), api.getServiceCenters()])
      .then(([n, i, t, c]) => { setNeighborhoods(n); setIssues(i); setStops(t); setCenters(c) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const layers = [
    { id: 'issues', label: 'Issues', icon: AlertTriangle },
    { id: 'transit', label: 'Transit', icon: Bus },
    { id: 'services', label: 'Services', icon: Building2 },
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interactive Equity Map</h1>
        <p className="text-gray-500 mt-1">Explore accessibility issues, transit stops, and service centers</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {layers.map((l) => {
          const Icon = l.icon
          return (
            <button key={l.id} onClick={() => setLayer(l.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                layer === l.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              <Icon className="w-4 h-4" />
              {l.label} ({layer === l.id ? (l.id === 'issues' ? issues.length : l.id === 'transit' ? stops.length : centers.length) : ''})
            </button>
          )
        })}
      </div>

      <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-slate-50">
        <svg viewBox="0 0 730 480" className="w-full" style={{ maxHeight: 460 }}>
          <rect x="0" y="0" width="730" height="480" fill="#f8fafc" rx="8" />

          <text x="365" y="25" textAnchor="middle" fontSize="13" fill="#64748b" fontWeight="500" fontFamily="system-ui">
            NYC Map — {layer.charAt(0).toUpperCase() + layer.slice(1)}
          </text>

          <g opacity="0.12">
            {[...Array(10)].map((_, i) => (
              <line key={`h${i}`} x1="60" y1={440 - i * 39} x2="690" y2={440 - i * 39} stroke="#94a3b8" strokeWidth="0.3" />
            ))}
            {[...Array(10)].map((_, i) => (
              <line key={`v${i}`} x1={60 + i * 63} y1="50" x2={60 + i * 63} y2="440" stroke="#94a3b8" strokeWidth="0.3" />
            ))}
          </g>

          {neighborhoods.map((nh) => {
            const p = latLngToSvg(nh.latitude, nh.longitude)
            return (
              <g key={nh.id} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ x: p.x, y: p.y, content: `${nh.name} (Pop: ${nh.population.toLocaleString()})` })}
                onMouseLeave={() => setTooltip(null)}>
                <circle cx={p.x} cy={p.y} r={6} fill="#6366f1" fillOpacity={0.25} stroke="#6366f1" strokeWidth={1} />
                <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize={8} fill="#475569" fontFamily="system-ui">{nh.name}</text>
              </g>
            )
          })}

          {layer === 'issues' && issues.map((issue) => {
            const p = latLngToSvg(issue.latitude, issue.longitude)
            return (
              <g key={`i-${issue.id}`} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ x: p.x, y: p.y, content: `${issue.title} (${issue.severity})` })}
                onMouseLeave={() => setTooltip(null)}>
                <circle cx={p.x} cy={p.y} r={7} fill={severityColor(issue.severity)} fillOpacity={0.85} stroke="#ffffff" strokeWidth={1.5} />
              </g>
            )
          })}

          {layer === 'transit' && stops.map((stop) => {
            const p = latLngToSvg(stop.latitude, stop.longitude)
            const col = stop.wheelchair_accessible ? '#22c55e' : '#ef4444'
            return (
              <g key={`s-${stop.id}`} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ x: p.x, y: p.y, content: `${stop.name} (access: ${(stop.accessibility_score * 100).toFixed(0)}%)` })}
                onMouseLeave={() => setTooltip(null)}>
                <rect x={p.x - 5} y={p.y - 5} width={10} height={10} rx={1.5} fill={col} fillOpacity={0.8} stroke="#ffffff" strokeWidth={1} />
              </g>
            )
          })}

          {layer === 'services' && centers.map((center) => {
            const p = latLngToSvg(center.latitude, center.longitude)
            const col = center.accessibility_rating >= 4 ? '#22c55e' : center.accessibility_rating >= 3 ? '#eab308' : '#ef4444'
            return (
              <g key={`c-${center.id}`} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ x: p.x, y: p.y, content: `${center.name} (${center.accessibility_rating}/5)` })}
                onMouseLeave={() => setTooltip(null)}>
                <rect x={p.x - 5} y={p.y - 5} width={10} height={10} rx={1.5} fill={col} fillOpacity={0.8} stroke="#ffffff" strokeWidth={1} />
                <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize={7} fill="#ffffff" fontWeight="bold" fontFamily="system-ui">
                  {center.center_type.charAt(0).toUpperCase()}
                </text>
              </g>
            )
          })}
        </svg>

        {tooltip && (
          <div className="absolute bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-1.5 text-xs font-medium pointer-events-none z-10"
            style={{ left: Math.min(tooltip.x + 15, 580), top: Math.max(tooltip.y - 35, 10) }}>
            {tooltip.content}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-indigo-500" /> Neighborhood</span>
        {layer === 'issues' && (
          <>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Critical</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> High</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> Medium</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Low</span>
          </>
        )}
        {layer === 'transit' && (
          <>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Wheelchair Accessible</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Not Accessible</span>
          </>
        )}
        {layer === 'services' && (
          <>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> High (4-5)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> Medium (3-4)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Low (1-3)</span>
          </>
        )}
      </div>
    </div>
  )
}
