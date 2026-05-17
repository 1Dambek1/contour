"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/admin/dashboard");
    } else {
      alert("Неверные корпоративные данные.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#06070d]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-[#0f111a]/90 backdrop-blur-md">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16 bg-white/5 rounded-2xl border border-white/10 p-2">
              <Image
                src="/logo.png"
                alt="Лого Контур"
                fill
                sizes="(max-width: 768px) 96px, 96px" // <-- Добавь эту строчку для оптимизации кэша браузера
                className="object-contain p-2"
                priority
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-1">
              Служебный вход
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
              Независимый контур обработки
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Логин
              </label>
              <input
                type="text"
                required
                placeholder="admin"
                className="w-full bg-black/40 border border-white/10 py-3 px-4 rounded-xl text-sm text-white focus:outline-none focus:border-[#8a2be2] transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Пароль
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="admin"
                  className="w-full bg-black/40 border border-white/10 py-3 px-4 rounded-xl text-sm text-white focus:outline-none focus:border-[#8a2be2] transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <LockKeyhole className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-[#8a2be2] to-[#6a1b9a] py-3.5 rounded-xl font-bold text-sm text-white flex justify-center items-center transition-opacity disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                "Вход"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
