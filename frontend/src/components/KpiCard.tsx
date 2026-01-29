"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';

// Dados fictícios para gerar a onda suave se nenhum dado for passado
const defaultWave = [
  { v: 10 }, { v: 25 }, { v: 15 }, { v: 35 }, { v: 20 }, { v: 45 }, { v: 30 }
];

export default function KpiCard({ title, value, delta, colorHex, chartData }: any) {
  const isPositive = delta > 0;
  // Cor padrão ou a passada por props
  const strokeColor = colorHex || "#3b82f6"; 

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col justify-between h-[140px]"
    >
      {/* Camada de Conteúdo (Texto) - Z-Index maior para ficar sobre o gráfico */}
      <div className="relative z-10">
        <h3 className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1">
          {title}
        </h3>
        
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {value}
          </span>
          
          {/* Badge de Porcentagem */}
          {delta !== undefined && (
            <span className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isPositive 
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
            }`}>
              {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
              {Math.abs(delta)}%
            </span>
          )}
        </div>
      </div>

      {/* Camada do Gráfico (Wave) - Posicionamento Absoluto no Fundo */}
      <div className="absolute bottom-0 left-0 right-0 h-16 w-full opacity-60 z-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData || defaultWave}>
            <Line 
              type="monotone" // Cria a curva suave (wave)
              dataKey="v" 
              stroke={strokeColor} 
              strokeWidth={3} 
              dot={false} 
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
