export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserCreateInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  businessName?: string;
  segment?: string;
}

export interface AgentCreateInput {
  name: string;
  objective: string;
  tone: string;
  serviceInfo: string;
  faq?: string;
  workHours: string;
  calendarProvider?: string;
  whatsappNumber?: string;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}
