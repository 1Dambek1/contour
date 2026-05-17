// app/api/admin/reports/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // ОПЦИЯ 1: Если в URL передан ?id=... (вызов из карточки детального разбора)
    if (id) {
      const report = await prisma.report.findUnique({
        where: { id: Number(id) },
      });

      if (!report) {
        return NextResponse.json(
          { error: "Обращение не найдено" },
          { status: 404 },
        );
      }

      return NextResponse.json(report);
    }

    // ОПЦИЯ 2: Если параметров нет (вызов из главной таблицы дашборда)
    // Вытягиваем вообще все репорты из Neon PostgreSQL
    const reports = await prisma.report.findMany({
      orderBy: {
        createdAt: "desc", // Свежие сверху
      },
    });

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error("Database fetch error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера при получении данных" },
      { status: 500 },
    );
  }
}
