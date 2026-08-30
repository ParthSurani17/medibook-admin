export default function StatCard({ icon: Icon, label, value, tint = "primary" }) {
  const tints = {
    primary: "bg-primary-50 text-primary-600",
    mint: "bg-mint-50 text-mint-600",
    amber: "bg-amber-50 text-amber-500",
    red: "bg-red-50 text-red-500",
  };
  return (
    <div className="flex items-center gap-4 rounded-xl2 border border-ink-100 bg-white p-5 shadow-card transition-shadow hover:shadow-lift">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${tints[tint]}`}>
        <Icon />
      </span>
      <div>
        <p className="text-2xl font-bold text-ink-900">{value}</p>
        <p className="text-sm text-ink-500">{label}</p>
      </div>
    </div>
  );
}
