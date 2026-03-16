import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SubjectsByDepartmentItem = {
  departmentName: string;
  totalSubjects: number;
};
type ClassesBySubjectItem = {
  subjectName: string;
  totalClasses: number;
};

type DashboardInsightsChartsProps = {
  subjectsByDepartment: SubjectsByDepartmentItem[];
  classesBySubject: ClassesBySubjectItem[];
};

const DashboardInsightsCharts = ({
  subjectsByDepartment,
  classesBySubject,
}: DashboardInsightsChartsProps) => {
  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Subjects per Department
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectsByDepartment}>
              <XAxis dataKey="departmentName" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="totalSubjects"
                fill="#f97316"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Classes per Subject
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classesBySubject}>
              <XAxis dataKey="subjectName" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="totalClasses"
                fill="#0ea5e9"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default DashboardInsightsCharts;
