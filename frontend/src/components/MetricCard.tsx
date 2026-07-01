interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  color?: string
}

export default function MetricCard({ title, value, subtitle, icon, color = 'indigo' }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className={`bg-${color}-50 p-2 rounded-lg`}>{icon}</div>}
      </div>
    </div>
  )
}
