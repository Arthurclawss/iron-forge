# Integração Google Sheets — Iron Forge

Todo lead é gravado primeiro no banco do Lovable Cloud. Para também enviar para uma planilha do Google Sheets (redundância), siga estes passos.

## 1. Crie a planilha

1. Vá em [sheets.new](https://sheets.new) e crie uma planilha chamada **Iron Forge — Leads**.
2. Na primeira linha, cole o cabeçalho:

```
Data | Nome | Email | WhatsApp | Objetivo | Origem | UTM Source | Observações | Horário contato
```

## 2. Cole o Apps Script

1. Na planilha: **Extensões → Apps Script**.
2. Apague o conteúdo e cole:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const d = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(d.created_at || Date.now()),
    d.name || "",
    d.email || "",
    d.phone || "",
    d.goal || "",
    d.source || "",
    d.utm_source || "",
    d.notes || "",
    d.best_contact_time || ""
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Salve (Ctrl+S).

## 3. Publique

1. **Implantar → Nova implantação**.
2. Tipo: **App da Web**.
3. Executar como: **Eu**.
4. Quem pode acessar: **Qualquer pessoa**.
5. Clique **Implantar**, autorize e **copie a URL** (termina em `/exec`).

## 4. Adicione no Lovable

No painel da Iron Forge, adicione um secret:

- Nome: `GOOGLE_SHEETS_WEBHOOK_URL`
- Valor: a URL `/exec` que você copiou.

Pronto. Cada novo lead aparecerá automaticamente na planilha além do banco.