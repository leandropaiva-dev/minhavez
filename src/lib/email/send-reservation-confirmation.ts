/**
 * Helper function to send reservation confirmation email
 * Can be called from client components
 */
export async function sendReservationConfirmation(reservationId: string) {
  try {
    const response = await fetch('/api/reservations/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reservationId }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao enviar email de confirmação')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Erro ao enviar confirmação:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
