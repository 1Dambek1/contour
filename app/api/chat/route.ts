// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. ПОЛУЧЕНИЕ ИСТОРИИ ЧАТА
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingId = searchParams.get("trackingId");

    if (!trackingId) {
      return NextResponse.json(
        { error: "Идентификатор trackingId отсутствует" },
        { status: 400 },
      );
    }

    // Ищем обращение и подтягиваем связанные сообщения
    const report = await prisma.report.findUnique({
      where: { trackingId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Обращение не найдено" },
        { status: 404 },
      );
    }

    return NextResponse.json({ messages: report.messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. ОТПРАВКА НОВОГО СООБЩЕНИЯ В ЧАТ
export async function POST(req: Request) {
  try {
    const { trackingId, sender, text } = await req.json();

    if (!trackingId || !sender || !text.trim()) {
      return NextResponse.json(
        { error: "Заполнены не все обязательные поля" },
        { status: 400 },
      );
    }

    // Находим отчет, чтобы получить его внутренний инкрементный ID
    const report = await prisma.report.findUnique({
      where: { trackingId },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Обращение для данного чата не существует" },
        { status: 404 },
      );
    }

    // Железобетонная запись сообщения в базу через Prisma 5
    const newMessage = await prisma.message.create({
      data: {
        reportId: report.id,
        sender, // 'applicant' (студент) или 'ombudsman' (комиссия)
        text: text.trim(),
      },
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
