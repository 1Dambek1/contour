// app/api/admin/similarity/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const REAL_AI_KEY = "sk-aitunnel-HpBrut7c9ESyGJLgOcGYbi8TKCKcdp4w";
const apiKey = process.env.AITUNNEL_API_KEY || REAL_AI_KEY;

export async function POST(req: Request) {
  try {
    const { reportId } = await req.json(); // ID текущего открытого репорта

    // 1. Находим целевое обращение
    const targetReport = await prisma.report.findUnique({
      where: { id: Number(reportId) },
    });
    if (!targetReport)
      return NextResponse.json({ error: "Репорт не найден" }, { status: 404 });

    // 2. Достаем другие репорты для сравнения (из того же департамента или просто свежие)
    const otherReports = await prisma.report.findMany({
      where: { NOT: { id: targetReport.id } },
      take: 15,
      orderBy: { createdAt: "desc" },
    });

    if (otherReports.length === 0) {
      return NextResponse.json({ similarReports: [] });
    }

    // Готовим список для ИИ
    const reportsListSummary = otherReports.map((r: any) => ({
      id: r.id,
      trackingId: r.trackingId,
      text: r.anonymizedText,
    }));

    // 3. Запрос к ИИ для семантического сравнения
    const response = await fetch(
      "https://api.aitunnel.ru/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `Ты — аналитический модуль системы ИИ-комплаенса. Твоя задача — сравнить ЦЕЛЕВОЕ ОБРАЩЕНИЕ со СПИСКОМ ДРУГИХ ОБРАЩЕНИЙ и найти скрытые взаимосвязи (например, жалобы на одного и того же анонимного преподавателя, схожие схемы вымогательства или системные проблемы отдела).

            Верни СТРОГО JSON-объект следующей структуры:
            {
              "similarReports": [
                {
                  "id": number,
                  "trackingId": "string",
                  "score": number, // процент совпадения от 0 до 100
                  "reason": "string" // краткое объяснение связи на русском языке
                }
              ]
            }

            В массив включай ТОЛЬКО те обращения, у которых score выше 40%. Если совпадений нет, верни пустой массив.`,
            },
            {
              role: "user",
              content: `ЦЕЛЕВОЕ ОБРАЩЕНИЕ: "${targetReport.anonymizedText}"

            СПИСОК ДРУГИХ ОБРАЩЕНИЙ ДЛЯ СРАВНЕНИЯ:
            ${JSON.stringify(reportsListSummary)}`,
            },
          ],
          temperature: 0.2,
        }),
      },
    );

    const data = await response.json();
    const aiJsonResponse = JSON.parse(data.choices[0].message.content.trim());

    return NextResponse.json({ similarReports: aiJsonResponse.similarReports });
  } catch (error: any) {
    console.error("Similarity Analysis Error:", error);
    return NextResponse.json(
      { error: "Ошибка ИИ при анализе связей" },
      { status: 500 },
    );
  }
}
