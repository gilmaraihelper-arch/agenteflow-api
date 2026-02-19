import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

interface WhatsAppMessage {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "text" | "template";
  text?: { body: string };
  template?: {
    name: string;
    language: { code: string };
  };
}

/**
 * Envia mensagem via WhatsApp Business API
 */
export async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  message: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const url = `${WHATSAPP_API_URL}/${phoneNumberId}/messages`;

    const payload: WhatsAppMessage = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to.replace(/\D/g, ""), // Remove não-dígitos
      type: "text",
      text: { body: message },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro WhatsApp API:", data);
      return {
        success: false,
        error: data.error?.message || "Erro ao enviar mensagem",
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error("Erro ao enviar mensagem WhatsApp:", error);
    return {
      success: false,
      error: "Erro de conexão",
    };
  }
}

/**
 * Envia template de mensagem (para números não registrados)
 */
export async function sendWhatsAppTemplate(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  templateName: string,
  languageCode: string = "pt_BR"
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const url = `${WHATSAPP_API_URL}/${phoneNumberId}/messages`;

    const payload: WhatsAppMessage = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to.replace(/\D/g, ""),
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro WhatsApp API:", data);
      return {
        success: false,
        error: data.error?.message || "Erro ao enviar template",
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error("Erro ao enviar template WhatsApp:", error);
    return {
      success: false,
      error: "Erro de conexão",
    };
  }
}

/**
 * Verifica status de uma mensagem
 */
export async function getMessageStatus(
  accessToken: string,
  messageId: string
): Promise<any> {
  try {
    const url = `${WHATSAPP_API_URL}/${messageId}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao verificar status:", error);
    return null;
  }
}

/**
 * Registra número de telefone para testes
 */
export async function registerPhoneNumber(
  businessAccountId: string,
  accessToken: string,
  phoneNumber: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${WHATSAPP_API_URL}/${businessAccountId}/phone_numbers`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cc: "55", // Código do Brasil
        phone_number: phoneNumber.replace(/\D/g, ""),
        migrate_phone_number_to_business: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || "Erro ao registrar número",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao registrar número:", error);
    return { success: false, error: "Erro de conexão" };
  }
}
