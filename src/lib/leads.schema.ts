import { z } from "zod";

export const LEAD_GOALS = [
  "emagrecimento",
  "hipertrofia",
  "performance",
  "condicionamento",
  "outro",
] as const;

export const LEAD_STATUSES = [
  "novo",
  "contatado",
  "interessado",
  "matriculado",
  "perdido",
] as const;

export type LeadGoal = (typeof LEAD_GOALS)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const goalLabels: Record<LeadGoal, string> = {
  emagrecimento: "Emagrecimento",
  hipertrofia: "Hipertrofia",
  performance: "Performance",
  condicionamento: "Condicionamento",
  outro: "Outro",
};

export const statusLabels: Record<LeadStatus, string> = {
  novo: "Novo",
  contatado: "Contatado",
  interessado: "Interessado",
  matriculado: "Matriculado",
  perdido: "Perdido",
};

// Aceita 10 ou 11 dígitos (com/sem 9), opcionalmente +55.
const phoneRegex = /^(\+?55)?\s*\(?\d{2}\)?\s*9?\d{4}-?\d{4}$/;

export const leadFormSchema = z.object({
  name: z
    .string({ required_error: "Informe seu nome" })
    .trim()
    .min(2, "Nome muito curto")
    .max(120, "Nome muito longo"),
  email: z
    .string({ required_error: "Informe seu email" })
    .trim()
    .toLowerCase()
    .email("Email inválido")
    .max(200, "Email muito longo"),
  phone: z
    .string({ required_error: "Informe seu WhatsApp" })
    .trim()
    .regex(phoneRegex, "WhatsApp inválido. Ex: (11) 99999-9999"),
  goal: z.enum(LEAD_GOALS, { errorMap: () => ({ message: "Selecione um objetivo" }) }),
  notes: z.string().trim().max(1000, "Observação muito longa").optional().or(z.literal("")),
  bestContactTime: z
    .string()
    .trim()
    .max(80, "Texto muito longo")
    .optional()
    .or(z.literal("")),
  // Honeypot: bots normalmente preenchem; humanos não veem.
  website: z.string().max(0, "Spam detectado").optional().or(z.literal("")),
  // Tracking
  source: z.string().max(40).optional(),
  utm_source: z.string().max(80).optional(),
  utm_medium: z.string().max(80).optional(),
  utm_campaign: z.string().max(120).optional(),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

/** Normaliza WhatsApp para apenas dígitos com DDI 55. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}