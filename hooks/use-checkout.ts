'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface PaymentData {
  amount: number;
  description?: string;
  payer_email: string;
  payer_name?: string;
  external_reference?: string;
}

interface UseCheckoutReturn {
  loading: boolean;
  createPixPayment: (data: PaymentData) => Promise<any>;
  checkPaymentStatus: (paymentId: string) => Promise<any>;
  createCardPayment: (data: PaymentData & { card_data: any }) => Promise<any>;
}

export function useCheckout(): UseCheckoutReturn {
  const [loading, setLoading] = useState(false);

  const createPixPayment = useCallback(async (data: PaymentData) => {
    setLoading(true);

    try {
      const response = await fetch('/api/payments/mercadopago/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar pagamento PIX');
      }

      return result;

    } catch (error: any) {
      console.error('Erro ao criar pagamento PIX:', error);
      toast.error(error.message || 'Erro ao criar pagamento PIX');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPaymentStatus = useCallback(async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/mercadopago/status?payment_id=${paymentId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao verificar status do pagamento');
      }

      return result;

    } catch (error: any) {
      console.error('Erro ao verificar status:', error);
      throw error;
    }
  }, []);

  const createCardPayment = useCallback(async (data: PaymentData & { card_data: any }) => {
    setLoading(true);

    try {
      const response = await fetch('/api/payments/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar pagamento com cartão');
      }

      return result;

    } catch (error: any) {
      console.error('Erro ao criar pagamento com cartão:', error);
      toast.error(error.message || 'Erro ao criar pagamento com cartão');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createPixPayment,
    checkPaymentStatus,
    createCardPayment
  };
}