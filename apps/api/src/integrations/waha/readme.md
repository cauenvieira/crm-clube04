# Integracao WAHA

## Objetivo

Reservar o modulo de integracao direta com WAHA para fase futura de WhatsApp real.

## Status atual

- WAHA real direto esta fora do escopo atual.
- O fluxo de teste usa n8n como camada de normalizacao.
- A API CRM recebe payload normalizado em `POST /api/webhooks/whatsapp/inbound`.
- Nao ha envio outbound real.
- Nao ha bot automatico.

## Regra de arquitetura

WAHA deve entrar por adaptador, nao acoplado diretamente ao dominio de lead.

Camada esperada no futuro:

```text
WAHA -> adapter -> payload normalizado -> service CRM -> regras backend
```

A Jornada do Lead continua tendo regra operacional no backend, conforme:

- `docs/product/lead-operational-contract.md`
- `docs/qa/lead-business-rules-test-matrix.md`

## Proibido nesta fase

- Enviar mensagens reais sem aprovacao.
- Abrir sessao real de WhatsApp em codigo versionado.
- Versionar tokens, QR codes, cookies, prints ou payloads reais.
- Criar resposta automatica para cliente sem gate humano.
- Mudar status de lead diretamente pelo adapter.

## Futuro escopo possivel

- receber eventos inbound reais;
- normalizar payloads WAHA;
- tratar idempotencia de mensagem;
- mapear erros/retries;
- expor diagnosticos tecnicos;
- depois, avaliar outbound controlado com templates e aprovacao humana.

## Validacao futura

- testes com fixtures anonimizadas;
- `npm run build`;
- `npm run lint`;
- smoke especifico do webhook;
- `npm run verify:data-cleanliness`.
