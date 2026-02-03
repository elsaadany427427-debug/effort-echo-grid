import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, ComposedChart, Area
} from 'recharts';
import { Task } from '@/types/dashboard';
import { format, startOfWeek, addDays, parseISO, isWithinInterval } from 'date-fns';

interface DashboardChartsProps {
  tasks: Task[];
}

const CHART_COLORS = {
  blue: '#0ea5e9',
  teal: '#14b8a6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  emerald: '#22c55e',
};

const PIE_COLORS = [
  CHART_COLORS.blue,
  CHART_COLORS.rose,
  CHART_COLORS.teal,
  CHART_COLORS.amber,
  CHART_COLORS.violet,
  CHART_COLORS.emerald,
];

export function DashboardCharts({ tasks }: DashboardChartsProps) {
  // Weekly hours data for combo chart
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const data = [];
    let cumulative = 0;
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(t => t.date === dayStr);
      const hours = dayTasks.reduce((sum, t) => sum + t.hours, 0);
      cumulative += hours;
      
      data.push({
        day: format(day, 'EEE'),
        hours,
        cumulative,
        target: (i + 1) * 5, // Linear target (35h/week)
      });
    }
    
    return data;
  }, [tasks]);

  // Category distribution for pie chart
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    tasks.forEach(task => {
      const current = categoryMap.get(task.category) || 0;
      categoryMap.set(task.category, current + task.hours);
    });
    
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [tasks]);

  // AI efficiency data
  const aiEfficiencyData = useMemo(() => {
    const withAI = tasks.filter(t => t.aiUsed);
    const withoutAI = tasks.filter(t => !t.aiUsed);
    
    return [
      { 
        name: 'With AI', 
        tasks: withAI.length, 
        hours: withAI.reduce((sum, t) => sum + t.hours, 0),
        efficiency: withAI.reduce((sum, t) => sum + t.hours * 0.3, 0)
      },
      { 
        name: 'Without AI', 
        tasks: withoutAI.length, 
        hours: withoutAI.reduce((sum, t) => sum + t.hours, 0),
        efficiency: 0
      },
    ];
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Weekly Hours Combo Chart */}
      <div className="chart-container animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">Weekly vs Cumulative Hours</h3>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" />
            <XAxis dataKey="day" stroke="hsl(215 20% 65%)" fontSize={12} />
            <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(222 47% 15%)', 
                border: '1px solid hsl(217 33% 22%)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="hours" name="Daily Hours" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="cumulative" name="Cumulative" stroke={CHART_COLORS.teal} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="target" name="Target" stroke={CHART_COLORS.amber} strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Category Pie Chart */}
      <div className="chart-container animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">Time Distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: 'hsl(215 20% 65%)' }}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `${value.toFixed(1)}h`}
              contentStyle={{ 
                backgroundColor: 'hsl(222 47% 15%)', 
                border: '1px solid hsl(217 33% 22%)',
                borderRadius: '8px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* AI Efficiency Chart */}
      <div className="chart-container lg:col-span-2 animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">AI Efficiency Analysis</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={aiEfficiencyData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" />
            <XAxis type="number" stroke="hsl(215 20% 65%)" fontSize={12} />
            <YAxis type="category" dataKey="name" stroke="hsl(215 20% 65%)" fontSize={12} width={100} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(222 47% 15%)', 
                border: '1px solid hsl(217 33% 22%)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="hours" name="Total Hours" fill={CHART_COLORS.blue} radius={[0, 4, 4, 0]} />
            <Bar dataKey="efficiency" name="Time Saved" fill={CHART_COLORS.emerald} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
