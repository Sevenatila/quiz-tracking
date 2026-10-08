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
import { CreditCard, Lock, CheckCircle, ArrowLeft, Check } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1e293b',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#64748b'
      }
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626'
    }
  }
};

interface CheckoutFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

function InlineCheckoutForm({ amount, onSuccess, onError, onBack }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [email, setEmail] = useState('');

  // Order bumps state
  const [orderBumps, setOrderBumps] = useState({
    supportPriority: false,
    bonusGuides: false,
    videoTutorial: false
  });

  // Order bumps config
  const orderBumpOptions = [
    {
      id: 'supportPriority',
      title: 'Soporte Prioritario (30 días)',
      description: 'Respuesta garantizada en 24h para todas tus dudas',
      price: 7.00,
      originalPrice: 15.00,
      priceId: 'price_1Sr6pjKCl7aD0UYpVg2MTbZH',
      productId: 'prod_TokKvdNoN10XaR'
    },
    {
      id: 'bonusGuides',
      title: 'Pack de Guías Bonus',
      description: '5 plantillas adicionales para inversiones y ahorros',
      price: 12.00,
      originalPrice: 25.00,
      priceId: 'price_1Sr6qXKCl7aD0UYpgI8C8SiL',
      productId: 'prod_TokLH8FuIqeWRm'
    },
    {
      id: 'videoTutorial',
      title: 'Video Tutorial Completo',
      description: 'Curso en video de 2h explicando paso a paso',
      price: 15.00,
      originalPrice: 30.00,
      priceId: 'price_1Sr6qsKCl7aD0UYpoUj1nj9i',
      productId: 'prod_TokLJ8CZFncoTC'
    }
  ];

  // Calculate total amount with order bumps
  const calculateTotal = () => {
    let total = amount;
    orderBumpOptions.forEach(option => {
      if (orderBumps[option.id as keyof typeof orderBumps]) {
        total += option.price;
      }
    });
    return total;
  };

  const handleOrderBumpChange = (bumpId: string) => {
    setOrderBumps(prev => ({
      ...prev,
      [bumpId]: !prev[bumpId as keyof typeof prev]
    }));
  };

  const createPaymentIntent = async () => {
    const totalAmount = calculateTotal();
    const selectedBumps = Object.entries(orderBumps)
      .filter(([_, selected]) => selected)
      .map(([bumpId]) => bumpId);

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'usd',
          metadata: {
            source: 'inline_checkout_es',
            customer_email: email || 'not_provided_yet',
            base_amount: amount,
            base_price_id: 'price_1Sq2SgKCl7aD0UYpHL816zsO',
            product_id: 'prod_TndkEofl99cDIY',
            order_bumps: selectedBumps.join(','),
            order_bump_prices: orderBumpOptions
              .filter(opt => selectedBumps.includes(opt.id))
              .map(opt => opt.priceId)
              .join(','),
            order_bump_products: orderBumpOptions
              .filter(opt => selectedBumps.includes(opt.id))
              .map(opt => opt.productId)
              .join(','),
            total_savings: orderBumpOptions
              .filter(opt => selectedBumps.includes(opt.id))
              .reduce((sum, opt) => sum + (opt.originalPrice - opt.price), 0)
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

  useEffect(() => {
    createPaymentIntent();
  }, [amount, onError, orderBumps]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    // Validar email
    if (!email || !email.includes('@')) {
      onError('Por favor, ingresa un email válido');
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
        billing_details: {
          email: email,
        },
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Header compacto */}
      <div className="text-center">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors text-sm mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la oferta
        </button>

        <div className="flex items-center justify-center gap-2 mb-3">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold text-slate-900">Finalizar compra - ${amount}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email (para recibir tu plantilla)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none transition-all bg-white text-slate-800"
          />
        </div>

        {/* Campo de tarjeta */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Información de la tarjeta
          </label>
          <div className="border-2 border-slate-200 rounded-xl p-3 focus-within:border-emerald-500 transition-all bg-white">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        {/* Order Bumps */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-700">🚀 Acelera tu éxito financiero:</h4>
          {orderBumpOptions.map((option) => (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02 }}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                orderBumps[option.id as keyof typeof orderBumps]
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              onClick={() => handleOrderBumpChange(option.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
                  orderBumps[option.id as keyof typeof orderBumps]
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-300'
                }`}>
                  {orderBumps[option.id as keyof typeof orderBumps] && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-slate-800 text-sm">{option.title}</h5>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 line-through">${option.originalPrice}</span>
                      <span className="font-bold text-emerald-600">${option.price}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{option.description}</p>
                  <div className="mt-1">
                    <span className="text-xs font-medium text-emerald-600">
                      Ahorras ${(option.originalPrice - option.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Plantilla base:</span>
              <span>${amount.toFixed(2)}</span>
            </div>
            {orderBumpOptions.map(option =>
              orderBumps[option.id as keyof typeof orderBumps] && (
                <div key={option.id} className="flex justify-between text-sm">
                  <span>{option.title}:</span>
                  <span>${option.price.toFixed(2)}</span>
                </div>
              )
            )}
            <div className="border-t border-slate-300 pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-emerald-600">${calculateTotal().toFixed(2)}</span>
              </div>
              {calculateTotal() > amount && (
                <p className="text-xs text-emerald-600 mt-1">
                  Ahorras ${orderBumpOptions
                    .filter(opt => orderBumps[opt.id as keyof typeof orderBumps])
                    .reduce((sum, opt) => sum + (opt.originalPrice - opt.price), 0)
                    .toFixed(2)} en total
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Badges de seguridad */}
        <div className="flex items-center justify-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Seguro</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Garantía 30 días</span>
          </div>
        </div>

        {/* Botón de pago */}
        <motion.button
          type="submit"
          disabled={!stripe || isLoading || !email || !email.includes('@')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold text-lg rounded-xl transition-colors shadow-lg shadow-emerald-500/30"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Procesando...
            </div>
          ) : (
            `Pagar $${calculateTotal().toFixed(2)} USD`
          )}
        </motion.button>

        <p className="text-xs text-slate-500 text-center">
          Pago seguro procesado por Stripe • Garantía de 30 días
        </p>
      </form>
    </motion.div>
  );
}

interface InlineCheckoutProps {
  amount: number;
  isVisible: boolean;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

export default function InlineCheckout({
  amount,
  isVisible,
  onSuccess,
  onError,
  onBack
}: InlineCheckoutProps) {
  if (!isVisible) return null;

  return (
    <div className="max-w-md mx-auto">
      <Elements stripe={stripePromise}>
        <InlineCheckoutForm
          amount={amount}
          onSuccess={onSuccess}
          onError={onError}
          onBack={onBack}
        />
      </Elements>
    </div>
  );
}

// Componente de sucesso inline
interface InlineSuccessProps {
  isVisible: boolean;
  onContinue: () => void;
}

export function InlineSuccess({ isVisible, onContinue }: InlineSuccessProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-emerald-600" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          ¡Pago exitoso! 🎉
        </h3>
        <p className="text-slate-600 text-sm">
          Tu plantilla está siendo enviada a tu email.
          <br />
          <strong>¡Revisa también tu carpeta de spam!</strong>
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
        <p className="text-emerald-800 font-medium text-sm mb-2">Próximos pasos:</p>
        <ul className="text-xs text-emerald-700 space-y-1">
          <li>✅ Recibirás un email con tu plantilla</li>
          <li>✅ Instrucciones de uso incluidas</li>
          <li>✅ Soporte técnico disponible</li>
        </ul>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
      >
        Perfecto
      </button>
    </motion.div>
  );
}