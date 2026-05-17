// app/api/submit/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      mode,
      category,
      department,
      originalText,
      anonymizedText,
      files,
      fullName,
    } = data;

    // Генерация ключей происходит мгновенно
    const trackingId = crypto.randomBytes(4).toString("hex").toUpperCase();
    const accessKey = crypto.randomBytes(8).toString("hex");

    const finalOriginalText =
      mode === "open" && fullName
        ? `[ОФИЦИАЛЬНОЕ ОТКРЫТОЕ ОБРАЩЕНИЕ]\nЗАЯВИТЕЛЬ: ${fullName}\n\nОригинальный текст:\n${originalText}`
        : originalText;

    const processedFiles = files
      ? files.map((f: any) => ({
          name: `safe_evidence_${crypto.randomBytes(2).toString("hex")}.${f.ext}`,
          size: f.size,
          cleared: true,
        }))
      : [];

    // Запись в базу за миллисекунды
    const newReport = await prisma.report.create({
      data: {
        trackingId,
        accessKey,
        mode,
        category,
        department,
        originalText: finalOriginalText,
        anonymizedText,
        evidenceFiles: JSON.stringify(processedFiles),
        riskLevel:
          category === "corruption" || category === "harassment"
            ? "high"
            : "medium",
      },
    });

    return NextResponse.json({
      trackingId: newReport.trackingId,
      accessKey: newReport.accessKey,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Ошибка сохранения" },
      { status: 500 },
    );
  }
}
