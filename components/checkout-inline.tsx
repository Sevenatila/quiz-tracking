'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Loader2, QrCode, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckoutInlineProps {
  amount: number;
  description?: string;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
}

interface PixPaymentData {
  id: string;
  qr_code: string;
  qr_code_base64: string;
  status: string;
  external_reference: string;
}

export default function CheckoutInline({
  amount,
  description = 'Pagamento',
  onSuccess,
  onError
}: CheckoutInlineProps) {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [payerEmail, setPayerEmail] = useState('');
  const [payerName, setPayerName] = useState('');
  const [paymentPolling, setPaymentPolling] = useState<NodeJS.Timeout | null>(null);

  // Limpar polling ao desmontar componente
  useEffect(() => {
    return () => {
      if (paymentPolling) {
        clearInterval(paymentPolling);
      }
    };
  }, [paymentPolling]);

  const handlePixPayment = async () => {
    if (!payerEmail) {
      toast.error('Email é obrigatório para pagamento PIX');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payments/mercadopago/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description,
          payer_email: payerEmail,
          payer_name: payerName,
          external_reference: `checkout_${Date.now()}`
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar pagamento PIX');
      }

      setPixData(result);
      toast.success('QR Code PIX gerado! Aguardando pagamento...');

      // Iniciar polling para verificar status do pagamento
      startPaymentPolling(result.id);

    } catch (error: any) {
      console.error('Erro PIX:', error);
      toast.error(error.message || 'Erro ao processar pagamento PIX');
      onError?.(error.message || 'Erro ao processar pagamento PIX');
    } finally {
      setLoading(false);
    }
  };

  const startPaymentPolling = (paymentId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/mercadopago/status?payment_id=${paymentId}`);
        const result = await response.json();

        if (result.status === 'approved') {
          clearInterval(interval);
          setPaymentPolling(null);
          toast.success('Pagamento aprovado!');
          onSuccess?.(result);
        } else if (result.status === 'rejected' || result.status === 'cancelled') {
          clearInterval(interval);
          setPaymentPolling(null);
          toast.error('Pagamento rejeitado ou cancelado');
          onError?.('Pagamento rejeitado ou cancelado');
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 3000); // Verificar a cada 3 segundos

    setPaymentPolling(interval);
  };

  const handleCardPayment = () => {
    toast.error('Gateway de cartão ainda não configurado');
    onError?.('Gateway de cartão ainda não configurado');
  };

  const copyPixCode = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      toast.success('Código PIX copiado!');
    }
  };

  const simulateApproval = async () => {
    if (!pixData?.id) return;

    try {
      const response = await fetch('/api/payments/mercadopago/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: pixData.id,
          action: 'approve'
        })
      });

      const result = await response.json();

      if (response.ok) {
        if (paymentPolling) {
          clearInterval(paymentPolling);
          setPaymentPolling(null);
        }
        toast.success('Pagamento simulado como aprovado!');
        onSuccess?.(result);
      }
    } catch (error) {
      console.error('Erro na simulação:', error);
      toast.error('Erro ao simular aprovação');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Finalizar Pagamento</CardTitle>
        <CardDescription>
          Total: R$ {amount.toFixed(2).replace('.', ',')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Seleção do método de pagamento */}
        <div>
          <Label className="text-base font-medium">Método de Pagamento</Label>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as 'pix' | 'card')}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pix" id="pix" />
              <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer">
                <QrCode className="w-4 h-4" />
                PIX (Aprovação Instantânea)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                <CreditCard className="w-4 h-4" />
                Cartão de Crédito (Em breve)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Formulário PIX */}
        {paymentMethod === 'pix' && !pixData && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Nome (Opcional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
              />
            </div>
            <Button
              onClick={handlePixPayment}
              disabled={loading || !payerEmail}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando PIX...
                </>
              ) : (
                'Pagar com PIX'
              )}
            </Button>
          </div>
        )}

        {/* QR Code PIX */}
        {paymentMethod === 'pix' && pixData && (
          <div className="text-center space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <img
                src={`data:image/png;base64,${pixData.qr_code_base64}`}
                alt="QR Code PIX"
                className="mx-auto"
                style={{ maxWidth: '200px' }}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Escaneie o QR Code ou copie o código PIX
              </p>
              <Button
                onClick={copyPixCode}
                variant="outline"
                className="w-full"
              >
                Copiar Código PIX
              </Button>

              {/* Botão de simulação apenas para ambiente de teste */}
              {process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.includes('TEST') && (
                <div className="border-t pt-3">
                  <p className="text-xs text-orange-600 mb-2">
                    🧪 Ambiente de Teste - Simular Pagamento
                  </p>
                  <Button
                    onClick={simulateApproval}
                    variant="default"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    ✅ Simular Aprovação
                  </Button>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500">
              Aguardando confirmação do pagamento...
            </div>
          </div>
        )}

        {/* Formulário Cartão (placeholder) */}
        {paymentMethod === 'card' && (
          <div className="space-y-3">
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-2" />
              <p>Gateway de cartão será configurado em breve</p>
            </div>
            <Button
              onClick={handleCardPayment}
              disabled
              className="w-full"
            >
              Indisponível
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}