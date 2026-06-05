export type CountByLabel = {
  label: string;
  count: number;
};

export type DateRange = {
  min: string | null;
  max: string | null;
};

export type Sample = {
  table: string;
  id: string;
  reason: string;
  source?: string | null;
  campaign?: string | null;
  status?: string | null;
  type?: string | null;
  outcome?: string | null;
  provider?: string | null;
  providerMessageId?: string | null;
};

export type TableCounts = {
  contacts: number;
  leads: number;
  actionItems: number;
  crmInteractions: number;
  conversations: number;
  messages: number;
};

export type ImportedLeadsDiagnostics = {
  diagnosedAt: string;
  safeCandidates: TableCounts;
  ambiguous: TableCounts;
  leadSourceGroups: CountByLabel[];
  leadCampaignGroups: CountByLabel[];
  leadStatusGroups: CountByLabel[];
  actionTypeGroups: CountByLabel[];
  actionStatusGroups: CountByLabel[];
  interactionTypeGroups: CountByLabel[];
  interactionResultGroups: CountByLabel[];
  leadCreatedAt: DateRange;
  actionItemCreatedAt: DateRange;
  samples: Sample[];
};

export type ImportedLeadsResetPlan = {
  diagnostics: ImportedLeadsDiagnostics;
  ids: {
    contacts: string[];
    leads: string[];
    actionItems: string[];
    crmInteractions: string[];
    conversations: string[];
    messages: string[];
  };
};

export const IMPORT_MARKER_PATTERNS = [
  "%spreadsheet_import%",
  "%importado da planilha%",
  "%planilha%",
  "%lead_import%",
  "%remediation%",
  "%remediacao%"
];

export const LEGACY_LABEL_PATTERNS = [
  "%convertido_cliente%",
  "%sem_retorno%",
  "%revisao_lideranca%",
  "%revisao_manual%",
  "%validar_conversao%"
];

export const NOISY_ACTION_TYPES = [
  "lead_sem_interacao",
  "follow_up_agendado",
  "follow_up_lead",
  "validar_conversao"
];
