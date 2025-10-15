import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  glowColor?: string;
}

const StatsCard = ({ title, value, icon: Icon, trend, glowColor = "primary" }: StatsCardProps) => {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold gradient-text">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-${glowColor}/10 text-${glowColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <p className="text-xs text-muted-foreground">{trend}</p>
      )}
    </div>
  );
};

export default StatsCard;
