# Roadmap

Roadmap tecnico por fases, alinhado com o estado atual do projeto.

## Fases concluidas

1. Fundacao tecnica local
- Monorepo, Docker, PostgreSQL, Redis, API e worker.

2. API operacional base
- Endpoints de CRM, API key interna, idempotencia de mensagens.

3. Integracao n8n local
- n8n no compose, workflow versionado, import/list via CLI.

4. Dashboard local/dev
- Dashboard React/Vite com resumo, worklist e operacao de leads.

5. Jornada manual de leads (fase de remediacao)
- Entrada manual, dry-run/import tooling e ajustes de backlog importado.

6. Estrategia de testes
- `verify:all` sequencial, verifies operacionais e validacao frontend.

## Proximas fases (ordem planejada)

1. Operacionalizacao do lead
- Registrar resultado de contato, padronizar estados e reduzir backlog manual.

2. Relatorio diario
- Consolidar resumo e fila em relatorio diario para acompanhamento da equipe.

3. Jornada e follow-up de clientes
- Evoluir do lead para cliente com regras de continuidade de atendimento.

4. WAHA real
- Habilitar captura real de eventos WhatsApp em ambiente controlado.

5. Sincronizacao Clube04 (somente leitura)
- Carga incremental com controle de estado e auditoria de origem.

6. Auth e auditoria
- Login de usuario, trilha de acesso, e controles para ambiente operacional.

## Riscos e cuidados

- Nao misturar feature com refatoracao ampla.
- Evitar execucao paralela de smoke/verify no mesmo banco local.
- Manter dados reais fora do repositorio.
- Preservar workflows n8n versionados com ID estavel.
- Manter integracoes externas sob rollout controlado.
