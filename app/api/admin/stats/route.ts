// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (!reports || reports.length === 0) {
      return NextResponse.json({ error: "База пуста" }, { status: 400 });
    }

    // 1. Агрегация по статусам
    const statusMap: any = {};
    reports.forEach((r) => {
      statusMap[r.status] = (statusMap[r.status] || 0) + 1;
    });

    // 2. Агрегация по категориям
    const categoryMap: any = {
      corruption: 0,
      ethics: 0,
      conflict: 0,
      harassment: 0,
      other: 0,
    };
    reports.forEach((r:any) => {
      categoryMap[r.category] = (categoryMap[r.category] || 0) + 1;
    });

    // 3. Агрегация по режимам (Анонимно, конфиденциально, открыто)
    const modeMap: any = { anonymous: 0, confidential: 0, open: 0 };
    reports.forEach((r: any) => {
      modeMap[r.mode] = (modeMap[r.mode] || 0) + 1;
    });

    // 4. Агрегация по уровням риска (Low, Medium, High)
    const riskMap: any = { low: 0, medium: 0, high: 0 };
    reports.forEach((r: any) => {
      riskMap[r.riskLevel] = (riskMap[r.riskLevel] || 0) + 1;
    });

    // 5. Временной тренд по дням
    const timeTrendMap: any = {};
    reports.forEach((r: any) => {
      const day = new Date(r.createdAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });
      timeTrendMap[day] = (timeTrendMap[day] || 0) + 1;
    });

    // 6. Матрица Heatmap
    const depts = [
      "Факультет компьютерных наук",
      "Факультет экономики",
      "Юридический факультет",
      "Административный отдел",
    ];
    const heatmapData = depts.map((dept:any) => ({
      department: dept,
      corruption: reports.filter(
        (r: any) => r.department === dept && r.category === "corruption",
      ).length,
      ethics: reports.filter(
        (r: any) => r.department === dept && r.category === "ethics",
      ).length,
      conflict: reports.filter(
        (r: any) => r.department === dept && r.category === "conflict",
      ).length,
      harassment: reports.filter(
        (r: any) => r.department === dept && r.category === "harassment",
      ).length,
    }));

    const format = (map: any) =>
      Object.entries(map).map(([name, value]) => ({ name, value }));

    return NextResponse.json({
      total: reports.length,
      byStatus: format(statusMap),
      byCategory: format(categoryMap),
      byMode: format(modeMap),
      byRisk: format(riskMap),
      timeTrend: Object.entries(timeTrendMap).map(([date, count]) => ({
        date,
        Обращения: count,
      })),
      heatmapData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
