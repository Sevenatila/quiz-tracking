'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CreditCard, Lock, CheckCircle, X } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#424770',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#9e2146'
    }
  }
};

interface CheckoutFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

function CheckoutForm({ amount, onSuccess, onError, onClose }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Criar payment intent quando o componente monta
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            currency: 'usd',
            metadata: {
              source: 'embedded_checkout_es'
            }
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        onError('Error al preparar el pago');
      }
    };

    createPaymentIntent();
  }, [amount, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      }
    });

    if (error) {
      console.error('Payment failed:', error);
      onError(error.message || 'Error en el pago');
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Pago Seguro</h3>
            <p className="text-sm text-slate-500">Procesado por Stripe</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Resumen del pedido */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-slate-700">Plantilla de Finanzas Personales</span>
          <span className="text-xl font-bold text-emerald-700">${amount}</span>
        </div>
        <p className="text-sm text-emerald-600 mt-1">Acceso instantáneo</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Información de la tarjeta
          </label>
          <div className="border border-slate-300 rounded-lg p-4 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        {/* Badges de seguridad */}
        <div className="flex items-center gap-2 mb-6 text-sm text-slate-600">
          <Lock className="w-4 h-4" />
          <span>Pago 100% seguro y encriptado</span>
        </div>

        <motion.button
          type="submit"
          disabled={!stripe || isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold rounded-lg transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Procesando...
            </div>
          ) : (
            `Pagar $${amount}`
          )}
        </motion.button>
      </form>

      <p className="text-xs text-slate-500 text-center mt-4">
        Al completar tu compra, aceptas nuestros términos de servicio
      </p>
    </div>
  );
}

interface StripeCheckoutProps {
  amount: number;
  isOpen: boolean;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export default function StripeCheckout({
  amount,
  isOpen,
  onSuccess,
  onError,
  onClose
}: StripeCheckoutProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Elements stripe={stripePromise}>
          <CheckoutForm
            amount={amount}
            onSuccess={onSuccess}
            onError={onError}
            onClose={onClose}
          />
        </Elements>
      </motion.div>
    </div>
  );
}

// Componente de sucesso com redirecionamento
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentIntentId?: string;
}

export function SuccessModal({ isOpen, onClose, paymentIntentId }: SuccessModalProps) {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && paymentIntentId) {
      // Buscar order ID baseado no payment intent
      fetch(`/api/orders/by-payment-intent/${paymentIntentId}`)
        .then(res => res.json())
        .then(data => {
          if (data.orderId) {
            setOrderId(data.orderId);
          }
        })
        .catch(err => console.error('Error fetching order:', err));
    }
  }, [isOpen, paymentIntentId]);

  const handleGoToDownload = () => {
    if (orderId) {
      window.location.href = `/download/${orderId}`;
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-8 max-w-md mx-auto text-center"
      >
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          ¡Pago exitoso!
        </h3>

        <p className="text-slate-600 mb-6">
          Tu plantilla está lista para descargar.
          <br />También recibirás un email con los enlaces.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleGoToDownload}
            disabled={!orderId}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold rounded-lg transition-colors"
          >
            {orderId ? 'Ir a descargas' : 'Preparando...'}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}