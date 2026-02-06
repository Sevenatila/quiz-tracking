# Checklist - Implementacao de Traqueamento Avancado

## Situacao Atual
- [x] Tracking interno customizado (useTracking + PostgreSQL)
- [x] UTMify pixel (com Facebook Pixel embutido)
- [x] Stripe webhooks para pagamentos
- [x] Dashboard admin com funil
- [x] Captura de UTMs (source, medium, campaign)

---

## Fase 1 - Pixel do Facebook (Client-Side)

### 1.1 Instalacao do Pixel Base
- [x] Adicionar `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` no `.env`
- [x] Criar utilitario `/lib/facebook-pixel.ts` com funcoes helper (pageview, track, etc.)
- [x] Inserir script base do pixel no `app/layout.tsx` (noscript + script)
- [x] Garantir que o pixel carrega em todas as paginas
- [ ] Testar com extensao Meta Pixel Helper no navegador

### 1.2 Eventos Padrao do Funil
- [x] `PageView` - disparo automatico em cada pagina
- [x] `ViewContent` - ao usuario iniciar o quiz (landing)
- [x] `Lead` - ao chegar na tela de resultados (results)
- [x] `InitiateCheckout` - ao clicar no botao da oferta
- [x] `Purchase` - via CAPI server-side no webhook da Vega (`/api/vega-webhook`)

### 1.3 Parametros dos Eventos
- [x] Enviar `value` e `currency` nos eventos de conversao (Lead, InitiateCheckout)
- [x] Enviar `content_name` (ex: "Quiz Landing", "Planilha Financeira")
- [x] Enviar `content_category` nos eventos relevantes
- [x] Gerar `event_id` para de-duplicacao futura com CAPI

### 1.4 Eventos Customizados
- [x] `QuizProgress` - cada pergunta respondida (q1 a q7, todas variantes)
- [x] `ViewOffer` - visualizacao da oferta (sem clique)
- [x] `ExitIntent` - disparo na pagina de back-redirect

---

## Fase 2 - Conversions API (Server-Side)

### 2.1 Configuracao
- [x] Gerar Access Token no Facebook Business Manager
- [x] Adicionar `FACEBOOK_CONVERSIONS_API_TOKEN` no `.env`
- [x] Adicionar `FACEBOOK_PIXEL_ID` no `.env` (server-side, sem NEXT_PUBLIC)
- [x] Criar utilitario `/lib/facebook-capi.ts` para envio de eventos server-side

### 2.2 De-duplicacao de Eventos
- [x] Gerar `event_id` unico no client-side para cada evento (ja implementado na Fase 1)
- [x] Enviar o mesmo `event_id` tanto no pixel (client) quanto na CAPI (server)
- [x] Facebook vai de-duplicar automaticamente com base no `event_id`

### 2.3 Dados do Usuario (User Data)
- [x] Capturar cookie `_fbp` (Facebook Browser ID) no client e enviar ao server
- [x] Capturar cookie `_fbc` (Facebook Click ID) no client e enviar ao server
- [x] Enviar `client_ip_address` (extrair do request no server)
- [x] Enviar `client_user_agent` (extrair do request no server)
- [x] Enviar `external_id` (hash SHA256 do session_id)
- [x] Enviar `fbc` a partir do parametro `fbclid` da URL quando disponivel

### 2.4 Eventos Server-Side
- [x] `ViewContent` - no endpoint `/api/tracking` quando step = landing (ViewContent para de-duplicacao com pixel client)
- [x] `Lead` - no endpoint `/api/tracking` quando step = results
- [x] `InitiateCheckout` - no endpoint `/api/tracking` quando clickedOffer = true
- [x] `Purchase` - via webhook da Vega (`/api/vega-webhook`) quando `payment_status === 'approved'`

### ~~2.5 Purchase via Stripe Webhook~~ (STANDBY - Stripe nao utilizado)
- ~~No evento `payment_intent.succeeded`, enviar Purchase para a CAPI~~
- ~~Incluir `value`, `currency`, `order_id` nos parametros~~
- ~~Recuperar `fbp` e `fbc` do banco~~

---

## Fase 3 - Advanced Matching

### 3.1 Dados para Matching
- [x] Se coletar email no fluxo: enviar hash SHA256 do email no pixel e CAPI (via Vega webhook no Purchase)
- [x] Se coletar telefone: enviar hash SHA256 do telefone (via Vega webhook no Purchase)
- [x] Enviar `external_id` (hash do session_id) em todos os eventos
- [ ] Configurar Advanced Matching automatico no Events Manager do Facebook

---

## Fase 4 - Persistencia de Dados de Tracking

### 4.1 Atualizar Schema do Banco
- [x] Adicionar campo `fbp` (Facebook Browser ID) na tabela `quizSession` (ja existia no schema)
- [x] Adicionar campo `fbc` (Facebook Click ID) na tabela `quizSession` (ja existia no schema)
- [x] Adicionar campo `fbclid` na tabela `quizSession` (ja existia no schema)
- [x] Rodar migration do Prisma (schema ja estava atualizado)

### 4.2 Atualizar Hook useTracking
- [x] Capturar `_fbp` e `_fbc` dos cookies do navegador
- [x] Capturar `fbclid` dos parametros da URL
- [x] Enviar esses dados junto com cada evento para `/api/tracking`
- [x] Salvar no banco para uso posterior (ex: Purchase via webhook Vega)

---

## Fase 5 - Compatibilidade com UTMify

### 5.1 Verificar Conflitos
- [ ] Testar se o pixel da UTMify e o pixel direto coexistem sem conflito
- [ ] Verificar se eventos nao estao sendo duplicados no Events Manager
- [ ] Se houver conflito, avaliar: usar apenas pixel direto + CAPI ou manter UTMify
- [ ] Garantir que o `fbclid` esta sendo passado corretamente pela UTMify

---

## Fase 6 - Verificacao e Testes

### 6.1 Ferramentas de Teste
- [ ] Instalar extensao Meta Pixel Helper no Chrome
- [ ] Verificar eventos no Events Manager > Test Events (codigo de teste)
- [ ] Verificar eventos da CAPI no Events Manager > Test Events
- [ ] Confirmar de-duplicacao (mesmo evento nao contado 2x)

### 6.2 Qualidade do Evento
- [ ] Verificar Event Match Quality no Events Manager (meta: acima de 6.0)
- [ ] Verificar se `fbp` e `fbc` estao sendo enviados corretamente
- [ ] Verificar se os parametros de valor estao corretos nos eventos de Purchase
- [ ] Testar fluxo completo: landing > quiz > resultado > oferta > checkout > pagamento

### 6.3 Multi-idioma
- [ ] Verificar tracking no fluxo PT (quiz-oferta)
- [ ] Verificar tracking no fluxo ES (es)
- [ ] Verificar tracking no fluxo EN (pagina principal)

---

## Ordem de Prioridade

1. **Fase 1** - Pixel client-side (impacto imediato)
2. **Fase 4** - Persistencia de dados (necessario para CAPI)
3. **Fase 2** - Conversions API (maior ganho de qualidade)
4. **Fase 5** - Compatibilidade UTMify
5. **Fase 3** - Advanced Matching
6. **Fase 6** - Verificacao e testes (fazer ao longo de todas as fases)
