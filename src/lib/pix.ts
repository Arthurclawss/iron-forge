/**
 * Gerador de payload PIX BR Code (padrão EMV QR Code)
 * Compatível com qualquer app bancário brasileiro.
 */

function formatLength(value: string): string {
  return String(value.length).padStart(2, "0");
}

function tlv(id: string, value: string): string {
  return `${id}${formatLength(value)}${value}`;
}

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

export interface PixPayloadOptions {
  key: string;
  name: string;  // Merchant name (max 25 chars)
  city: string;  // Merchant city (max 15 chars)
  amount?: number; // If omitted, user types amount in app
  description?: string; // Optional description (max 50 chars)
  txId?: string;  // Transaction ID (optional)
}

export function generatePixPayload(opts: PixPayloadOptions): string {
  const name = opts.name.substring(0, 25).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const city = opts.city.substring(0, 15).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  // Merchant Account Information (26xx)
  const pixKey = tlv("01", opts.key);
  const description = opts.description ? tlv("02", opts.description.substring(0, 50)) : "";
  const gui = tlv("00", "br.gov.bcb.pix");
  const merchantAccountInfo = tlv("26", gui + pixKey + description);

  // Additional Data Field (62xx) - txId / reference label
  const txId = opts.txId ? opts.txId.substring(0, 25).replace(/[^a-zA-Z0-9]/g, "") : "***";
  const additionalData = tlv("62", tlv("05", txId));

  // Amount (54xx) - optional
  const amountField = opts.amount ? tlv("54", opts.amount.toFixed(2)) : "";

  // Assemble payload (without CRC)
  const payload =
    tlv("00", "01") +          // Payload Format Indicator
    merchantAccountInfo +       // Merchant Account Information
    tlv("52", "0000") +        // Merchant Category Code (gym/services)
    tlv("53", "986") +         // Currency (BRL = 986)
    amountField +               // Amount (optional)
    tlv("58", "BR") +          // Country Code
    tlv("59", name) +           // Merchant Name
    tlv("60", city) +           // Merchant City
    additionalData +            // Additional Data
    "6304";                     // CRC placeholder

  return payload + crc16(payload);
}
