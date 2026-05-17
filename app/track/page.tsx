"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Search,
  ShieldAlert,
  MessageSquare,
  Send,
  Clock,
  FileText,
  Lock,
} from "lucide-react";
import Link from "next/link";

// Типы для TypeScript
type Message = { id: number; sender: string; text: string; createdAt: string };
type ReportData = {
  id: number;
  trackingId: string;
  status: string;
  category: string;
  department: string;
  anonymizedText: string;
  createdAt: string;
  messages: Message[];
};

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);

  const [chatMessage, setChatMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Прокрутка чата вниз при новых сообщениях
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [report?.messages]);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const res = await fetch("/api/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingId, accessKey }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Ошибка доступа");
    }

    setReport(data);
  } catch (e: any) {
    alert(`Ошибка трекинга: ${e.message}`);
  } finally {
    setIsLoading(false);
  }
};

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !report) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report.id,
          trackingId,
          accessKey,
          text: chatMessage,
          sender: "applicant", // Отправитель - заявитель
        }),
      });
      const newMessage = await res.json();

      if (!res.ok) throw new Error(newMessage.error);

      // Обновляем локальный стейт сообщений
      setReport({ ...report, messages: [...report.messages, newMessage] });
      setChatMessage("");
    } catch (e: any) {
      alert("Ошибка отправки сообщения");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!report ? (
          /* ЭКРАН 1: ВХОД ПО КЛЮЧУ */
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel w-full max-w-md rounded-3xl p-8"
          >
            <div className="w-16 h-16 bg-[#00d2ff]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#00d2ff]/30">
              <Search className="w-8 h-8 text-[#00d2ff]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Проверка статуса</h2>
            <p className="text-gray-400 mb-8 text-sm">
              Введите данные, полученные при подаче обращения, чтобы открыть
              анонимный чат.
            </p>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-500 text-xs uppercase tracking-wider mb-2">
                  Tracking ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: A3F9"
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white font-mono focus:outline-none focus:border-[#00d2ff] transition-colors"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                />
              </div>
              <div className="mb-8">
                <label className="block text-gray-500 text-xs uppercase tracking-wider mb-2">
                  Access Key (Секретно)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ваш секретный ключ"
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white font-mono focus:outline-none focus:border-[#8a2be2] transition-colors"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !trackingId || !accessKey}
                className="w-full gradient-bg py-4 rounded-xl font-bold flex justify-center items-center transition-opacity disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "Получить доступ"
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          /* ЭКРАН 2: ЛИЧНЫЙ КАБИНЕТ ЗАЯВИТЕЛЯ (ЧАТ) */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-5xl grid md:grid-cols-3 gap-6 h-[80vh]"
          >
            {/* Левая колонка: Инфо о заявке */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col gap-6 overflow-y-auto hidden-scrollbar">
              <div>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center mb-6"
                >
                  ← Выйти
                </Link>
                <div className="flex items-center gap-3 mb-2">
                  <ShieldAlert className="w-6 h-6 text-[#00d2ff]" />
                  <h2 className="text-xl font-bold font-mono">
                    {report.trackingId}
                  </h2>
                </div>
                <div className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-full text-xs font-bold uppercase">
                  {report.status}
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                <div className="text-xs text-gray-500 uppercase mb-1">
                  Категория
                </div>
                <div className="text-sm font-medium">{report.category}</div>
                <div className="text-xs text-gray-500 uppercase mb-1 mt-4">
                  Подразделение
                </div>
                <div className="text-sm font-medium">{report.department}</div>
                <div className="text-xs text-gray-500 uppercase mb-1 mt-4">
                  Создано
                </div>
                <div className="text-sm font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />{" "}
                  {new Date(report.createdAt).toLocaleDateString("ru-RU")}
                </div>
              </div>

              <div className="bg-[#00d2ff]/5 border border-[#00d2ff]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2 text-[#00d2ff]">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold">
                    Текст в комиссии
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {report.anonymizedText}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-white/10 text-xs text-gray-500 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Диалог полностью анонимен. Комиссия не видит ваших данных.
              </div>
            </div>

            {/* Правая колонка: Чат */}
            <div className="glass-panel rounded-3xl flex flex-col md:col-span-2 overflow-hidden border border-white/10 relative">
              <div className="bg-black/40 p-4 border-b border-white/10 flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[#8a2be2]" />
                <h3 className="font-bold">
                  Анонимный диалог с комплаенс-офицером
                </h3>
              </div>

              {/* Область сообщений */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {report.messages.length === 0 ? (
                  <div className="m-auto text-center text-gray-500 max-w-xs">
                    Пока сообщений нет. Вы можете задать вопрос или добавить
                    детали к обращению здесь.
                  </div>
                ) : (
                  report.messages.map((msg) => {
                    const isApplicant = msg.sender === "applicant";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isApplicant ? "items-end" : "items-start"}`}
                      >
                        <span className="text-xs text-gray-500 mb-1 px-1">
                          {isApplicant ? "Вы (Анонимно)" : "Комиссия"} •{" "}
                          {new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                            isApplicant
                              ? "bg-[#00d2ff]/20 border border-[#00d2ff]/30 text-white rounded-tr-sm"
                              : "bg-white/10 border border-white/10 text-gray-200 rounded-tl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Поле ввода */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-black/40 border-t border-white/10 flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Написать сообщение комиссии..."
                  required
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 focus:outline-none focus:border-[#8a2be2] text-sm text-white transition-colors"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isSending || !chatMessage.trim()}
                  className="bg-[#8a2be2] hover:bg-[#7a20c9] p-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
