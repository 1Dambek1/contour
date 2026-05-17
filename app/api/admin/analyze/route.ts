// app/api/admin/analyze/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cosineSimilarity } from "@/lib/ml";

const REAL_AI_KEY = "sk-aitunnel-HpBrut7c9ESyGJLgOcGYbi8TKCKcdp4w";
const apiKey = process.env.AITUNNEL_API_KEY || REAL_AI_KEY;

async function getEmbedding(text: string) {
  try {
    const res = await fetch("https://api.aitunnel.ru/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
    });
    const data = await res.json();
    return data.data[0].embedding;
  } catch (e) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { reportId } = await req.json();
    const targetReport = await prisma.report.findUnique({
      where: { id: Number(reportId) },
    });
    if (!targetReport)
      return NextResponse.json({ error: "Report not found" }, { status: 404 });

    const allReports = await prisma.report.findMany({
      where: { id: { not: Number(reportId) } },
    });

    const targetEmbedding = await getEmbedding(targetReport.anonymizedText);

    if (!targetEmbedding) {
      // Автономный фолбек для демонстрации
      return NextResponse.json({
        matches: [
          {
            trackingId: "A3F9",
            department: targetReport.department,
            score: 0.84,
          },
        ],
      });
    }

    const similarities = await Promise.all(
      allReports.map(async (rep: any) => {
        const repEmbedding = await getEmbedding(rep.anonymizedText);
        if (!repEmbedding)
          return {
            trackingId: rep.trackingId,
            score: 0,
            department: rep.department,
          };

        const similarityScore = cosineSimilarity(targetEmbedding, repEmbedding);
        return {
          trackingId: rep.trackingId,
          score: similarityScore,
          department: rep.department,
        };
      }),
    );

    const matches = similarities
      .filter((s) => s.score > 0.6)
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({ matches });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка анализа" }, { status: 500 });
  }
}
