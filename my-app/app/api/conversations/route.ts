import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/auth";

// GET /api/conversations - Lista conversas do agente
export async function GET(request: AuthenticatedRequest) {
  const authError = await authMiddleware(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json(
        { error: "agentId é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica se agente pertence ao usuário
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        userId: request.user!.userId,
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agente não encontrado" },
        { status: 404 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: { agentId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Erro ao listar conversas:", error);
    return NextResponse.json(
      { error: "Erro ao listar conversas" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Cria nova conversa (webhook)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, customerPhone, customerName, message } = body;

    // Busca ou cria conversa
    let conversation = await prisma.conversation.findFirst({
      where: {
        agentId,
        customerPhone,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          agentId,
          customerPhone,
          customerName,
          messages: [
            {
              role: "user",
              content: message,
              timestamp: new Date().toISOString(),
            },
          ],
        },
      });
    } else {
      // Adiciona mensagem à conversa existente
      const messages = conversation.messages as any[];
      messages.push({
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });

      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { messages },
      });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Erro ao criar conversa:", error);
    return NextResponse.json(
      { error: "Erro ao criar conversa" },
      { status: 500 }
    );
  }
}
