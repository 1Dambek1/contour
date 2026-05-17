"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  EyeOff,
  Scale,
  LineChart,
  ArrowRight,
  Search,
  Lock,
  BrainCircuit,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen relative overflow-hidden bg-[#0f111a] pt-16">
      {/* Декоративный фон */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00d2ff]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8a2be2]/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero Секция */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-20 pb-16 text-center relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="relative w-24 h-24 mx-auto p-2 bg-black/40 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,210,255,0.15)]">
            <Image
              src="/logo.png"
              alt="Лого Контур"
              fill
              sizes="(max-width: 768px) 96px, 96px" // <-- Добавь эту строчку для оптимизации кэша браузера
              className="object-contain p-2"
              priority
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white"
        >
          Контур <span className="gradient-text">Доверия</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm md:text-md text-gray-400 mb-10 max-w-2xl leading-relaxed"
        >
          Цифровая линия антикоррупционного и этического комплаенса
          университета. <br />
          Сообщить безопасно. Проверить справедливо.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <Link href="/report" className="w-full sm:w-auto">
            <button className="w-full gradient-bg px-6 py-3.5 rounded-xl text-sm font-bold shadow-[0_0_30px_rgba(138,43,226,0.15)] hover:shadow-[0_0_40px_rgba(138,43,226,0.3)] transition-all flex items-center justify-center gap-2 group text-white">
              Подать обращение{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/track" className="w-full sm:w-auto">
            <button className="w-full px-6 py-3.5 rounded-xl text-sm font-bold border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-white">
              <Search className="w-4 h-4" /> Узнать статус
            </button>
          </Link>
        </motion.div>
      </section>

      {/* 3 Контура защиты */}
      <section className="w-full max-w-6xl mx-auto px-6 py-10 z-10">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: EyeOff,
              color: "text-[#00d2ff]",
              title: "Контур анонимности",
              desc: "Умный AI-фильтр деанонимизирует стиль текста и удаляет личные метаданные до передачи комиссии.",
            },
            {
              icon: Scale,
              color: "text-white",
              title: "Справедливая проверка",
              desc: "Защита преподавателей от клеветы. Каждое обращение — сигнал для проверки, а не приговор.",
            },
            {
              icon: LineChart,
              color: "text-[#8a2be2]",
              title: "Аналитика рисков",
              desc: "NLP-алгоритмы косинусного сходства связывают скрытые жалобы в единую тепловую карту.",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5"
            >
              <item.icon className={`w-8 h-8 mb-4 ${item.color}`} />
              <h3 className="text-md font-bold mb-2 text-white">
                {item.title}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
