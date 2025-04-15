import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: string;
  changeText?: string;
  subText?: string;
  iconBgColor: string;
  iconColor: string;
  changeColor?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  change,
  changeText,
  subText,
  iconBgColor,
  iconColor,
  changeColor = "text-green-500"
}: StatCardProps) {
  return (
    <Card className="border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className={`${iconBgColor} p-3 rounded-full ${iconColor}`}>
            {icon}
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          {change && <span className={changeColor}>{change}</span>}
          {changeText && <span> {changeText}</span>}
          {subText && <span>{subText}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
