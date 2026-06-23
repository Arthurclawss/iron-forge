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
  
  if (d.event === "booking") {
    // É um agendamento. Vamos procurar o lead pelo e-mail ou WhatsApp
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const emailToFind = d.email || "";
    const phoneToFind = d.phone || "";
    
    let foundRowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      // Procura na coluna 2 (Email - index 2) ou coluna 3 (WhatsApp - index 3)
      if ((emailToFind && row[2] == emailToFind) || (phoneToFind && row[3] == phoneToFind)) {
        foundRowIndex = i + 1; // index 1-based do Sheets
        break;
      }
    }
    
    if (foundRowIndex !== -1) {
      // Atualiza a coluna 10 (J) com o horário do agendamento
      if (values[0].length < 10 || values[0][9] !== "Agendamento") {
        sheet.getRange(1, 10).setValue("Agendamento");
      }
      sheet.getRange(foundRowIndex, 10).setValue(d.booking_time);
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, updated: true }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      // Se não achar o lead, adiciona uma linha separada para o agendamento
      sheet.appendRow([
        new Date(d.created_at || Date.now()),
        d.name || "Agendamento Avulso",
        d.email || "",
        d.phone || "",
        "", "", "", d.notes || "", "", d.booking_time || ""
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, appended: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    // É um cadastro de lead comum
    const dataRange = sheet.getDataRange();
    if (dataRange.getLastColumn() < 10) {
      sheet.getRange(1, 10).setValue("Agendamento");
    }
    sheet.appendRow([
      new Date(d.created_at || Date.now()),
      d.name || "",
      d.email || "",
      d.phone || "",
      d.goal || "",
      d.source || "",
      d.utm_source || "",
      d.notes || "",
      d.best_contact_time || "",
      d.booking_time || ""
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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