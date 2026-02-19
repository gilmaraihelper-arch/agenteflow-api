import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/auth";

// GET /api/agents - Lista todos os agentes do usuário
export async function GET(request: AuthenticatedRequest) {
  const authError = await authMiddleware(request);
  if (authError) return authError;

  try {
    const agents = await prisma.agent.findMany({
      where: { userId: request.user!.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ agents });
  } catch (error) {
    console.error("Erro ao listar agentes:", error);
    return NextResponse.json(
      { error: "Erro ao listar agentes" },
      { status: 500 }
    );
  }
}

// POST /api/agents - Cria novo agente
export async function POST(request: AuthenticatedRequest) {
  const authError = await authMiddleware(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      name,
      objective,
      tone,
      serviceInfo,
      faq,
      workHours,
      calendarProvider,
      whatsappNumber,
    } = body;

    // Validações
    if (!name || !objective || !tone || !serviceInfo || !workHours) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        userId: request.user!.userId,
        objective,
        tone,
        serviceInfo,
        faq,
        workHours,
        calendarProvider,
        whatsappNumber,
        status: "pending",
      },
    });

    return NextResponse.json(
      { message: "Agente criado com sucesso", agent },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar agente:", error);
    return NextResponse.json(
      { error: "Erro ao criar agente" },
      { status: 500 }
    );
  }
}
