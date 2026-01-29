"use client";
import React, { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend 
} from "recharts";
import { Users, User, Briefcase, AlertCircle } from "lucide-react";

const COLORS_SEX = {
  "M": "#3b82f6", // Azul
  "F": "#ec4899", // Rosa
  "N/I": "#94a3b8" // Cinza (Não Informado)
};

const COLORS_AGE = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function DemographicsTab({ data }: { data: any[] }) {
  
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    // 1. Gênero
    const sexCount: Record<string, number> = {};
    let hasGenderData = false;

    // 2. Faixa Etária
    const ageCount: Record<string, number> = {};
    let hasAgeData = false;

    // 3. Tempo de Programa
    const tpCount: Record<string, number> = {};

    let totalAge = 0;
    let countAge = 0;
    let totalTp = 0;
    let countTp = 0;

    data.forEach(row => {
      // Sexo
      let s = "N/I";
      if (row.sexo && row.sexo !== "N/I") {
        s = row.sexo.charAt(0).toUpperCase(); // M ou F
        hasGenderData = true;
      }
      sexCount[s] = (sexCount[s] || 0) + 1;

      // Faixa Etária
      const f = row.faixa_etaria || "N/I";
      if (f !== "N/I" && f !== "Sem Data") hasAgeData = true;
      ageCount[f] = (ageCount[f] || 0) + 1;

      // Médias
      if (row.idade > 0) { totalAge += row.idade; countAge++; }
      if (row.tempo_programa >= 0) { totalTp += row.tempo_programa; countTp++; }

      // Grupos TP
      const g = row.grupos || "N/I";
      tpCount[g] = (tpCount[g] || 0) + 1;
    });

    // Formata Sexo
    const sexData = Object.keys(sexCount).map(k => ({ 
      name: k === 'M' ? 'Masculino' : k === 'F' ? 'Feminino' : 'Não Informado', 
      key: k,
      value: sexCount[k] 
    }));

    // Formata Idade (Ordenado)
    const ageOrder = ["0-18", "19-23", "24-28", "29-33", "34-38", "39-43", "44-48", "49-53", "54-58", "59+", "N/I", "Sem Data"];
    const ageData = ageOrder
      .filter(k => ageCount[k] > 0)
      .map(k => ({ name: k, value: ageCount[k] }));

    // Formata TP (Ordenado para o gráfico horizontal)
    const tpData = Object.keys(tpCount)
      .sort()
      .map(k => ({ name: k, value: tpCount[k] }));

    return { 
      sexData, hasGenderData,
      ageData, hasAgeData,
      tpData, 
      avgAge: countAge ? Math.round(totalAge / countAge) : 0,
      avgTp: countTp ? Math.round(totalTp / countTp) : 0
    };
  }, [data]);

  if (!stats) return <div className="p-10 text-center text-slate-400">Carregando perfil...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* 1. CARDS DE RESUMO (TOPO) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Amostra Total</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{data.length} <span className="text-sm font-normal text-slate-400">vidas</span></h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Idade Média</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.avgAge} <span className="text-sm font-normal text-slate-400">anos</span></h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tempo Médio (Prog)</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.avgTp} <span className="text-sm font-normal text-slate-400">meses</span></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 2. GRÁFICO DE GÊNERO */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Distribuição por Gênero</h3>
          
          {!stats.hasGenderData && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-100 rounded-lg flex items-center gap-2 text-xs text-orange-700">
              <AlertCircle size={16} />
              <span>Aviso: Coluna 'Sexo' não detectada no mapeamento.</span>
            </div>
          )}

          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.sexData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.sexData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_SEX[entry.key as keyof typeof COLORS_SEX] || COLORS_SEX["N/I"]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. GRÁFICO DE IDADE */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Pirâmide Etária (Faixas)</h3>
          
          {!stats.hasAgeData && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-100 rounded-lg flex items-center gap-2 text-xs text-orange-700">
              <AlertCircle size={16} />
              <span>Aviso: Coluna 'Nascimento' não detectada.</span>
            </div>
          )}

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_AGE[index % COLORS_AGE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. GRÁFICO DE GRUPOS (AGORA HORIZONTAL) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Distribuição por Tempo de Programa</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical" // <--- AQUI ESTÁ A MUDANÇA PARA LISTA VERTICAL
                data={stats.tpData}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={60}
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} 
                />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                   {/* Label na ponta da barra */}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}