import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/auth";

// GET /api/agents/[id] - Detalhes do agente
export async function GET(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authMiddleware(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const agent = await prisma.agent.findFirst({
      where: {
        id,
        userId: request.user!.userId,
      },
      include: {
        conversations: {
          orderBy: { updatedAt: "desc" },
          take: 10,
          select: {
            id: true,
            customerName: true,
            customerPhone: true,
            status: true,
            updatedAt: true,
          },
        },
        appointments: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error("Erro ao buscar agente:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agente" },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/[id] - Atualiza agente
export async function PATCH(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authMiddleware(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();

    // Verifica se agente pertence ao usuário
    const existingAgent = await prisma.agent.findFirst({
      where: {
        id,
        userId: request.user!.userId,
      },
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: "Agente não encontrado" },
        { status: 404 }
      );
    }

    const agent = await prisma.agent.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({
      message: "Agente atualizado com sucesso",
      agent,
    });
  } catch (error) {
    console.error("Erro ao atualizar agente:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar agente" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id] - Remove agente
export async function DELETE(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authMiddleware(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    // Verifica se agente pertence ao usuário
    const existingAgent = await prisma.agent.findFirst({
      where: {
        id,
        userId: request.user!.userId,
      },
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: "Agente não encontrado" },
        { status: 404 }
      );
    }

    await prisma.agent.delete({ where: { id } });

    return NextResponse.json({
      message: "Agente removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover agente:", error);
    return NextResponse.json(
      { error: "Erro ao remover agente" },
      { status: 500 }
    );
  }
}
