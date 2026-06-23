import { z } from "zod";

export const CUSTOMER_PLANS = ["spark", "forge", "legacy", "outro"] as const;
export const CUSTOMER_STATUSES = ["ativo", "inativo", "suspenso", "cancelado"] as const;

export type CustomerPlan = (typeof CUSTOMER_PLANS)[number];
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export const planLabels: Record<CustomerPlan, string> = {
  spark: "Spark",
  forge: "Forge",
  legacy: "Legacy",
  outro: "Outro",
};

export const statusLabels: Record<CustomerStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  suspenso: "Suspenso",
  cancelado: "Cancelado",
};

// Aceita 10 ou 11 dígitos (com/sem 9), opcionalmente +55.
const phoneRegex = /^(\+?55)?\s*\(?\d{2}\)?\s*9?\d{4}-?\d{4}$/;

// CPF simples (apenas formato — validação de dígitos pode ser adicionada se necessário)
const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;

export const customerFormSchema = z.object({
  // Dados pessoais
  name: z
    .string({ required_error: "Informe o nome" })
    .trim()
    .min(2, "Nome muito curto")
    .max(120, "Nome muito longo"),
  email: z
    .string({ required_error: "Informe o email" })
    .trim()
    .toLowerCase()
    .email("Email inválido")
    .max(200, "Email muito longo"),
  phone: z
    .string({ required_error: "Informe o WhatsApp" })
    .trim()
    .regex(phoneRegex, "WhatsApp inválido. Ex: (11) 99999-9999"),
  birth_date: z.string().optional().or(z.literal("")),
  cpf: z
    .string()
    .trim()
    .regex(cpfRegex, "CPF inválido. Ex: 000.000.000-00")
    .optional()
    .or(z.literal("")),

  // Plano
  plan: z.enum(CUSTOMER_PLANS, { errorMap: () => ({ message: "Selecione um plano" }) }),
  plan_start: z.string().optional().or(z.literal("")),
  plan_end: z.string().optional().or(z.literal("")),
  status: z.enum(CUSTOMER_STATUSES).default("ativo"),
  monthly_value: z.coerce.number().min(0).max(99999).optional(),

  // Endereço
  address_street: z.string().trim().max(200).optional().or(z.literal("")),
  address_city: z.string().trim().max(100).optional().or(z.literal("")),
  address_state: z.string().trim().max(2).optional().or(z.literal("")),
  address_zip: z.string().trim().max(9).optional().or(z.literal("")),

  // Saúde / treino
  goal: z
    .enum(["emagrecimento", "hipertrofia", "performance", "condicionamento", "outro"])
    .optional(),
  health_notes: z.string().trim().max(2000).optional().or(z.literal("")),
  personal_trainer: z.string().trim().max(120).optional().or(z.literal("")),

  // Contato de emergência
  emergency_name: z.string().trim().max(120).optional().or(z.literal("")),
  emergency_phone: z.string().trim().max(20).optional().or(z.literal("")),

  // Vínculo com lead (opcional — para rastrear a origem)
  lead_id: z.string().uuid().optional().or(z.literal("")),
});

export type CustomerFormInput = z.infer<typeof customerFormSchema>;

/** Normaliza WhatsApp para apenas dígitos com DDI 55. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}
