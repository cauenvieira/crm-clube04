export type QueueKey = "fazer_follow_up" | "validar_agendamento" | "revisar_lideranca" | "nutricao_campanha";

export type PrimarySituationTone = "danger" | "warning" | "info" | "success" | "muted";

export type TagTone = "default" | "success" | "warning" | "danger" | "muted";

export type LeadTag = {
  label: string;
  tone: TagTone;
};

export type LeadHistoryItem = {
  at: string;
  event: string;
  detail: string;
};

export type OperationalLead = {
  id: string;
  tutorName: string;
  pets: string[];
  phone: string;
  queue: QueueKey;
  status: string;
  nextActionLabel: string;
  nextActionBucket: "today" | "overdue" | "backlog" | "next7" | "future" | "nutrition";
  responsible: string;
  origin: string;
  lastResult: string;
  observation: string;
  primarySituation: {
    label: string;
    tone: PrimarySituationTone;
  };
  tags: LeadTag[];
  semRespostaCount: number;
  followUpCount: number;
  longFollowUpReason?: string;
  appointment?: string;
  leadershipReason?: string;
  history: LeadHistoryItem[];
};

export type FilterKey =
  | "todos"
  | "hoje"
  | "atrasados"
  | "backlog"
  | "proximos_7"
  | "validar"
  | "lideranca"
  | "nutricao"
  | "tentativa_alta";

export type ViewerRole = "atendente" | "lider" | "admin";
