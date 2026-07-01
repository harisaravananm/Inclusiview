import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { AlertTriangle, Bus, Home, TrendingUp } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import EquityHeatmap from '../components/EquityHeatmap'
import { api } from '../services/api'

const FALLBACK_STATS = {
  total_issues: 0, critical_issues: 0, total_neighborhoods: 0,
  avg_equity_score: 0, total_transit_stops: 0, accessible_stops: 0, accessibility_rate: 0,
}

const FALLBACK_SUMMARY: EquitySummary[] = []

interface Stats {
  total_issues: number; critical_issues: number; total_neighborhoods: number
  avg_equity_score: number; total_transit_stops: number; accessible_stops: number; accessibility_rate: number
}

interface EquitySummary {
  neighborhood_id: number; neighborhood_name: string
  transportation: number; healthcare: number; education: number; accessibility: number
  overall: number; population: number; median_income: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>(FALLBACK_STATS)
  const [summary, setSummary] = useState<EquitySummary[]>(FALLBACK_SUMMARY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.getDashboardStats(), api.getEquitySummary()])
      .then(([s, sum]) => {
        setStats(s)
        setSummary(sum)
      })
      .catch((e) => {
        setError('Could not load data from backend. Make sure the API server is running.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        <p className="text-sm text-gray-400">Loading equity data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Equity Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time intelligence on accessibility and equity across neighborhoods</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-800 font-medium">Backend Not Reachable</p>
          <p className="text-amber-600 text-sm mt-1">{error}</p>
          <p className="text-amber-500 text-xs mt-3">Start the backend: <code className="bg-amber-100 px-2 py-0.5 rounded">uvicorn app.main:app --host 0.0.0.0 --port 8000</code></p>
        </div>
      </div>
    )
  }

  const worstOff = [...summary].sort((a, b) => a.overall - b.overall).slice(0, 5)

  const chartData = summary.map((s) => ({
    name: s.neighborhood_name.substring(0, 10),
    Transportation: +(s.transportation * 100).toFixed(0),
    Healthcare: +(s.healthcare * 100).toFixed(0),
    Education: +(s.education * 100).toFixed(0),
    Accessibility: +(s.accessibility * 100).toFixed(0),
  }))

  const radarData = [
    { dimension: 'Transportation', score: +(stats.avg_equity_score * 100).toFixed(0) },
    { dimension: 'Healthcare', score: +(summary.reduce((a, s) => a + s.healthcare, 0) / (summary.length || 1) * 100).toFixed(0) },
    { dimension: 'Education', score: +(summary.reduce((a, s) => a + s.education, 0) / (summary.length || 1) * 100).toFixed(0) },
    { dimension: 'Accessibility', score: +(summary.reduce((a, s) => a + s.accessibility, 0) / (summary.length || 1) * 100).toFixed(0) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Community Equity Dashboard</h1>
        <p className="text-gray-500 mt-1">Real-time intelligence on accessibility and equity across neighborhoods</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Average Equity Score" value={`${(stats.avg_equity_score * 100).toFixed(0)}%`} subtitle="Across all neighborhoods" icon={<TrendingUp className="w-5 h-5 text-indigo-600" />} color="indigo" />
        <MetricCard title="Accessibility Issues" value={stats.total_issues} subtitle={`${stats.critical_issues} critical`} icon={<AlertTriangle className="w-5 h-5 text-red-600" />} color="red" />
        <MetricCard title="Transit Accessibility" value={`${stats.accessibility_rate}%`} subtitle={`${stats.accessible_stops}/${stats.total_transit_stops} stops`} icon={<Bus className="w-5 h-5 text-green-600" />} color="green" />
        <MetricCard title="Neighborhoods" value={stats.total_neighborhoods} subtitle="In coverage area" icon={<Home className="w-5 h-5 text-blue-600" />} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Equity Scores by Neighborhood</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <ReTooltip />
                <Bar dataKey="Transportation" fill="#818cf8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Healthcare" fill="#34d399" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Education" fill="#fbbf24" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Accessibility" fill="#f472b6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm py-16 text-center">No equity data available</p>}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">City-wide Equity Radar</h2>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Equity Heatmap</h2>
          <EquityHeatmap />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Neighborhoods Needing Attention</h2>
          {worstOff.length > 0 ? (
            <div className="space-y-3">
              {worstOff.map((nh) => (
                <div key={nh.neighborhood_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{nh.neighborhood_name}</p>
                    <p className="text-xs text-gray-500">Pop: {nh.population.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${nh.overall < 0.4 ? 'text-red-600' : nh.overall < 0.6 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {(nh.overall * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-400">overall</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm py-8 text-center">No neighborhood data</p>}
        </div>
      </div>
    </div>
  )
}
