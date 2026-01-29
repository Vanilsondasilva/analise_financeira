"use client";
import React from "react";
import KpiCard from "@/components/KpiCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dados do Gráfico Principal (Daily Visitor)
const visitorData = [
  { name: 'Jan', value: 32 }, 
  { name: 'Fev', value: 31 }, 
  { name: 'Mar', value: 38 },
  { name: 'Abr', value: 35 }, 
  { name: 'Mai', value: 42 }, 
  { name: 'Jun', value: 40 }
];

export default function ResultadosPage() {
  return (
    <div className="space-y-8 fade-in">
      {/* Cabeçalho / Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analytics</h1>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>🏠</span> <span>/</span> <span>Dashboard</span> <span>/</span> <span className="text-blue-600 font-bold">Analytics</span>
        </div>
      </div>

      {/* LINHA DE CARDS (BENTO GRID - 6 Colunas) */}
      {/* Cores extraídas da imagem: Amarelo, Rosa, Vermelho, Roxo, Azul, Verde */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-5">
        <KpiCard 
          title="Users" 
          value="798" 
          delta={12} 
          colorHex="#fbbf24" // Amarelo
          chartData={[{v:10}, {v:25}, {v:15}, {v:30}, {v:20}, {v:40}]} 
        />
        <KpiCard 
          title="Sessions" 
          value="486" 
          delta={-5} 
          colorHex="#f472b6" // Rosa
          chartData={[{v:30}, {v:20}, {v:25}, {v:15}, {v:20}, {v:10}]} 
        />
        <KpiCard 
          title="Page Views" 
          value="9454" 
          delta={8} 
          colorHex="#f87171" // Vermelho Claro
          chartData={[{v:10}, {v:30}, {v:20}, {v:40}, {v:25}, {v:50}]} 
        />
        <KpiCard 
          title="Page / Session" 
          value="7.15" 
          colorHex="#a78bfa" // Roxo
          chartData={[{v:15}, {v:20}, {v:15}, {v:25}, {v:20}, {v:30}]} 
        />
        <KpiCard 
          title="Avg. Time" 
          value="00:04:30" 
          colorHex="#60a5fa" // Azul
          chartData={[{v:20}, {v:10}, {v:25}, {v:15}, {v:30}, {v:20}]} 
        />
        <KpiCard 
          title="Bounce Rate" 
          value="1.55%" 
          delta={2} 
          colorHex="#34d399" // Verde Água
          chartData={[{v:25}, {v:20}, {v:30}, {v:25}, {v:35}, {v:30}]} 
        />
      </div>

      {/* ÁREA DE GRÁFICOS INFERIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico Principal: Daily Visitor */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-8">Daily Visitor</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#3b82f6' }} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Lateral: Devices */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Devices</h3>
          
          <div className="mt-8">
            <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-8">1042</h2>
            
            {/* Barras de Progresso Customizadas */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
                  <span>Desktop</span>
                  <span>66%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[66%]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
                  <span>Tablet</span>
                  <span>26%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[26%]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
                  <span>Mobile</span>
                  <span>8%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[8%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}