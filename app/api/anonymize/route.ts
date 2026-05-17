// app/api/anonymize/route.ts
import { NextResponse } from "next/server";

const REAL_AI_KEY = "sk-aitunnel-HpBrut7c9ESyGJLgOcGYbi8TKCKcdp4w";
const apiKey = process.env.AITUNNEL_API_KEY || REAL_AI_KEY;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text)
      return NextResponse.json({ error: "Текст отсутствует" }, { status: 400 });

    // Заставляем ИИ отвечать строгим JSON-форматом
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
          // Включаем JSON-mode на уровне API для идеальной стабильности парсинга
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `Ты — ИИ-модуль безопасности системы "Контур доверия". Твоя задача — проанализировать входящее обращение студента.
            Ты должен вернуть СТРОГО JSON-объект с двумя полями:

            {
              "isSpam": boolean,
              "anonymizedText": "string"
            }

            Правила для поля "isSpam":
            - true: если текст является случайным набором букв (типа "ываыва"), бессмысленным набором символов, рекламой услуг или бессодержательным флудом.
            - false: если текст описывает реальную проблему, жалобу, конфликт, коррупцию или давление, даже если он написан очень эмоционально, сленгом или содержит ошибки.

            Правила для поля "anonymizedText":
            - Если isSpam равен false, перепиши текст в сухом, официальном комплаенс-стиле. Удали ВСЕ личные маркеры (ФИО, точные номера групп, денежные суммы, контакты, ссылки).
            - Если isSpam равен true, верни пустую строку "".`,
            },
            { role: "user", content: text },
          ],
          temperature: 0.1, // Минимальная температура для строгого следования инструкции
        }),
      },
    );

    const data = await response.json();

    // Парсим структурированный JSON, который вернул нам ИИ
    const aiJsonResponse = JSON.parse(data.choices[0].message.content.trim());

    // Возвращаем результат на фронтенд
    return NextResponse.json({
      isSpam: aiJsonResponse.isSpam,
      anonymizedText: aiJsonResponse.anonymizedText,
      error: aiJsonResponse.isSpam
        ? "Система классифицировала данное обращение как спам или бессодержательный набор символов."
        : null,
    });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: "Ошибка обработки контура ИИ" },
      { status: 500 },
    );
  }
}
