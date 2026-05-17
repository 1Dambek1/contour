"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();

  // Полностью отключаем навбар на страницах админки, так как там свои интерфейсы
  if (pathname.startsWith("/admin")) return null;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full z-50 bg-[#0f111a]/80 backdrop-blur-md border-b border-white/5"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Интегрируем твой полный логотип в левую часть навигации */}
        <Link
          href="/"
          className="flex items-center hover:opacity-90 transition-opacity"
        >
          <Image
            src="/full_logo.png"
            alt="Контур Доверия"
            width={150}
            height={40}
            style={{ height: "auto" }} // Сохраняет пропорции без Layout Shift
            priority
            className="object-contain"
          />
        </Link>

        <div className="flex gap-4 items-center text-xs md:text-sm font-medium">
          <Link
            href="/report"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Подать обращение
          </Link>
          <Link
            href="/track"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Статус заявки
          </Link>
          <Link
            href="/admin/login"
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-[11px] font-mono text-gray-400"
          >
            Комиссия
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
