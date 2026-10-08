'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, FileText, Mail, Clock } from 'lucide-react';

interface Order {
  id: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  productDelivered: boolean;
  paidAt: string | null;
  deliveredAt: string | null;
  source: string | null;
  orderBumps: string[];
}

interface DownloadPageProps {
  params: {
    orderId: string;
  };
}

function getBumpInfo(bumpId: string, isSpanish: boolean) {
  const bumps = {
    supportPriority: {
      filename: 'soporte-premium.pdf',
      title: isSpanish ? 'Soporte Prioritario (30 días)' : 'Suporte Premium (30 dias)',
      description: isSpanish ? 'Respuesta garantizada en 24h' : 'Resposta garantida em 24h'
    },
    bonusGuides: {
      filename: 'bonus-guias.zip',
      title: isSpanish ? 'Pack de Guías Bonus' : 'Pack de Guias Bônus',
      description: isSpanish ? '5 plantillas adicionales' : '5 planilhas adicionais'
    },
    videoTutorial: {
      filename: 'video-tutorial.zip',
      title: isSpanish ? 'Video Tutorial Completo' : 'Vídeo Tutorial Completo',
      description: isSpanish ? 'Curso en video de 2h' : 'Curso em vídeo de 2h'
    }
  };

  return bumps[bumpId as keyof typeof bumps] || {
    filename: null,
    title: bumpId,
    description: isSpanish ? 'Contenido adicional' : 'Conteúdo adicional'
  };
}

export default function DownloadPage({ params }: DownloadPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        // Buscar pedido no banco de dados
        const response = await fetch(`/api/orders/${params.orderId}`);

        if (!response.ok) {
          throw new Error('Pedido não encontrado');
        }

        const orderData = await response.json();
        setOrder(orderData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar pedido');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [params.orderId]);

  const isSpanish = order?.source?.includes('_es') || order?.source?.includes('es_') || false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">
            {isSpanish ? 'Cargando tu pedido...' : 'Carregando seu pedido...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-2">
            {isSpanish ? 'Pedido no encontrado' : 'Pedido não encontrado'}
          </h1>

          <p className="text-slate-600 mb-6">
            {isSpanish
              ? 'No pudimos encontrar tu pedido. Verifica el enlace o contacta soporte.'
              : 'Não conseguimos encontrar seu pedido. Verifique o link ou entre em contato.'
            }
          </p>

          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors"
          >
            {isSpanish ? 'Volver al inicio' : 'Voltar ao início'}
          </button>
        </div>
      </div>
    );
  }

  if (order.status !== 'paid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-2">
            {isSpanish ? 'Pago pendiente' : 'Pagamento pendente'}
          </h1>

          <p className="text-slate-600 mb-6">
            {isSpanish
              ? 'Tu pago aún está siendo procesado. Te notificaremos cuando esté listo.'
              : 'Seu pagamento ainda está sendo processado. Te avisaremos quando estiver pronto.'
            }
          </p>

          <p className="text-sm text-slate-500">
            {isSpanish ? 'ID del pedido:' : 'ID do pedido:'} {order.id}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header de sucesso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {isSpanish ? '¡Pago exitoso!' : 'Pagamento confirmado!'}
          </h1>

          <p className="text-slate-600 mb-4">
            {isSpanish
              ? 'Tu Plantilla de Finanzas Personales está lista para descargar'
              : 'Sua Planilha de Finanças Pessoais está pronta para download'
            }
          </p>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-emerald-800 font-medium">
                {isSpanish ? 'Plantilla de Finanzas' : 'Planilha de Finanças'}
              </span>
              <span className="text-emerald-900 font-bold">
                {order.currency.toUpperCase()} {order.amount}
              </span>
            </div>

            {order.orderBumps.length > 0 && (
              <div className="mt-2 pt-2 border-t border-emerald-200">
                <p className="text-sm text-emerald-700">
                  {isSpanish ? 'Incluye bonos:' : 'Inclui bônus:'} {order.orderBumps.join(', ')}
                </p>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-500">
            {isSpanish ? 'Enviado a:' : 'Enviado para:'} {order.customerEmail}
          </p>
        </motion.div>

        {/* Seção de downloads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Download className="w-6 h-6 text-emerald-600" />
            {isSpanish ? 'Tus descargas' : 'Seus downloads'}
          </h2>

          <div className="space-y-4">
            {/* Download principal */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors cursor-pointer"
              onClick={() => {
                const filename = isSpanish ? 'plantilla-finanzas-es.xlsx' : 'plantilla-finanzas-pt.xlsx';
                window.open(`/api/download/${order.id}/${filename}`, '_blank');
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">
                      {isSpanish
                        ? 'Plantilla de Finanzas Personales.xlsx'
                        : 'Planilha de Finanças Pessoais.xlsx'
                      }
                    </h3>
                    <p className="text-sm text-slate-500">
                      {isSpanish ? 'Archivo principal' : 'Arquivo principal'}
                    </p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-emerald-600" />
              </div>
            </motion.div>

            {/* Downloads dos order bumps */}
            {order.orderBumps.map((bump, index) => {
              const bumpInfo = getBumpInfo(bump, isSpanish);
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors cursor-pointer"
                  onClick={() => {
                    if (bumpInfo.filename) {
                      window.open(`/api/download/${order.id}/${bumpInfo.filename}`, '_blank');
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">
                          {bumpInfo.title}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {bumpInfo.description}
                        </p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-blue-600" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Instruções */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              {isSpanish ? '📝 Instrucciones:' : '📝 Instruções:'}
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                {isSpanish
                  ? '• Guarda este enlace para futuras descargas'
                  : '• Salve este link para downloads futuros'
                }
              </li>
              <li>
                {isSpanish
                  ? '• Los archivos están en formato Excel (.xlsx)'
                  : '• Os arquivos estão em formato Excel (.xlsx)'
                }
              </li>
              <li>
                {isSpanish
                  ? '• Si tienes problemas, contacta nuestro soporte'
                  : '• Se tiver problemas, entre em contato com nosso suporte'
                }
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Informações do pedido */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-sm text-slate-500"
        >
          <p>
            {isSpanish ? 'ID del pedido:' : 'ID do pedido:'} {order.id}
          </p>
          {order.paidAt && (
            <p>
              {isSpanish ? 'Pagado el:' : 'Pago em:'}{' '}
              {new Date(order.paidAt).toLocaleDateString()}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}