import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { FileText, Loader2, Lightbulb, Download, AlertTriangle } from 'lucide-react'

interface Neighborhood {
  id: number
  name: string
}

interface BriefResult {
  brief: string
  recommendations: string[]
}

interface Recommendation {
  area: string
  action: string
  effort: string
  impact: string
}

export default function Reports() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [selectedNh, setSelectedNh] = useState<number>(0)
  const [brief, setBrief] = useState<BriefResult | null>(null)
  const [recs, setRecs] = useState<{ neighborhood_name: string; recommendations: Recommendation[] }[]>([])
  const [loading, setLoading] = useState(false)
  const [recsLoading, setRecsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<'brief' | 'recs'>('brief')

  useEffect(() => {
    api.getNeighborhoods().then(setNeighborhoods)
  }, [])

  const generateBrief = async () => {
    if (!selectedNh) return
    setLoading(true)
    setBrief(null)
    try {
      const result = await api.generateBrief(selectedNh)
      setBrief(result)
    } catch (e) {
      alert('Error generating brief. Using fallback analysis.')
    }
    setLoading(false)
  }

  const generateRecs = async () => {
    setRecsLoading(true)
    setRecs([])
    try {
      const result = await api.getRecommendations({ neighborhood_id: selectedNh || undefined })
      setRecs(result)
    } catch (e) {
      alert('Error generating recommendations.')
    }
    setRecsLoading(false)
  }

  const formatBrief = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={i} className="text-lg font-semibold text-gray-900 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>
      }
      if (line.trim() === '') return <br key={i} />
      return <p key={i} className="text-gray-600 mb-2 leading-relaxed">{line}</p>
    })
  }

  const exportAsText = () => {
    if (!brief) return
    const text = `InclusiView Equity Brief\n${'='.repeat(40)}\n\n${brief.brief}\n\nRecommendations:\n${brief.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'equity-brief.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  const selectedNhName = neighborhoods.find((n) => n.id === selectedNh)?.name || ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI-Powered Reports</h1>
        <p className="text-gray-500 mt-1">Generate equity briefs and recommendations using AI analysis</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveSection('brief')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'brief' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Equity Brief
        </button>
        <button
          onClick={() => setActiveSection('recs')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'recs' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          <Lightbulb className="w-4 h-4" /> Recommendations
        </button>
      </div>

      {activeSection === 'brief' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Equity Brief</h2>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Neighborhood</label>
              <select
                value={selectedNh}
                onChange={(e) => setSelectedNh(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={0}>All neighborhoods</option>
                {neighborhoods.map((nh) => (
                  <option key={nh.id} value={nh.id}>{nh.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={generateBrief}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {loading ? 'Generating...' : 'Generate Brief'}
            </button>
            {brief && (
              <button onClick={exportAsText} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" /> Export
              </button>
            )}
          </div>

          {loading && (
            <div className="mt-8 flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p>Analyzing equity data with AI...</p>
            </div>
          )}

          {brief && !loading && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedNhName || 'City-wide'} Equity Assessment
                  </h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  {formatBrief(brief.brief)}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Recommended Actions
                </h3>
                <div className="space-y-2">
                  {brief.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSection === 'recs' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h2>
          <div className="flex flex-wrap gap-3 items-end mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Neighborhood</label>
              <select
                value={selectedNh}
                onChange={(e) => setSelectedNh(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={0}>All neighborhoods</option>
                {neighborhoods.map((nh) => (
                  <option key={nh.id} value={nh.id}>{nh.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={generateRecs}
              disabled={recsLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {recsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
              {recsLoading ? 'Generating...' : 'Get Recommendations'}
            </button>
          </div>

          {recsLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p>Generating AI recommendations...</p>
            </div>
          )}

          {recs.length > 0 && !recsLoading && (
            <div className="space-y-6">
              {recs.map((item) => (
                <div key={item.neighborhood_name} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">{item.neighborhood_name}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {item.recommendations.map((rec, i) => (
                      <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium uppercase tracking-wider text-indigo-600">{rec.area}</span>
                            </div>
                            <p className="text-sm text-gray-700">{rec.action}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              rec.effort === 'high' ? 'bg-red-100 text-red-700' :
                              rec.effort === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {rec.effort} effort
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              rec.impact === 'high' ? 'bg-green-100 text-green-700' :
                              rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {rec.impact} impact
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
