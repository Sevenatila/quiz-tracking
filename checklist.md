# Checklist - Tracking do Quiz

## Situacao Atual
- [x] Tracking interno customizado (useTracking + PostgreSQL)
- [x] UTMify pixel (tracking de UTMs e atribuicao de vendas)
- [x] Dashboard admin com funil
- [x] Captura de UTMs (source, medium, campaign)
- [x] Webhook Vega para pagamentos aprovados

---

## Tracking Interno (useTracking + /api/tracking)

### Dados Capturados por Sessao
- [x] Session ID (gerado no client, persistido no localStorage)
- [x] Step atual do quiz (landing, q1-q7, results, offer, backRedirect)
- [x] Faixa de renda (incomeRange)
- [x] Perda estimada (estimatedLoss)
- [x] Clique na oferta (clickedOffer + timestamp)
- [x] UTM params (source, medium, campaign)
- [x] User agent e referrer
- [x] Timestamps (criacao, ultima atividade, conclusao)

### Endpoints
- [x] `POST /api/tracking` - Upsert de sessao no banco
- [x] `POST /api/vega-webhook` - Webhook de pagamento da Vega

---

## UTMify

### Integracao
- [x] Pixel UTMify carregado no `app/layout.tsx` (global)
- [x] Script UTMify adicional nos offer-screens (utms/latest.js)
- [x] Preconnect para `tracking.utmify.com.br`

---

## Verificacao
- [ ] Testar fluxo completo: landing > quiz > resultado > oferta > checkout > pagamento
- [ ] Verificar se UTMify esta capturando UTMs corretamente no painel
- [ ] Verificar dados de sessao no admin dashboard
