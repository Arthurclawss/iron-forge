/**
 * Iron Forge — Notification & Webhook service (Server-side)
 * Dispatches notifications to Discord, Telegram, and simulates email auto-replies.
 */

interface LeadNotificationData {
  id: string;
  name: string;
  email: string;
  phone: string;
  goal: string;
  notes?: string | null;
  bestContactTime?: string | null;
  source?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
}

export async function dispatchNotifications(lead: LeadNotificationData) {
  const timeStr = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  console.log(`[Notification Service] Dispatched for Lead ${lead.id} (${lead.name}) at ${timeStr}`);

  // 1. Simular ou disparar e-mail auto-resposta
  try {
    await sendAutoReplyEmail(lead);
  } catch (e) {
    console.error("[Notification Service] Email auto-reply failed:", e);
  }

  // 2. Notificação no Discord via Webhook
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
  if (discordWebhook) {
    try {
      await sendDiscordNotification(discordWebhook, lead, timeStr);
    } catch (e) {
      console.error("[Notification Service] Discord webhook failed:", e);
    }
  } else {
    console.log("[Notification Service] Discord notifications are disabled (missing DISCORD_WEBHOOK_URL env)");
  }

  // 3. Notificação no Telegram
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChatId) {
    try {
      await sendTelegramNotification(tgToken, tgChatId, lead, timeStr);
    } catch (e) {
      console.error("[Notification Service] Telegram notification failed:", e);
    }
  } else {
    console.log("[Notification Service] Telegram notifications are disabled (missing TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID env)");
  }
}

/**
 * Envia um email automático ao lead confirmando o recebimento de seu contato.
 */
async function sendAutoReplyEmail(lead: LeadNotificationData) {
  console.log(`[Email Automation] Enviando email de boas-vindas para: ${lead.email}`);
  
  // Exemplo de integração real com Resend se o usuário possuir a chave
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Iron Forge <onboarding@resend.dev>",
        to: lead.email,
        subject: `Fala ${lead.name.split(" ")[0]}, sua transformação na Iron Forge começa agora!`,
        html: `
          <div style="font-family: sans-serif; background-color: #0d0909; color: #fbfafa; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #ff4d2e;">
            <h1 style="color: #ff4d2e; font-size: 24px; margin-bottom: 20px;">Fala ${lead.name.split(" ")[0]}, tudo pronto!</h1>
            <p>Seu cadastro para a aula experimental na <strong>Iron Forge</strong> foi recebido com sucesso.</p>
            <p><strong>Detalhes informados:</strong></p>
            <ul style="list-style: none; padding-left: 0; line-height: 1.8;">
              <li>🏋️‍♂️ <strong>Objetivo:</strong> ${lead.goal}</li>
              <li>📞 <strong>WhatsApp:</strong> ${lead.phone}</li>
              <li>⏰ <strong>Melhor horário:</strong> ${lead.bestContactTime || "Qualquer horário"}</li>
            </ul>
            <p>Nosso consultor entrará em contato com você pelo WhatsApp em menos de 15 minutos para reservar o seu horário.</p>
            <hr style="border: 0; border-top: 1px solid #33211e; margin: 25px 0;" />
            <p style="font-size: 12px; color: #a39592;">Iron Forge Premium Strength Club. Av. Paulista, 1.800, São Paulo/SP</p>
          </div>
        `
      }),
    });
    const result = await response.json();
    console.log(`[Email Automation] Response from Resend:`, result);
  } else {
    console.log("[Email Automation] Email disparado no modo simulação (defina RESEND_API_KEY no .env para ativar real).");
  }
}

/**
 * Notifica administradores via Webhook do Discord.
 */
async function sendDiscordNotification(webhookUrl: string, lead: LeadNotificationData, time: string) {
  const embed = {
    title: "🔥 Novo Lead Cadastrado!",
    color: 0xff4d2d, // vermelho ember
    timestamp: new Date().toISOString(),
    fields: [
      { name: "Nome", value: lead.name, inline: true },
      { name: "E-mail", value: lead.email, inline: true },
      { name: "WhatsApp", value: `[+${lead.phone}](https://wa.me/${lead.phone})`, inline: true },
      { name: "Objetivo", value: lead.goal, inline: true },
      { name: "Horário de Contato", value: lead.bestContactTime || "Não informado", inline: true },
      { name: "Origem (UTM Source)", value: lead.utm_source || lead.source || "Direto", inline: true },
      { name: "Campanha (UTM)", value: lead.utm_campaign || "Nenhuma", inline: true },
      { name: "Notas", value: lead.notes || "Nenhuma" }
    ],
    footer: { text: "Iron Forge CRM" }
  };

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] })
  });
}

/**
 * Notifica administradores via Telegram.
 */
async function sendTelegramNotification(token: string, chatId: string, lead: LeadNotificationData, time: string) {
  const text = `
🔥 *NOVO LEAD IRON FORGE*
*Nome:* ${lead.name}
*Email:* ${lead.email}
*WhatsApp:* [${lead.phone}](https://wa.me/${lead.phone})
*Objetivo:* ${lead.goal}
*Horário:* ${lead.bestContactTime || "Não especificado"}
*Origem:* ${lead.utm_source || lead.source || "Direto"}
*Notas:* ${lead.notes || "Nenhuma"}
  `.trim();

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      disable_web_page_preview: true
    })
  });
}
