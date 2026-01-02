interface TutorialStep {
  target: string
  title: string
  content: string
  placement: 'top' | 'bottom' | 'left' | 'right'
}

export const TUTORIAL_STEPS: Record<string, { pageName: string; steps: TutorialStep[] }> = {
  '/dashboard': {
    pageName: 'overview',
    steps: [
      {
        target: '[data-tutorial="metrics"]',
        title: 'Métricas em Tempo Real',
        content: 'Acompanhe tudo o que acontece no seu negócio em tempo real: pessoas na fila, tempo médio de espera e reservas de hoje.',
        placement: 'bottom',
      },
      {
        target: '[data-tutorial="analytics"]',
        title: 'Analytics',
        content: 'Veja o desempenho do seu negócio. Use os filtros para ver diferentes períodos e métricas.',
        placement: 'top',
      },
      {
        target: '[data-tutorial="qr-code"]',
        title: 'Compartilhe com Clientes',
        content: 'Use este QR Code ou link para seus clientes entrarem na fila. Cole na vitrine, redes sociais ou WhatsApp.',
        placement: 'top',
      },
      {
        target: '[data-tutorial="reservation-link"]',
        title: 'Link de Reservas',
        content: 'Compartilhe este link com seus clientes para fazerem reservas online.',
        placement: 'top',
      },
    ],
  },
  '/dashboard/fila': {
    pageName: 'fila',
    steps: [
      {
        target: '[data-tutorial="queue-list"]',
        title: 'Lista da Fila',
        content: 'Veja todas as pessoas aguardando atendimento. Você pode chamar, concluir ou cancelar cada entrada diretamente aqui.',
        placement: 'top',
      },
      {
        target: '[data-tutorial="queue-schedule"]',
        title: 'Escala de Horários',
        content: 'Configure os horários de funcionamento da fila para cada dia da semana. Defina quando sua fila estará aberta para receber clientes.',
        placement: 'top',
      },
    ],
  },
  '/dashboard/reservas': {
    pageName: 'reservas',
    steps: [
      {
        target: '[data-tutorial="reservations-list"]',
        title: 'Lista de Reservas',
        content: 'Visualize todas as reservas futuras. Gerencie confirmações, chegadas e cancelamentos.',
        placement: 'top',
      },
      {
        target: '[data-tutorial="reservation-schedule"]',
        title: 'Configurar Horários',
        content: 'Defina os horários disponíveis para reservas em cada dia da semana.',
        placement: 'top',
      },
      {
        target: '[data-tutorial="reservation-appearance"]',
        title: 'Personalizar Aparência',
        content: 'Customize as cores, logo e textos da sua página de reservas.',
        placement: 'top',
      },
    ],
  },
  '/dashboard/historico': {
    pageName: 'historico',
    steps: [
      {
        target: '[data-tutorial="history-filters"]',
        title: 'Filtros',
        content: 'Filtre o histórico por data, tipo de atendimento e status.',
        placement: 'top',
      },
      {
        target: '[data-tutorial="history-list"]',
        title: 'Histórico de Atendimentos',
        content: 'Veja todos os atendimentos e reservas passados com detalhes completos.',
        placement: 'top',
      },
      {
        target: '[data-tutorial="history-export"]',
        title: 'Exportar Dados',
        content: 'Exporte seu histórico para Excel ou PDF para análises externas.',
        placement: 'top',
      },
    ],
  },
  '/dashboard/relatorios': {
    pageName: 'relatorios',
    steps: [
      {
        target: '[data-tutorial="reports-period"]',
        title: 'Selecionar Período',
        content: 'Escolha o período que deseja analisar: hoje, semana, mês ou personalizado.',
        placement: 'top',
      },
      {
        target: '[data-tutorial="reports-metrics"]',
        title: 'Métricas Principais',
        content: 'Veja estatísticas detalhadas: total de atendimentos, tempo médio, horários de pico e mais.',
        placement: 'top',
      },
      {
        target: '[data-tutorial="reports-charts"]',
        title: 'Gráficos e Visualizações',
        content: 'Analise o desempenho através de gráficos interativos e compare períodos.',
        placement: 'top',
      },
    ],
  },
  '/dashboard/links': {
    pageName: 'links',
    steps: [
      {
        target: '[data-tutorial="links-preview"]',
        title: 'Prévia da Página',
        content: 'Veja como sua página de links aparece para seus clientes.',
        placement: 'top',
      },
      {
        target: '[data-tutorial="links-customize"]',
        title: 'Personalizar Links',
        content: 'Adicione, edite ou remova links para redes sociais, WhatsApp, site e mais.',
        placement: 'top',
      },
      {
        target: '[data-tutorial="links-appearance"]',
        title: 'Aparência',
        content: 'Customize cores, foto de perfil, bio e estilo dos botões.',
        placement: 'top',
      },
      {
        target: '[data-tutorial="links-share"]',
        title: 'Compartilhar',
        content: 'Copie o link da sua página para compartilhar nas redes sociais.',
        placement: 'top',
      },
    ],
  },
}
