/**
 * Iron Forge — Configuração central do site.
 * Edite APENAS este arquivo para personalizar para outra academia.
 * Não é necessário tocar em nenhum outro arquivo de código.
 */

export const siteConfig = {
  // Identidade
  name: "Iron Forge",
  tagline: "Forjando físicos extraordinários",
  description:
    "A academia mais premium do Brasil. Treinos personalizados, equipamentos de última geração e resultados comprovados.",

  // Contato
  whatsapp: {
    // Apenas dígitos, com DDI (Brasil = 55) + DDD + número
    number: "5511999999999",
    display: "(11) 99999-9999",
    // Mensagem padrão enviada após cadastro
    leadMessage:
      "Olá, acabei de me cadastrar na Iron Forge e gostaria de agendar minha aula experimental.",
  },
  phone: "(11) 4002-8922",
  email: "contato@ironforge.com.br",

  // Endereço
  address: {
    street: "Av. Paulista, 1.800",
    district: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    full: "Av. Paulista, 1.800 · Bela Vista · São Paulo / SP",
    mapsUrl: "https://maps.google.com/?q=Av.+Paulista,+1800,+São+Paulo",
  },

  hours: "Seg–Sex 5h–23h · Sáb 7h–20h · Dom 8h–14h",

  // Redes sociais
  social: {
    instagram: "https://instagram.com/ironforge",
    youtube: "https://youtube.com/@ironforge",
    facebook: "",
    tiktok: "",
  },

  // Planos (texto livre — usado apenas para personalização, a landing tem seu próprio array)
  plans: {
    spark: { name: "Spark", price: "R$ 149", period: "/mês" },
    forge: { name: "Forge", price: "R$ 249", period: "/mês" },
    legacy: { name: "Legacy", price: "R$ 449", period: "/mês" },
  },

  // Analytics — deixe vazio para desabilitar
  analytics: {
    ga4: "" as string, // Ex: "G-XXXXXXX"
    metaPixel: "" as string, // Ex: "123456789012345"
  },

  // Endpoint público de captação de leads
  leadsEndpoint: "/api/public/leads",
} as const;

export type SiteConfig = typeof siteConfig;

/** Gera URL wa.me com mensagem pré-preenchida. */
export function buildWhatsAppUrl(message?: string): string {
  const msg = encodeURIComponent(message ?? siteConfig.whatsapp.leadMessage);
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${msg}`;
}