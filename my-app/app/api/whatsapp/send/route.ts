import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, AuthenticatedRequest } from "@/lib/auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// POST /api/whatsapp/send - Envia mensagem
export async function POST(request: AuthenticatedRequest) {
  const authError = await authMiddleware(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { to, message, agentId } = body;

    if (!to || !message || !agentId) {
      return NextResponse.json(
        { error: "Número, mensagem e agentId são obrigatórios" },
        { status: 400 }
      );
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        { error: "WhatsApp não configurado" },
        { status: 500 }
      );
    }

    const result = await sendWhatsAppMessage(
      phoneNumberId,
      accessToken,
      to,
      message
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
