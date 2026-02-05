# Checkout Inline - Mercado Pago PIX + Gateway de Cartão

Implementação de checkout inline com integração híbrida:
- **Mercado Pago** para PIX (implementado)
- **Gateway de cartão** (estrutura preparada para futuro)

## 🚀 Configuração

### 1. Variáveis de Ambiente

Adicione no arquivo `.env`:

```env
# Mercado Pago Configuration
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=sua_public_key_aqui
```

### 2. Obter Credenciais Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers
2. Crie uma aplicação
3. Copie o Access Token e Public Key
4. Para produção, use as credenciais de produção

## 📋 Estrutura de Arquivos

```
app/
├── api/payments/
│   ├── mercadopago/
│   │   ├── pix/route.ts          # Criar pagamento PIX
│   │   └── status/route.ts       # Verificar status
│   └── card/route.ts             # Gateway cartão (preparado)
│
components/
└── checkout-inline.tsx           # Componente principal
│
hooks/
└── use-checkout.ts              # Hook para pagamentos
```

## 🔧 Como Usar

### Componente Básico

```tsx
import CheckoutInline from '@/components/checkout-inline';

function MinhaPage() {
  const handleSuccess = (paymentData) => {
    console.log('Pagamento aprovado:', paymentData);
  };

  const handleError = (error) => {
    console.error('Erro:', error);
  };

  return (
    <CheckoutInline
      amount={29.90}
      description="Meu Produto"
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
```

### Hook de Pagamentos

```tsx
import { useCheckout } from '@/hooks/use-checkout';

function MeuComponente() {
  const { loading, createPixPayment, checkPaymentStatus } = useCheckout();

  const handlePix = async () => {
    try {
      const result = await createPixPayment({
        amount: 29.90,
        payer_email: 'cliente@email.com',
        description: 'Meu produto'
      });

      console.log('QR Code:', result.qr_code_base64);
    } catch (error) {
      console.error(error);
    }
  };
}
```

## 🏗️ API Endpoints

### POST `/api/payments/mercadopago/pix`

Cria um pagamento PIX:

```json
{
  "amount": 29.90,
  "description": "Produto Digital",
  "payer_email": "cliente@email.com",
  "payer_name": "Nome Cliente",
  "external_reference": "pedido_123"
}
```

**Resposta:**
```json
{
  "id": "payment_id",
  "status": "pending",
  "qr_code": "string_do_pix",
  "qr_code_base64": "base64_image",
  "external_reference": "pedido_123"
}
```

### GET `/api/payments/mercadopago/status?payment_id=ID`

Verifica status do pagamento:

```json
{
  "id": "payment_id",
  "status": "approved",
  "transaction_amount": 29.90,
  "date_approved": "2024-01-01T10:00:00Z"
}
```

## 🎯 Status de Pagamento

- `pending` - Aguardando pagamento
- `approved` - Aprovado
- `rejected` - Rejeitado
- `cancelled` - Cancelado

## 💳 Integrando Gateway de Cartão

Para adicionar um gateway de cartão, edite `/api/payments/card/route.ts`:

### Exemplo Stripe:
```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ... implementação
```

### Exemplo PagSeguro:
```typescript
import PagSeguro from 'pagseguro-sdk';
const pagSeguro = new PagSeguro(process.env.PAGSEGURO_TOKEN);

// ... implementação
```

## 🧪 Teste Local

1. Acesse: `http://localhost:3000/checkout-example`
2. Configure credenciais de teste do Mercado Pago
3. Teste o fluxo PIX

## 📱 Funcionalidades

- ✅ **PIX Instantâneo** - QR Code gerado na hora
- ✅ **Polling Automático** - Verifica aprovação automaticamente
- ✅ **UI Responsiva** - Funciona em mobile/desktop
- ✅ **Validação** - Campos obrigatórios validados
- ✅ **Loading States** - Feedback visual para usuário
- ✅ **Toast Notifications** - Mensagens de sucesso/erro
- ✅ **Copy PIX Code** - Copiar código PIX para clipboard
- 🔄 **Gateway Cartão** - Estrutura preparada para integração

## 🔒 Segurança

- Tokens do Mercado Pago ficam no servidor (variáveis de ambiente)
- Validação de campos obrigatórios
- Tratamento de erros adequado
- Não exposição de dados sensíveis no frontend

## 📞 Suporte

Para dúvidas sobre:
- **Mercado Pago**: https://www.mercadopago.com.br/developers/pt/support
- **Implementação**: Consulte a documentação do gateway escolhido para cartão