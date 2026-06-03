type RecommendationInput = {
  status: string;
  attemptsCount: number;
  hasOpenReview: boolean;
  hasOpenFollowUp: boolean;
};

type TemplateRecommendationInput = {
  leadStatus: string;
  lastOutcome: string | null;
  nextRecommendedAction: string;
};

type MessageVariablesInput = {
  tutorName: string | null;
  petName: string | null;
  source: string | null;
  attendant: string | null;
  nextActionAtIso: Date | string | null;
};

export function recommendActionFromLeadState(input: RecommendationInput) {
  if (input.hasOpenReview) return "revisar_lideranca";
  if (["perdido", "desqualificado", "compareceu"].includes(input.status)) return "encerrado";
  if (input.status === "reativar_depois") return "nutricao_campanha";
  if (input.status === "agendado") return "aguardar_agendamento";
  if (input.attemptsCount >= 12) return "revisar_lideranca";
  if (input.hasOpenFollowUp) return "fazer_follow_up";
  return "primeiro_contato";
}

export function recommendTemplateIds(input: TemplateRecommendationInput) {
  if (input.nextRecommendedAction === "revisar_lideranca") {
    return ["retomada_atendimento", "follow_up"];
  }
  if (input.leadStatus === "agendado") {
    return ["pos_agendamento_simples", "retorno_combinado"];
  }
  if (input.lastOutcome === "sem_resposta") {
    return ["retomada_atendimento", "follow_up"];
  }
  if (input.leadStatus === "novo_lead") {
    return ["primeiro_contato", "convite_agendamento"];
  }
  return ["follow_up", "convite_agendamento", "prova_social_espaco"];
}

export function recommendMediaIds(templateIds: string[]) {
  const map: Record<string, string[]> = {
    primeiro_contato: ["tour_espaco_primeiro_contato", "banho_bem_estar"],
    retomada_atendimento: ["prova_social", "secagem_acolhedora"],
    follow_up: ["prova_social"],
    retorno_combinado: ["prova_social"],
    convite_agendamento: ["tour_espaco_primeiro_contato"],
    prova_social_espaco: ["prova_social"],
    reforco_bem_estar: ["cromoterapia"],
    pos_agendamento_simples: ["secagem_acolhedora"]
  };

  const set = new Set<string>();
  for (const templateId of templateIds) {
    for (const mediaId of map[templateId] ?? []) set.add(mediaId);
  }
  return [...set];
}

export function buildMessageVariables(input: MessageVariablesInput) {
  const tutorName = input.tutorName?.trim() || "Tutor";
  const firstName = tutorName.split(" ").filter(Boolean)[0] ?? "Tutor";
  return {
    primeiro_nome_tutor: firstName,
    nome_tutor: tutorName,
    nome_pet: input.petName?.trim() || "seu pet",
    nome_unidade: "Clube04 Mogi",
    atendente: input.attendant?.trim() || "time Clube04 Mogi",
    origem_lead: input.source?.trim() || "canal direto",
    proxima_data: input.nextActionAtIso ? formatIsoToYmd(input.nextActionAtIso) : "",
    beneficio_principal: "banho com foco em bem-estar"
  };
}

function formatIsoToYmd(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
