import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { trackingId, accessKey } = await req.json();

    // Ищем обращение в базе по связке ID и Ключа
    const report = await prisma.report.findFirst({
      where: {
        trackingId: trackingId,
        accessKey: accessKey,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Неверный Tracking ID или секретный ключ" },
        { status: 404 },
      );
    }

    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
