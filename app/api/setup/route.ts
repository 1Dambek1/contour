import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    // Проверяем, есть ли уже такой пользователь
    const existingAdmin = await prisma.user.findUnique({
      where: { username: "ombudsman" },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Админ уже существует" });
    }

    // Хэшируем пароль из .env (или 'admin123' по умолчанию)
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        username: "ombudsman",
        password: hashedPassword,
        role: "ombudsman",
      },
    });

    return NextResponse.json({
      message: "Администратор успешно создан! Логин: ombudsman",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Ошибка создания админа" },
      { status: 500 },
    );
  }
}
