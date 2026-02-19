import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/webhooks/whatsapp - Verificação do webhook (Meta)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Webhook verificado com sucesso");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verificação falhou" }, { status: 403 });
}

// POST /api/webhooks/whatsapp - Recebe mensagens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Webhook recebido:", JSON.stringify(body, null, 2));

    // Processa mensagens do WhatsApp
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages.length > 0) {
      const message = messages[0];
      const from = message.from; // Número do remetente
      const text = message.text?.body; // Conteúdo da mensagem
      const phoneNumberId = value.metadata?.phone_number_id;

      console.log(`Mensagem de ${from}: ${text}`);

      // Busca agente pelo número do WhatsApp
      const agent = await prisma.agent.findFirst({
        where: { whatsappNumber: phoneNumberId },
      });

      if (agent) {
        // Busca ou cria conversa
        let conversation = await prisma.conversation.findFirst({
          where: {
            agentId: agent.id,
            customerPhone: from,
          },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              agentId: agent.id,
              customerPhone: from,
              messages: [
                {
                  role: "user",
                  content: text,
                  timestamp: new Date().toISOString(),
                },
              ],
            },
          });
        } else {
          const messages = conversation.messages as any[];
          messages.push({
            role: "user",
            content: text,
            timestamp: new Date().toISOString(),
          });

          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { messages },
          });
        }

        // TODO: Integrar com OpenAI para gerar resposta
        // TODO: Enviar resposta de volta via WhatsApp API
      }
    }

    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
