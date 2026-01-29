"use client";
import React from "react";
import KpiCard from "@/components/KpiCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const visitorData = [
  { name: 'Jan', value: 34 }, { name: 'Fev', value: 32 }, { name: 'Mar', value: 38 },
  { name: 'Abr', value: 35 }, { name: 'Mai', value: 42 }, { name: 'Jun', value: 39 }
];

const deviceData = [
  { name: 'Desktop', value: 66, color: '#22c55e' },
  { name: 'Tablet', value: 26, color: '#3b82f6' },
  { name: 'Mobile', value: 8, color: '#ef4444' }
];

export default function Resultados() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Analytics</h1>
        <p className="text-xs text-slate-500">🏠 / Dashboard / <span className="text-blue-600">Analytics</span></p>
      </header>

      {/* Grid de 6 Colunas como na imagem */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="Users" value="798" delta={12} color="#f59e0b" />
        <KpiCard title="Sessions" value="486" delta={-5} color="#ec4899" />
        <KpiCard title="Page Views" value="9454" delta={8} color="#ef4444" />
        <KpiCard title="Page / Session" value="7.15" color="#8b5cf6" />
        <KpiCard title="Avg. Time" value="00:04:30" color="#3b82f6" />
        <KpiCard title="Bounce Rate" value="1.55%" delta={2} color="#10b981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Principal */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-white/5">
          <h3 className="font-bold mb-6 text-slate-700 dark:text-slate-200">Daily Visitor</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Dispositivos */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-white/5">
          <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-200">Devices</h3>
          <div className="flex items-center justify-between mb-6">
            <span className="text-3xl font-black">1042</span>
          </div>
          <div className="space-y-4">
            {deviceData.map((dev) => (
              <div key={dev.name}>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span>{dev.name}</span>
                  <span>{dev.value}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${dev.value}%`, backgroundColor: dev.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}