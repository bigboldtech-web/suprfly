'use client';

import {
  Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';

export interface ChartPoint {
  time: string;
  Comments: number;
  Impressions: number;
  Followers: number;
}

export default function AnalyticsChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="Impressions" stroke="#8b5cf6" fill="url(#impGrad)" strokeWidth={2} />
        <Line type="monotone" dataKey="Comments" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Followers" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
