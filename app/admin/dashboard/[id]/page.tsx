// app/admin/dashboard/[id]/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Brain,
  MessageSquare,
  Send,
  Shield,
  AlertTriangle,
  FileText,
  User,
  RefreshCw,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function ReportDetailPage() {
  const { id } = useParams(); // Получаем ID репорта из URL
  const { status } = useSession();
  const router = useRouter();

  // Состояния данных
  const [report, setReport] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [similarCases, setSimilarCases] = useState<any[]>([]);

  // Состояния загрузок и UI
  const [loadingReport, setLoadingReport] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Редирект, если не авторизован
  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
    if (status === "authenticated" && id) {
      loadReportData();
    }
  }, [status, id, router]);

  // Автоскролл чата вниз при новых сообщениях
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 1. ЗАГРУЗКА ДАННЫХ РЕПОРТА И ИСТОРИИ ЕГО ЧАТА
  const loadReportData = async () => {
    setLoadingReport(true);
    try {
      // Имитируем или вызываем получение конкретного репорта по ID
      const resReport = await fetch(`/api/admin/reports?id=${id}`);
      const reportData = await resReport.json();

      // Если у тебя роут /api/admin/reports отдает массив, находим нужный
      const currentReport = Array.isArray(reportData)
        ? reportData.find((r: any) => r.id === Number(id))
        : reportData;

      if (!currentReport) throw new Error("Репорт не найден");
      setReport(currentReport);

      // Загружаем сообщения для этого чата по его trackingId
      const resChat = await fetch(
        `/api/chat?trackingId=${currentReport.trackingId}`,
      );
      const chatData = await resChat.json();
      if (!chatData.error) setMessages(chatData.messages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReport(false);
    }
  };

  // 2. ОТПРАВКА СООБЩЕНИЯ ОТ ЛИЦА ОМБУДСМЕНА
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage || !report) return;

    setSendingMessage(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: report.trackingId,
          sender: "ombudsman", // Отправляет админ
          text: newMessage.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages([...messages, data.message]);
        setNewMessage("");
      } else {
        alert(data.error || "Ошибка отправки");
      }
    } catch (error) {
      alert("Сбой сети");
    } finally {
      setSendingMessage(false);
    }
  };

  // 3. ЗАПУСК СЕМАНТИЧЕСКОГО ИИ-АНАЛИЗА СВЯЗЕЙ (ВМЕСТО COS SIM)
  const handleRunAiAnalysis = async () => {
    if (!report) return;
    setLoadingAi(true);
    try {
      const res = await fetch("/api/admin/similarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setSimilarCases(data.similarReports || []);
    } catch (e: any) {
      alert(`Ошибка ИИ: ${e.message}`);
    } finally {
      setLoadingAi(false);
    }
  };

  if (loadingReport) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#00d2ff]" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0f111a] text-white flex items-center justify-center">
        Обращение не найдено.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f111a] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Кнопка назад */}
        <div className="flex justify-between items-center">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 flex items-center gap-2 text-xs transition-all text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Назад в список
          </Link>
          <div className="text-xs text-gray-500 font-mono">
            ID: {report.trackingId}
          </div>
        </div>

        {/* ОСНОВНОЙ ДВУХКОЛОНОЧНЫЙ КОРПУС */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ЛЕВАЯ КОЛОНКА: ДАННЫЕ + ЧАТ (8 колонок) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Карточка деталей кейса */}
            <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${report.riskLevel === "high" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}
                >
                  Риск: {report.riskLevel === "high" ? "Высокий" : "Средний"}
                </span>
                <span className="text-xs bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-gray-400">
                  {report.department}
                </span>
              </div>

              {/* Сетка текстов */}
              <div className="space-y-4 border-t border-white/5 pt-4">
                <div>
                  <span className="text-gray-500 font-bold block text-[10px] uppercase mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Исходный лог (Видит только
                    комплаенс)
                  </span>
                  <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {report.originalText}
                  </div>
                </div>
                <div>
                  <span className="text-[#00d2ff] font-bold block text-[10px] uppercase mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Модифицированный ИИ-сигнал
                  </span>
                  <div className="bg-sky-950/10 p-4 rounded-xl border border-sky-500/10 text-xs text-sky-200 leading-relaxed">
                    {report.anonymizedText}
                  </div>
                </div>
              </div>
            </div>

            {/* БЛОК АНОНИМНОГО ЧАТА */}
            <div className="glass-panel rounded-2xl bg-white/5 border border-white/10 flex flex-col h-[400px] overflow-hidden">
              {/* Шапка чата */}
              <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#00d2ff]" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Защищенный комплаенс-канал связи
                </span>
              </div>

              {/* Лента сообщений */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/10">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-600 italic">
                    История сообщений пуста. Вы можете написать первое сообщение
                    заявителю.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender === "ombudsman";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${isMe ? "bg-[#8a2be2] text-white rounded-tr-none" : "bg-white/5 border border-white/5 text-gray-200 rounded-tl-none"}`}
                        >
                          <div className="font-bold text-[9px] uppercase tracking-wider mb-0.5 opacity-60">
                            {isMe ? "Вы (Комиссия)" : "Заявитель"}
                          </div>
                          <div>{msg.text}</div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Форма ввода */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-black/30 border-t border-white/5 flex gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите официальный ответ или запрос документов..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-[#00d2ff]"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="p-3 gradient-bg text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-30"
                >
                  {sendingMessage ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА: ИИ-АНАЛИЗАТОР СВЯЗЕЙ (4 колонки) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#8a2be2]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Семантический ИИ-анализ связей
                </h3>
              </div>
              <p className="text-[11px] text-gray-500 leading-normal">
                Кнопка запускает сравнение текущего кейса со всей базой данных
                через LLM для поиска скрытого кумовства или повторных жалоб.
              </p>

              <button
                onClick={handleRunAiAnalysis}
                disabled={loadingAi}
                className="w-full py-2.5 px-4 bg-[#8a2be2]/10 hover:bg-[#8a2be2]/20 border border-[#8a2be2]/30 text-[#a855f7] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                {loadingAi ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Layers className="w-4 h-4" />
                )}
                {loadingAi
                  ? "ИИ сопоставляет контекст..."
                  : "Сканировать на системный риск"}
              </button>

              {/* СПИСОК СОВПАДЕНИЙ ОТ ИИ */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                {similarCases.length === 0 && !loadingAi && (
                  <div className="text-[11px] text-gray-600 text-center italic py-4">
                    Связанных аномалий или похожих паттернов нарушений не
                    обнаружено.
                  </div>
                )}

                {similarCases.map((cases, index) => (
                  <div
                    key={index}
                    className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-400 font-bold">
                        Кейс: {cases.trackingId}
                      </span>
                      <span className="text-xs font-bold text-red-400 font-mono">
                        {cases.score}% совпадения
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-300 leading-relaxed bg-white/[0.02] p-2 rounded-lg border border-white/5">
                      <span className="text-[#a855f7] font-bold block text-[9px] uppercase mb-0.5">
                        Триггер связи:
                      </span>
                      {cases.reason}
                    </div>
                    <Link
                      href={`/admin/dashboard/${cases.id}`}
                      className="text-[10px] text-[#00d2ff] hover:underline block pt-1"
                    >
                      Открыть связанное обращение →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
