interface ParamCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
}

export default function ParamCard({ label, value, unit, icon }: ParamCardProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
      {icon && (
        <div className="text-2xl mb-2">{icon}</div>
      )}
      <div className="text-2xl font-bold text-slate-900 mb-1">
        {value}
        {unit && <span className="text-lg text-slate-600 ml-1">{unit}</span>}
      </div>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}
