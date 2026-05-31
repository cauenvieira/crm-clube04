export function pushSample(list: string[], sample: string) {
  if (list.length < 20) list.push(sample);
}

export function printCrosscheckSummary(input: {
  leadsSheetPath: string;
  pessoaCsvPath: string;
  referenceTimezone: string;
  referenceBusinessDate: string;
  totalLeadRows: number;
  leadUniquePhones: number;
  rejectedNoPhone: number;
  pessoaTotalLines: number;
  pessoaUniquePhones: number;
  pessoaLinesWithoutPhone: number;
  pessoaPhonesWithMultiplePets: number;
  pessoaPhonesWithConflictingNames: number;
  leadsFoundInPessoa: number;
  jornadaConcluidaAndFound: number;
  jornadaConcluidaWithoutPessoa: number;
  pagamentoSemPessoa: number;
  leadsValidarConversao: number;
  leadsRetomarAtendimento: number;
  leadsRevisarLideranca: number;
  leadsRevisaoManual: number;
  legacyAttemptCountFilled: number;
  retomarAtendimentoTotal: number;
  retomarByStatus: Map<string, number>;
  retomarByAtendente: Map<string, number>;
  revisarLiderancaBreakdown: Record<
    "total" | "vencida" | "sem_data" | "futura" | "com_cliente_encontrado" | "sem_cliente_encontrado",
    number
  >;
  actionItemCounts: Map<string, number>;
  samplesJornadaSemCliente: string[];
  samplesPagamentoSemCliente: string[];
  samplesVencidosSemConversao: string[];
  samplesRetomarAtendimento: string[];
  samplesAnaliseLideranca: string[];
  samplesTelefoneConflito: string[];
  samplesNomeConflitoLeadVsPessoa: string[];
  pessoaConflictingPhones: string[];
}) {
  console.log("Lead spreadsheet crosscheck dry-run v1");
  console.log(`Leads file: ${input.leadsSheetPath}`);
  console.log(`Pessoa file: ${input.pessoaCsvPath}`);
  console.log(`Timezone operacional: ${input.referenceTimezone}`);
  console.log(`Data de referencia (operacional): ${input.referenceBusinessDate}`);
  console.log(`Total de leads da planilha: ${input.totalLeadRows}`);
  console.log(`Telefones unicos da planilha: ${input.leadUniquePhones}`);
  console.log(`Linhas sem telefone valido na planilha: ${input.rejectedNoPhone}`);
  console.log(`Total de linhas cliente/pet no Pessoa.csv: ${input.pessoaTotalLines}`);
  console.log(`Telefones unicos no Pessoa.csv: ${input.pessoaUniquePhones}`);
  console.log(`Linhas sem telefone no Pessoa.csv: ${input.pessoaLinesWithoutPhone}`);
  console.log(`Telefones com multiplos pets no Pessoa.csv: ${input.pessoaPhonesWithMultiplePets}`);
  console.log(`Telefones com nomes conflitantes no Pessoa.csv: ${input.pessoaPhonesWithConflictingNames}`);
  console.log(`Leads com telefone encontrado na base de clientes: ${input.leadsFoundInPessoa}`);
  console.log(`Leads Jornada Concluida com telefone encontrado: ${input.jornadaConcluidaAndFound}`);
  console.log(`Leads Jornada Concluida sem telefone no Pessoa.csv: ${input.jornadaConcluidaWithoutPessoa}`);
  console.log(`Leads Pagamento realizado sem telefone no Pessoa.csv: ${input.pagamentoSemPessoa}`);
  console.log(`Leads para validar conversao: ${input.leadsValidarConversao}`);
  console.log(`Leads para retomar atendimento: ${input.leadsRetomarAtendimento}`);
  console.log(`Leads para revisar lideranca: ${input.leadsRevisarLideranca}`);
  console.log(`Leads para revisao manual: ${input.leadsRevisaoManual}`);
  console.log(`legacy_attempt_count preenchido: ${input.legacyAttemptCountFilled}`);
  console.log(`retomar_atendimento_total: ${input.retomarAtendimentoTotal}`);

  console.log("Action items simulados por tipo:");
  console.log(`- fazer_follow_up: ${input.actionItemCounts.get("fazer_follow_up") ?? 0}`);
  console.log(`- revisar_lideranca: ${input.actionItemCounts.get("revisar_lideranca") ?? 0}`);
  console.log(`- validar_conversao: ${input.actionItemCounts.get("validar_conversao") ?? 0}`);
  console.log(`- retomar_atendimento: ${input.actionItemCounts.get("retomar_atendimento") ?? 0}`);

  console.log("Breakdown revisar_lideranca:");
  console.log(`- revisar_lideranca_total: ${input.revisarLiderancaBreakdown.total}`);
  console.log(`- revisar_lideranca_vencida: ${input.revisarLiderancaBreakdown.vencida}`);
  console.log(`- revisar_lideranca_sem_data: ${input.revisarLiderancaBreakdown.sem_data}`);
  console.log(`- revisar_lideranca_futura: ${input.revisarLiderancaBreakdown.futura}`);
  console.log(
    `- revisar_lideranca_com_cliente_encontrado: ${input.revisarLiderancaBreakdown.com_cliente_encontrado}`
  );
  console.log(
    `- revisar_lideranca_sem_cliente_encontrado: ${input.revisarLiderancaBreakdown.sem_cliente_encontrado}`
  );

  printTopMap("retomar_atendimento_por_status", input.retomarByStatus, 20);
  printTopMap("retomar_atendimento_por_atendente", input.retomarByAtendente, 20);

  printSamples("Amostras Jornada Concluida sem cliente encontrado", input.samplesJornadaSemCliente);
  printSamples("Amostras Pagamento realizado sem cliente encontrado", input.samplesPagamentoSemCliente);
  printSamples("Amostras Data Prox Acao vencida sem conversao", input.samplesVencidosSemConversao);
  printSamples("Amostras retomar_atendimento", input.samplesRetomarAtendimento);
  printSamples("Amostras Analise Lideranca pendente", input.samplesAnaliseLideranca);
  printSamples("Amostras telefones conflitantes na planilha", input.samplesTelefoneConflito);
  printSamples("Amostras nomes conflitantes planilha x Pessoa.csv", input.samplesNomeConflitoLeadVsPessoa);
  printSamples("Amostras telefones com nomes conflitantes no Pessoa.csv", input.pessoaConflictingPhones);
}

function printSamples(label: string, samples: string[]) {
  console.log(`${label} (max 20):`);
  if (samples.length === 0) {
    console.log("- none");
    return;
  }
  for (const sample of samples.slice(0, 20)) console.log(`- ${sample}`);
}

function printTopMap(label: string, map: Map<string, number>, limit: number) {
  console.log(`${label}:`);
  const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
  if (entries.length === 0) {
    console.log("- none");
    return;
  }
  for (const [key, count] of entries) console.log(`- ${key}: ${count}`);
}
