// app/admin/analytics/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Shield,
  Activity,
  ArrowLeft,
  CalendarDays,
  Grid3X3,
  PieChart as PieIcon,
  Eye,
  AlertTriangle,
  Layers,
} from "lucide-react";
import Link from "next/link";

const COLORS = ["#00d2ff", "#8a2be2", "#3a7bd5", "#ff007f", "#00ff88"];
const RISK_COLORS: any = { high: "#ff0055", medium: "#ffaa00", low: "#00ffaa" };

export default function AnalyticsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
    if (status === "authenticated") {
      fetch("/api/admin/stats")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setStats(data);
        });
    }
  }, [status, router]);

  const getHeatmapColor = (value: number) => {
    if (value === 0) return "bg-white/[0.02] text-gray-700";
    if (value <= 2)
      return "bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/20";
    return "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse";
  };

  if (!stats)
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
        <Activity className="w-8 h-8 animate-spin text-[#00d2ff]" />
      </div>
    );

  const byStatus = Array.isArray(stats?.byStatus) ? stats.byStatus : [];
  const byCategory = Array.isArray(stats?.byCategory) ? stats.byCategory : [];
  const byMode = Array.isArray(stats?.byMode) ? stats.byMode : [];
  const byRisk = Array.isArray(stats?.byRisk) ? stats.byRisk : [];

  const mapLabels = (name: string) => {
    if (name === "corruption") return "Коррупция";
    if (name === "ethics") return "Этика";
    if (name === "conflict") return "Конфликт интересов";
    if (name === "harassment") return "Давление";
    if (name === "anonymous") return "Анонимно";
    if (name === "confidential") return "Конфиденциально";
    if (name === "open") return "Открыто";
    if (name === "high") return "Высокий";
    if (name === "medium") return "Средний";
    if (name === "low") return "Низкий";
    return name;
  };

  return (
    <div className="min-h-screen bg-[#0f111a] p-4 md:p-8 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Шапка */}
        <div className="glass-panel p-6 rounded-2xl flex justify-between items-center bg-white/5 border border-white/10">
          <div className="flex items-center gap-4">
            <Activity className="w-8 h-8 text-[#00d2ff]" />
            <div>
              <h1 className="text-2xl font-bold">Trust Dashboard</h1>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Глобальная система сквозной комплаенс-аналитики
              </p>
            </div>
          </div>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> В панель обработки
          </Link>
        </div>

        {/* СЕТКА С ГРАФИКАМИ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 1. Хронология инцидентов (Line Chart) */}
          <div className="lg:col-span-8 glass-panel p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-6 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#00d2ff]" /> Динамика
              поступления сигналов по дням
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.timeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                  <XAxis
                    dataKey="date"
                    stroke="#ffffff30"
                    tick={{ fill: "#aaa", fontSize: 10 }}
                  />
                  <YAxis
                    stroke="#ffffff30"
                    tick={{ fill: "#aaa", fontSize: 10 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#090a0f",
                      borderColor: "#222",
                      borderRadius: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Обращения"
                    stroke="#00d2ff"
                    strokeWidth={3}
                    dot={{ fill: "#00d2ff", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Карта плотности (Heatmap Matrix) */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-6 flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-[#8a2be2]" /> Матрица факультетов
              (Heatmap)
            </h3>
            <div className="space-y-2 text-[11px]">
              <div className="grid grid-cols-5 gap-1 font-bold text-gray-500 uppercase text-center text-[9px]">
                <div className="text-left col-span-1">Отдел</div>
                <div>Корр.</div>
                <div>Этика</div>
                <div>Конф.</div>
                <div>Давл.</div>
              </div>
              {stats.heatmapData?.map((row: any, idx: number) => (
                <div
                  key={idx}
                  className="grid grid-cols-5 gap-1 items-center text-center"
                >
                  <div className="text-left text-gray-400 truncate text-[10px]">
                    {row.department.replace("Факультет ", "Ф-т ")}
                  </div>
                  <div
                    className={`p-2.5 rounded-lg font-mono font-bold ${getHeatmapColor(row.corruption)}`}
                  >
                    {row.corruption}
                  </div>
                  <div
                    className={`p-2.5 rounded-lg font-mono font-bold ${getHeatmapColor(row.ethics)}`}
                  >
                    {row.ethics}
                  </div>
                  <div
                    className={`p-2.5 rounded-lg font-mono font-bold ${getHeatmapColor(row.conflict)}`}
                  >
                    {row.conflict}
                  </div>
                  <div
                    className={`p-2.5 rounded-lg font-mono font-bold ${getHeatmapColor(row.harassment)}`}
                  >
                    {row.harassment}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Доли категорий нарушений (Pie Chart) */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#00d2ff]" /> Профиль категорий
              нарушений
            </h3>
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {byCategory.map((e: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#090a0f",
                      borderColor: "#222",
                      borderRadius: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 mt-2 border-t border-white/5 pt-3">
              {byCategory.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="truncate">
                    {mapLabels(entry.name)} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Режимы раскрытия личности (Bar Chart) */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-6 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#8a2be2]" /> Востребованность
              режимов анонимности
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={byMode.map((m: any) => ({
                    ...m,
                    name: mapLabels(m.name),
                  }))}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#ffffff20"
                    tick={{ fill: "#aaa", fontSize: 10 }}
                  />
                  <YAxis
                    stroke="#ffffff20"
                    tick={{ fill: "#aaa", fontSize: 10 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#090a0f",
                      borderColor: "#222",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="#8a2be2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5. Уровни рисков ИИ (Donut Chart) */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Индексы
              критичности рисков ИИ
            </h3>
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byRisk}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={65}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {byRisk.map((entry: any, i: number) => (
                      <Cell key={i} fill={RISK_COLORS[entry.name] || "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#090a0f",
                      borderColor: "#222",
                      borderRadius: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-[10px] uppercase font-bold font-mono tracking-wider mt-2 border-t border-white/5 pt-3">
              {byRisk.map((entry: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5"
                  style={{ color: RISK_COLORS[entry.name] }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: RISK_COLORS[entry.name] }}
                  />
                  <span>
                    {mapLabels(entry.name)}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Статусы обработки обращений воронки (Horizontal Bar Chart) */}
          <div className="lg:col-span-12 glass-panel p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4 text-green-400" /> Состояние воронки
              реагирования (SLA по ISO 37002)
            </h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byStatus} layout="vertical">
                  <XAxis
                    type="number"
                    stroke="#ffffff20"
                    tick={{ fill: "#aaa", fontSize: 10 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#ffffff20"
                    tick={{ fill: "#aaa", fontSize: 11 }}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#090a0f",
                      borderColor: "#222",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="#00ff88" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
