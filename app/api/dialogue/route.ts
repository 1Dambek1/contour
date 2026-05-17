import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { reportId, text, sender, trackingId, accessKey } = await req.json();

    // Если пишет заявитель, дополнительно верифицируем его права по ключам
    if (sender === "applicant") {
      const verify = await prisma.report.findFirst({
        where: { id: reportId, trackingId, accessKey },
      });
      if (!verify)
        return NextResponse.json({ error: "Доступ запрещен" }, { status: 0 });
    }

    // Сохраняем сообщение в базу данных
    const newMessage = await prisma.message.create({
      data: {
        reportId: parseInt(reportId),
        text,
        sender, // 'applicant' или 'ombudsman'
      },
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось отправить сообщение" },
      { status: 500 },
    );
  }
}
