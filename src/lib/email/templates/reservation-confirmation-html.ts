interface ReservationConfirmationEmailProps {
  customerName: string
  businessName: string
  reservationDate: string
  reservationTime: string
  partySize?: number
  notes?: string
  logoUrl?: string
}

export function getReservationConfirmationHTML({
  customerName,
  businessName,
  reservationDate,
  reservationTime,
  partySize,
  notes,
  logoUrl,
}: ReservationConfirmationEmailProps): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f9fafb;
      }
      .header {
        background-color: #18181b;
        color: white;
        padding: 30px;
        text-align: center;
        border-radius: 8px 8px 0 0;
      }
      .content {
        background-color: #ffffff;
        padding: 30px;
        border-radius: 0 0 8px 8px;
      }
      .card {
        background-color: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid #e5e7eb;
        gap: 20px;
      }
      .info-row:last-child {
        border-bottom: none;
      }
      .label {
        font-weight: 600;
        color: #6b7280;
        min-width: 100px;
      }
      .value {
        color: #111827;
        font-weight: 500;
        text-align: right;
        flex: 1;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        color: #6b7280;
        font-size: 14px;
      }
      .logo-container {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        margin: 0 auto 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background-color: #10b981;
      }
      .logo-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .check-icon {
        width: 48px;
        height: 48px;
        background-color: #10b981;
        border-radius: 50%;
        margin: 0 auto 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      h1 {
        margin: 0;
        font-size: 24px;
      }
      h2 {
        margin: 0 0 20px 0;
        font-size: 18px;
        color: #111827;
      }
    </style>
  </head>
  <body>
    <div class="header">
      ${logoUrl ? `
      <div class="logo-container">
        <img src="${logoUrl}" alt="${businessName}" />
      </div>
      ` : `
      <div class="check-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      `}
      <h1>${businessName} - Reserva Confirmada!</h1>
    </div>

    <div class="content">
      <p style="font-size: 16px; margin-bottom: 10px;">
        Olá <strong>${customerName}</strong>,
      </p>
      <p style="font-size: 16px; color: #6b7280;">
        Sua reserva em <strong style="color: #111827;">${businessName}</strong> foi confirmada com sucesso.
      </p>

      <div class="card">
        <h2>Detalhes da Reserva</h2>

        <div class="info-row">
          <span class="label">Data</span>
          <span class="value">${reservationDate}</span>
        </div>

        <div class="info-row">
          <span class="label">Horário</span>
          <span class="value">${reservationTime}</span>
        </div>

        ${partySize ? `
        <div class="info-row">
          <span class="label">Pessoas</span>
          <span class="value">${partySize}</span>
        </div>
        ` : ''}

        ${notes ? `
        <div class="info-row">
          <span class="label">Observações</span>
          <span class="value">${notes}</span>
        </div>
        ` : ''}
      </div>

      <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
        Por favor, chegue com alguns minutos de antecedência. Caso precise cancelar ou reagendar, entre em contato conosco.
      </p>

      <p style="font-size: 16px; margin-top: 30px; margin-bottom: 5px;">
        Obrigado por escolher o <strong>${businessName}</strong>!
      </p>
      <p style="font-size: 14px; color: #6b7280; margin: 0;">
        Estamos ansiosos para atendê-lo.
      </p>
    </div>

    <div class="footer">
      <p>Este é um email automático, por favor não responda.</p>
      <p style="font-size: 12px; margin-top: 10px;">
        Powered by MinhaVez
      </p>
    </div>
  </body>
</html>
`
}
