// app/api/admin/seed/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  try {
    // Безопасная проверка: если в базе уже есть хоть один кейс — прерываем сид
    const existingCount = await prisma.report.count();
    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `База данных уже содержит ${existingCount} записей. Инициализация пропущена.`,
      });
    }

    const categories = [
      "corruption",
      "ethics",
      "conflict",
      "harassment",
      "other",
    ];
    const departments = [
      "Факультет компьютерных наук",
      "Факультет экономики",
      "Юридический факультет",
      "Административный отдел",
    ];
    const modes = ["anonymous", "confidential", "open"];
    const statuses = ["Ожидает проверки", "В работе", "Решено"];
    const risks = ["low", "medium", "high"];

    const mockReports = [];

    for (let i = 0; i < 30; i++) {
      const trackingId = crypto.randomBytes(4).toString("hex").toUpperCase();
      const accessKey = crypto.randomBytes(8).toString("hex");

      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 12));

      const rand = Math.random();
      const category =
        rand < 0.39
          ? "corruption"
          : rand < 0.78
            ? "ethics"
            : categories[Math.floor(Math.random() * categories.length)];

      const department =
        departments[Math.floor(Math.random() * departments.length)];
      const mode =
        Math.random() < 0.62
          ? "anonymous"
          : modes[Math.floor(Math.random() * modes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const riskLevel =
        category === "corruption" || category === "harassment"
          ? "high"
          : rand < 0.6
            ? "medium"
            : "low";

      mockReports.push({
        trackingId,
        accessKey,
        mode,
        category,
        department,
        originalText:
          "Конфиденциальное исходное содержимое скрыто независимым контуром комплаенса.",
        anonymizedText: `Автоматический аудит выявил маркер риска по категории "${category}". Сигнал перенаправлен в комплаенс-комиссию подразделения: ${department}. Проводится независимое рассмотрение обстоятельств инцидента.`,
        status,
        riskLevel,
        createdAt: date,
      });
    }

    for (const report of mockReports) {
      await prisma.report.create({ data: report });
    }

    return NextResponse.json({
      success: true,
      message: `База успешно проинициализирована. Создано ${mockReports.length} аналитических кейсов.`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
