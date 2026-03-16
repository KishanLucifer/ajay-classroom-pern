import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type UsersByRoleItem = { role: string; total: number };

type DashboardRoleChartProps = {
  usersByRole: UsersByRoleItem[];
  roleColors: string[];
};

const DashboardRoleChart = ({
  usersByRole,
  roleColors,
}: DashboardRoleChartProps) => {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="total"
            nameKey="role"
            data={usersByRole}
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
          >
            {usersByRole.map((entry, index) => (
              <Cell
                key={`${entry.role}-${index}`}
                fill={roleColors[index % roleColors.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardRoleChart;
