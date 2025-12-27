import * as React from 'react'

interface ReservationConfirmationEmailProps {
  customerName: string
  businessName: string
  reservationDate: string
  reservationTime: string
  partySize?: number
  notes?: string
}

export const ReservationConfirmationEmail = ({
  customerName,
  businessName,
  reservationDate,
  reservationTime,
  partySize,
  notes,
}: ReservationConfirmationEmailProps) => {
  return (
    <html>
      <head>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #18181b;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .card {
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #6b7280;
          }
          .value {
            color: #111827;
            font-weight: 500;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
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
        `}</style>
      </head>
      <body>
        <div className="header">
          <div className="check-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Reserva Confirmada!</h1>
        </div>

        <div className="content">
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>
            Olá <strong>{customerName}</strong>,
          </p>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            Sua reserva em <strong style={{ color: '#111827' }}>{businessName}</strong> foi confirmada com sucesso.
          </p>

          <div className="card">
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#111827' }}>
              Detalhes da Reserva
            </h2>

            <div className="info-row">
              <span className="label">Data</span>
              <span className="value">{reservationDate}</span>
            </div>

            <div className="info-row">
              <span className="label">Horário</span>
              <span className="value">{reservationTime}</span>
            </div>

            {partySize && (
              <div className="info-row">
                <span className="label">Pessoas</span>
                <span className="value">{partySize}</span>
              </div>
            )}

            {notes && (
              <div className="info-row">
                <span className="label">Observações</span>
                <span className="value">{notes}</span>
              </div>
            )}
          </div>

          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '20px' }}>
            Por favor, chegue com alguns minutos de antecedência. Caso precise cancelar ou reagendar, entre em contato conosco.
          </p>

          <p style={{ fontSize: '16px', marginTop: '30px', marginBottom: '5px' }}>
            Obrigado por escolher o <strong>{businessName}</strong>!
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Estamos ansiosos para atendê-lo.
          </p>
        </div>

        <div className="footer">
          <p>Este é um email automático, por favor não responda.</p>
          <p style={{ fontSize: '12px', marginTop: '10px' }}>
            Powered by MinhaVez
          </p>
        </div>
      </body>
    </html>
  )
}
