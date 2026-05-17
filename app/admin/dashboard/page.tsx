// app/admin/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Shield,
  LogOut,
  BarChart3,
  Filter,
  FileText,
  UserX,
  Lock,
  Eye,
  ArrowUpRight,
  RefreshCw,
  Layers,
  Brain,
} from "lucide-react";
import Link from "next/link";

const CAT_LABELS: any = {
  corruption: "Коррупция",
  ethics: "Этика",
  conflict: "Конфликт интересов",
  harassment: "Давление",
  other: "Другое",
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Состояния
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("Все");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
    if (status === "authenticated") loadReports();
  }, [status, router]);

  const loadReports = async () => {
    setLoading(false);
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Сортируем: сначала самые новые
        setReports(
          data.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      }
    } catch (e) {
      console.error("Ошибка загрузки списка:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#00d2ff]" />
      </div>
    );
  }

  // Фильтрация данных по вкладкам статусов
  const filteredReports = reports.filter(
    (r) => filterStatus === "Все" || r.status === filterStatus,
  );

  return (
    <div className="min-h-screen bg-[#0f111a] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ВЕРХНЯЯ ПАНЕЛЬ НАВИГАЦИИ */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center bg-white/5 border border-white/10 gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#00d2ff]" />
            <div>
              <h1 className="text-xl font-bold">Панель комплаенс-контроля</h1>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Контур управления рисками корпоративной этики
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {/* Ссылка на продвинутую графическую аналитику */}
            <Link
              href="/admin/analytics"
              className="flex items-center gap-2 px-4 py-2 bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/20 rounded-xl text-xs font-bold hover:bg-[#00d2ff]/20 transition-colors"
            >
              <BarChart3 className="w-4 h-4" /> Trust Dashboard
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-medium hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Выйти
            </button>
          </div>
        </div>

        {/* ТАБЫ ФИЛЬТРАЦИИ СТАТУСОВ */}
        <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
          {["Все", "Ожидает проверки", "В работе", "Решено"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${filterStatus === tab ? "bg-white/10 border-white/20 text-white font-bold" : "bg-transparent border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ГЛАВНАЯ ТАБЛИЦА СИГНАЛОВ */}
        <div className="glass-panel rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500 italic">
              Нет обращений, соответствующих выбранному статусу.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/5 bg-black/20 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    <th className="p-4">ID обращения</th>
                    <th className="p-4">Режим</th>
                    <th className="p-4">Категория</th>
                    <th className="p-4">Подразделение</th>
                    <th className="p-4">Статус</th>
                    <th className="p-4 text-center">ИИ-Связи (Сos Sim)</th>
                    <th className="p-4 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredReports.map((report) => {
                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* ID (Tracking ID) */}
                        <td className="p-4 font-mono font-bold text-white tracking-wide">
                          {report.trackingId}
                        </td>

                        {/* Режим раскрытия личности */}
                        <td className="p-4">
                          {report.mode === "anonymous" && (
                            <span className="flex items-center gap-1.5 text-gray-400">
                              <UserX className="w-3.5 h-3.5" /> Анонимно
                            </span>
                          )}
                          {report.mode === "confidential" && (
                            <span className="flex items-center gap-1.5 text-[#a855f7]">
                              <Lock className="w-3.5 h-3.5" /> Конфид.
                            </span>
                          )}
                          {report.mode === "open" && (
                            <span className="flex items-center gap-1.5 text-[#00d2ff]">
                              <Eye className="w-3.5 h-3.5" /> Открыто
                            </span>
                          )}
                        </td>

                        {/* Категория */}
                        <td className="p-4 text-gray-300">
                          {CAT_LABELS[report.category] || report.category}
                        </td>

                        {/* Подразделение */}
                        <td className="p-4 text-gray-400 max-w-[180px] truncate">
                          {report.department}
                        </td>

                        {/* Статус обработки */}
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                              report.status === "Ожидает проверки"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : report.status === "В работе"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-green-500/10 text-green-400 border-green-500/20"
                            }`}
                          >
                            {report.status}
                          </span>
                        </td>

                        {/* ИИ-Связи (Внедрение семантического скрининга совпадений) */}
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/5 border border-purple-500/10 text-[10px] text-purple-400 font-medium">
                            <Brain className="w-3 h-3 text-[#a855f7]" />
                            <span>Доступен семантический скан</span>
                          </div>
                        </td>

                        {/* Кнопка перехода к деталям */}
                        <td className="p-4 text-right">
                          <Link
                            href={`/admin/dashboard/${report.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all group-hover:border-[#00d2ff]/30"
                          >
                            Разбор кейса{" "}
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#00d2ff]" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
