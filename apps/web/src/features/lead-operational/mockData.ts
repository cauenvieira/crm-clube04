import type { OperationalLead } from "./types";

export const queueLabels = {
  fazer_follow_up: {
    title: "Fazer follow-up",
    description: "Atendimento ativo e proximas tentativas."
  },
  validar_agendamento: {
    title: "Validar agendamento",
    description: "Confirmar comparecimento ou remarcacao."
  },
  revisar_lideranca: {
    title: "Revisar lideranca",
    description: "Excecoes e decisoes gerenciais."
  },
  nutricao_campanha: {
    title: "Nutricao",
    description: "Campanhas e reativacao fora da rotina diaria."
  }
} as const;

export const operationalLeads: OperationalLead[] = [
  {
    id: "lead-maria-souza",
    tutorName: "Maria Souza",
    pets: ["Nina", "Thor"],
    phone: "5511999990000",
    queue: "fazer_follow_up",
    status: "aguardando_resposta",
    nextActionLabel: "Hoje 16:30",
    nextActionBucket: "today",
    responsible: "Atendente",
    origin: "Meta Ads Instagram",
    lastResult: "Sem resposta",
    observation: "Pediu valores de banho e tosa.",
    primarySituation: { label: "Hoje", tone: "info" },
    tags: [
      { label: "Sem resposta", tone: "warning" },
      { label: "Tentativa 3/12", tone: "warning" },
      { label: "Banho", tone: "default" }
    ],
    semRespostaCount: 3,
    followUpCount: 5,
    history: [
      { at: "Hoje 10:32", event: "Resultado registrado", detail: "Sem resposta no WhatsApp." },
      { at: "Ontem 18:10", event: "Proxima acao", detail: "Sistema recalculou follow-up." }
    ]
  },
  {
    id: "lead-carla-mendes",
    tutorName: "Carla Mendes",
    pets: ["Bento"],
    phone: "5511988880000",
    queue: "fazer_follow_up",
    status: "aguardando_resposta",
    nextActionLabel: "Atrasado ha 12d",
    nextActionBucket: "backlog",
    responsible: "Etiene",
    origin: "Google Pesquisa",
    lastResult: "Sem resposta",
    observation: "Lead sem retorno desde D+6.",
    primarySituation: { label: "Backlog 12d", tone: "danger" },
    tags: [
      { label: "Sem resposta", tone: "warning" },
      { label: "Tentativa 10/12", tone: "danger" },
      { label: "Meta Ads", tone: "muted" }
    ],
    semRespostaCount: 10,
    followUpCount: 14,
    history: [
      { at: "31/05 09:30", event: "Tentativa", detail: "Mensagem curta enviada." },
      { at: "30/05 16:30", event: "Tentativa", detail: "Video/oferta contextual." }
    ]
  },
  {
    id: "lead-ana-paula",
    tutorName: "Ana Paula",
    pets: ["Mel"],
    phone: "5511977770000",
    queue: "fazer_follow_up",
    status: "em_atendimento",
    nextActionLabel: "20/06 09:30",
    nextActionBucket: "next7",
    responsible: "Atendente",
    origin: "Indicacao",
    lastResult: "Demonstrou interesse",
    observation: "Pediu para retomar depois de viagem.",
    primarySituation: { label: "FU longo 10d", tone: "warning" },
    tags: [
      { label: "Follow-up longo", tone: "warning" },
      { label: "Motivo informado", tone: "muted" },
      { label: "Pacote", tone: "default" }
    ],
    semRespostaCount: 1,
    followUpCount: 2,
    longFollowUpReason: "Tutor pediu retorno apos viagem.",
    history: [
      { at: "Hoje 11:10", event: "Interesse", detail: "Perguntou sobre pacote recorrente." },
      { at: "Hoje 11:12", event: "Alerta", detail: "Follow-up longo com motivo." }
    ]
  },
  {
    id: "lead-joao-silva",
    tutorName: "Joao Silva",
    pets: ["Luna"],
    phone: "5511966660000",
    queue: "validar_agendamento",
    status: "agendado",
    nextActionLabel: "Hoje 17:00",
    nextActionBucket: "today",
    responsible: "Atendente",
    origin: "Meta Ads Facebook",
    lastResult: "Agendamento combinado",
    observation: "Cadastro incompleto, falta CPF do tutor.",
    primarySituation: { label: "Validar hoje", tone: "info" },
    tags: [
      { label: "Agendou", tone: "success" },
      { label: "Cadastro incompleto", tone: "warning" },
      { label: "Banho e tosa", tone: "default" }
    ],
    semRespostaCount: 0,
    followUpCount: 3,
    appointment: "Hoje 15:00 - banho e tosa",
    history: [
      { at: "Ontem 14:30", event: "Agendamento", detail: "Banho e tosa combinado." },
      { at: "Ontem 14:35", event: "Cadastro", detail: "Cadastro salvo incompleto." }
    ]
  },
  {
    id: "lead-patricia-rocha",
    tutorName: "Patricia Rocha",
    pets: ["Tobias"],
    phone: "5511955550000",
    queue: "revisar_lideranca",
    status: "revisar_lideranca",
    nextActionLabel: "Hoje",
    nextActionBucket: "today",
    responsible: "Lideranca",
    origin: "Meta Ads Instagram",
    lastResult: "Enviar lideranca",
    observation: "Caso sensivel: pet reativo e tutor inseguro.",
    primarySituation: { label: "Lideranca", tone: "danger" },
    tags: [
      { label: "Caso sensivel", tone: "danger" },
      { label: "Pet reativo", tone: "warning" },
      { label: "Checklist ok", tone: "success" }
    ],
    semRespostaCount: 2,
    followUpCount: 6,
    leadershipReason: "Caso sensivel > Pet exige cuidado > Reativo",
    history: [
      { at: "Hoje 09:42", event: "Envio lideranca", detail: "Checklist completo pela atendente." },
      { at: "Hoje 09:40", event: "Observacao", detail: "Tutor pediu orientacao antes de agendar." }
    ]
  },
  {
    id: "lead-bruna-lima",
    tutorName: "Bruna Lima",
    pets: ["Amora"],
    phone: "5511944440000",
    queue: "nutricao_campanha",
    status: "nutricao_campanha",
    nextActionLabel: "Campanha Arraia",
    nextActionBucket: "nutrition",
    responsible: "Marketing",
    origin: "Meta Ads",
    lastResult: "Nutricao",
    observation: "Sem resposta apos ciclo completo, manter em campanha.",
    primarySituation: { label: "Nutricao", tone: "muted" },
    tags: [
      { label: "Campanha", tone: "muted" },
      { label: "Tentativa 12/12", tone: "warning" },
      { label: "Reativacao", tone: "default" }
    ],
    semRespostaCount: 12,
    followUpCount: 16,
    history: [
      { at: "Ontem 18:00", event: "Decisao lideranca", detail: "Enviar para nutricao." },
      { at: "Ontem 17:40", event: "Ciclo completo", detail: "12 tentativas sem resposta." }
    ]
  }
];
