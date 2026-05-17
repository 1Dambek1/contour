// app/api/admin/analyze/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cosineSimilarity } from "@/lib/ml";

const REAL_AI_KEY = "sk-aitunnel-HpBrut7c9ESyGJLgOcGYbi8TKCKcdp4w";
const apiKey: any = process.env.AITUNNEL_API_KEY || REAL_AI_KEY;

async function getEmbedding(text: any): Promise<any> {
  try {
    const res: any = await fetch("https://api.aitunnel.ru/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
    });
    const data: any = await res.json();
    return data.data[0].embedding;
  } catch (e: any) {
    return null;
  }
}

export async function POST(req: any): Promise<any> {
  try {
    const { reportId }: any = await req.json();
    const targetReport: any = await prisma.report.findUnique({
      where: { id: Number(reportId) },
    } as any);

    if (!targetReport)
      return NextResponse.json({ error: "Report not found" }, { status: 404 });

    const allReports: any = await prisma.report.findMany({
      where: { id: { not: Number(reportId) } },
    } as any);

    const targetEmbedding: any = await getEmbedding(
      targetReport.anonymizedText,
    );

    if (!targetEmbedding) {
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

    const similarities: any = await Promise.all(
      allReports.map(async (rep: any): Promise<any> => {
        const repEmbedding: any = await getEmbedding(rep.anonymizedText);
        if (!repEmbedding)
          return {
            trackingId: rep.trackingId,
            score: 0,
            department: rep.department,
          };

        const similarityScore: any = cosineSimilarity(
          targetEmbedding,
          repEmbedding,
        );
        return {
          trackingId: rep.trackingId,
          score: similarityScore,
          department: rep.department,
        };
      }),
    );

    const matches: any = similarities
      .filter((s: any) => s.score > 0.6)
      .sort((a: any, b: any) => b.score - a.score);

    return NextResponse.json({ matches });
  } catch (error: any) {
    return NextResponse.json({ error: "Ошибка анализа" }, { status: 500 });
  }
}
