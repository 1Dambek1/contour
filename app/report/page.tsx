// app/report/page.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ShieldCheck,
  UserX,
  Lock,
  Copy,
  Upload,
  File,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { id: "corruption", name: "Коррупция и взятки" },
  { id: "ethics", name: "Нарушение академической этики" },
  { id: "conflict", name: "Конфликт интересов" },
  { id: "harassment", name: "Давление или харассмент" },
  { id: "other", name: "Другое" },
];

const DEPARTMENTS = [
  "Факультет компьютерных наук",
  "Факультет экономики",
  "Юридический факультет",
  "Административный отдел",
  "Общежитие",
];

export default function ReportPage() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [spamError, setSpamError] = useState<string | null>(null);

  const [mode, setMode] = useState("anonymous");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [text, setText] = useState("");
  const [fullName, setFullName] = useState("");
  const [files, setFiles] = useState<
    { name: string; size: number; ext: string }[]
  >([]);
  const [anonymized, setAnonymized] = useState("");
const [result, setResult] = useState<{
  trackingId: string;
  accessKey: string;
} | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles([
        ...files,
        {
          name: file.name,
          size: file.size,
          ext: file.name.split(".").pop() || "txt",
        },
      ]);
    }
  };

  const handleAnonymize = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setSpamError(null);
    try {
      const res = await fetch("/api/anonymize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Ошибка сети");

      if (data.isSpam) {
        setSpamError(data.error);
        return;
      }

      setAnonymized(data.anonymizedText);
      setStep(4);
    } catch (e: any) {
      alert(`Ошибка: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          category,
          department,
          originalText: text,
          anonymizedText: anonymized,
          files,
          fullName,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setResult({ trackingId: data.trackingId, accessKey: data.accessKey });
      setStep(5);
    } catch (e: any) {
      alert(`Отказ отправки: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 bg-[#0f111a]">
      <div className="glass-panel w-full max-w-4xl rounded-3xl p-6 md:p-10 bg-white/5 border border-white/10 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 left-0 w-full h-1 gradient-bg" />

        {step < 5 && !spamError && (
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${step >= i ? "bg-[#00d2ff]" : "bg-white/10"}`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {spamError ? (
            <motion.div
              key="spam"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2 text-white">
                Обращение отклонено ИИ
              </h2>
              <p className="text-gray-400 mb-6 text-xs max-w-md mx-auto leading-relaxed">
                {spamError}
              </p>
              <button
                onClick={() => {
                  setSpamError(null);
                  setStep(2);
                }}
                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Исправить текст
              </button>
            </motion.div>
          ) : step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h2 className="text-xl font-bold mb-6 text-white">
                Параметры безопасности
              </h2>
              <div className="mb-6">
                <label className="block text-gray-400 mb-3 text-[10px] uppercase font-bold tracking-wider">
                  1. Режим раскрытия личности
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: "anonymous",
                      icon: UserX,
                      title: "Анонимно",
                      desc: "Личность скрыта полностью",
                    },
                    {
                      id: "confidential",
                      icon: Lock,
                      title: "Конфиденциально",
                      desc: "Доступ только у комплаенс",
                    },
                    {
                      id: "open",
                      icon: ShieldCheck,
                      title: "Открыто",
                      desc: "Официальное именное обращение",
                    },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${mode === m.id ? "border-[#00d2ff] bg-[#00d2ff]/5" : "border-white/5 bg-black/20 hover:border-white/10"}`}
                    >
                      <m.icon
                        className={`w-5 h-5 mb-2 ${mode === m.id ? "text-[#00d2ff]" : "text-gray-400"}`}
                      />
                      <div className="font-bold text-xs text-white">
                        {m.title}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {m.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-8">
                <label className="block text-gray-400 mb-3 text-[10px] uppercase font-bold tracking-wider">
                  2. Категория нарушения
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`px-4 py-2 rounded-xl border text-xs transition-all ${category === c.id ? "border-[#8a2be2] bg-[#8a2be2]/10 text-white" : "border-white/5 text-gray-400 bg-black/20 hover:border-white/10"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!category}
                className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl text-xs font-bold disabled:opacity-25"
              >
                Далее
              </button>
            </motion.div>
          ) : step === 2 ? (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h2 className="text-xl font-bold mb-6 text-white">
                Детали ситуации
              </h2>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2 text-xs font-medium">
                  Подразделение вуза
                </label>
                <select
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="" disabled>
                    Выберите из списка...
                  </option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              {mode === "open" && (
                <div className="mb-4">
                  <label className="block text-[#00d2ff] mb-2 text-xs font-bold uppercase tracking-wide">
                    ФИО Заявителя
                  </label>
                  <input
                    type="text"
                    placeholder="Иванов Иван Иванович"
                    className="w-full bg-black/40 border border-[#00d2ff]/30 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00d2ff]"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}
              <div className="mb-6">
                <label className="block text-gray-400 mb-2 text-xs font-medium">
                  Описание инцидента
                </label>
                <textarea
                  className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none resize-none leading-relaxed"
                  placeholder="Опишите ситуацию подробно..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 border border-white/10 text-xs rounded-xl text-gray-400"
                >
                  Назад
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={
                    !department ||
                    !text.trim() ||
                    (mode === "open" && !fullName.trim())
                  }
                  className="flex-1 bg-white/5 border border-white/10 text-white py-3 rounded-xl text-xs font-bold disabled:opacity-25"
                >
                  Далее
                </button>
              </div>
            </motion.div>
          ) : step === 3 ? (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h2 className="text-xl font-bold mb-6 text-white">
                Прикрепить доказательства
              </h2>
              <div className="border border-dashed border-white/10 rounded-xl p-8 text-center bg-black/20 mb-6 relative">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                />
                <Upload className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-xs text-gray-400">
                  Перетащите файлы или скриншоты сюда
                </p>
              </div>
              {files.map((f, i) => (
                <div
                  key={i}
                  className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-xs text-gray-300 mb-4 flex items-center gap-2"
                >
                  <File className="text-[#00d2ff] w-4 h-4" />
                  {f.name}
                </div>
              ))}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 border border-white/10 text-xs rounded-xl text-gray-400"
                >
                  Назад
                </button>
                <button
                  onClick={handleAnonymize}
                  disabled={isProcessing}
                  className="flex-1 gradient-bg text-white py-3 rounded-xl text-xs font-bold flex justify-center"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    "Очистить через AI-фильтр"
                  )}
                </button>
              </div>
            </motion.div>
          ) : step === 4 ? (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2 className="text-xl font-bold mb-4 text-white">
                Контур защиты анонимности
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl opacity-30">
                  <span className="text-gray-500 font-bold block text-[9px] uppercase mb-2">
                    Исходный текст
                  </span>
                  <p className="text-xs line-through leading-relaxed">{text}</p>
                </div>
                <div className="bg-green-500/[0.02] border border-green-500/20 p-4 rounded-xl">
                  <span className="text-green-400 font-bold block text-[9px] uppercase mb-2">
                    Анонимизированный вариант ИИ
                  </span>
                  <p className="text-xs text-gray-200 leading-relaxed">
                    {anonymized}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 border border-white/10 text-xs rounded-xl text-gray-400"
                >
                  Редактировать
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="flex-1 gradient-bg text-white py-3 rounded-xl text-xs font-bold flex justify-center"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    "Отправить в комплаенс"
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            /* ФИКС ТУТ: Добавлены animate и scale для вывода на экран */
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <ShieldCheck className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-1">
                Сигнал зафиксирован
              </h2>
              <p className="text-gray-400 text-xs max-w-xs mx-auto mb-6">
                Сохраните данные для отслеживания и чата с комиссией.
              </p>

              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 text-left inline-block min-w-[320px] mb-6">
                <div className="mb-4">
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block">
                    ID Обращения
                  </span>
                  <div className="text-xl font-mono font-bold text-white mt-0.5">
                    {result?.trackingId}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block">
                    Секретный ключ
                  </span>
                  <div className="text-xs font-mono text-[#00d2ff] bg-black/20 p-2.5 rounded-lg border border-white/5 mt-1 flex items-center justify-between gap-2">
                    <span className="truncate">{result?.accessKey}</span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(result?.accessKey || "")
                      }
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Link
                  href="/"
                  className="px-5 py-2 border border-white/10 text-xs rounded-xl text-gray-400 hover:bg-white/5 transition-colors"
                >
                  На главную
                </Link>
                <Link
                  href="/track"
                  className="px-5 py-2 bg-[#8a2be2] text-white text-xs font-bold rounded-xl hover:bg-[#741fc2] transition-colors"
                >
                  В кабинет трекинга
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
