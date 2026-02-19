import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/auth";

export async function GET(request: AuthenticatedRequest) {
  // Verifica autenticação
  const authError = await authMiddleware(request);
  if (authError) return authError;

  try {
    const user = await prisma.user.findUnique({
      where: { id: request.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        businessName: true,
        segment: true,
        createdAt: true,
        agents: {
          select: {
            id: true,
            name: true,
            status: true,
            totalConversations: true,
            totalAppointments: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: AuthenticatedRequest) {
  // Verifica autenticação
  const authError = await authMiddleware(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, phone, businessName, segment } = body;

    const user = await prisma.user.update({
      where: { id: request.user!.userId },
      data: {
        name,
        phone,
        businessName,
        segment,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        businessName: true,
        segment: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Usuário atualizado com sucesso",
      user,
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}
