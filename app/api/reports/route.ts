import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

export async function GET() {
  const session = await getServerSession();

  // Защита: если нет сессии, отдаем 401 Unauthorized
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" }, // Новые сверху
      select: {
        id: true,
        trackingId: true,
        mode: true,
        anonymizedText: true, // Исходный текст не выводим в общем списке ради безопасности
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Ошибка БД:", error);
    return NextResponse.json({ error: "Ошибка БД" }, { status: 500 });
  }
}
