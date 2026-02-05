'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Target, 
  DollarSign, 
  RefreshCw,
  Lock,
  BarChart3,
  ArrowRight
} from 'lucide-react';

interface Stats {
  period: { days: number; startDate: string };
  overview: {
    totalSessions: number;
    offerClicks: number;
    conversionRate: string;
    completionRate: string;
    avgEstimatedLoss: number;
  };
  funnel: Record<string, number>;
  incomeDistribution: { range: string; count: number }[];
  dailyStats: { date: string; count: number }[];
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  const fetchStats = useCallback(async () => {
    if (!password) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/admin/stats?key=${encodeURIComponent(password)}&days=${days}`);
      
      if (res.status === 401) {
        setError('Senha incorreta');
        setIsAuthenticated(false);
        return;
      }
      
      if (!res.ok) throw new Error('Erro ao carregar dados');
      
      const data = await res.json();
      setStats(data);
      setIsAuthenticated(true);
    } catch (err) {
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  }, [password, days]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats();
  };

  // Atualizar quando mudar o período
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [days, isAuthenticated, fetchStats]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const funnelSteps = [
    { key: 'landing', label: 'Landing' },
    { key: 'q1', label: 'Pergunta 1' },
    { key: 'q2', label: 'Pergunta 2' },
    { key: 'q3', label: 'Pergunta 3' },
    { key: 'q4', label: 'Pergunta 4' },
    { key: 'q5', label: 'Pergunta 5' },
    { key: 'q6', label: 'Pergunta 6' },
    { key: 'q7', label: 'Pergunta 7' },
    { key: 'results', label: 'Resultados' },
    { key: 'offer', label: 'Oferta' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Painel Admin</h1>
              <p className="text-slate-400 text-sm">Área restrita</p>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Senha de acesso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Digite a senha"
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Painel de Acompanhamento</h1>
            <p className="text-slate-400">Visão geral do funil de conversão</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={90}>Últimos 90 dias</option>
            </select>
            
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.overview.totalSessions}</p>
              <p className="text-slate-400 text-sm">Visitantes</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.overview.completionRate}</p>
              <p className="text-slate-400 text-sm">Completaram quiz</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.overview.offerClicks}</p>
              <p className="text-slate-400 text-sm">Cliques na oferta</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(stats.overview.avgEstimatedLoss)}</p>
              <p className="text-slate-400 text-sm">Perda média estimada</p>
            </motion.div>
          </div>
        )}

        {/* Funnel Visualization */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold">Funil de Conversão</h2>
            </div>
            
            <div className="space-y-3">
              {funnelSteps.map((step, index) => {
                const count = stats.funnel[step.key] || 0;
                const maxCount = stats.funnel['landing'] || 1;
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const dropoff = index > 0 
                  ? (((stats.funnel[funnelSteps[index - 1].key] || 0) - count) / (stats.funnel[funnelSteps[index - 1].key] || 1) * 100).toFixed(1)
                  : null;
                
                return (
                  <div key={step.key} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">{step.label}</span>
                        {dropoff && parseFloat(dropoff) > 0 && (
                          <span className="text-xs text-red-400">-{dropoff}%</span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-8 bg-slate-800 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className={`h-full rounded-lg ${
                          step.key === 'offer' ? 'bg-emerald-500' :
                          step.key === 'results' ? 'bg-purple-500' :
                          'bg-indigo-500'
                        }`}
                      />
                    </div>
                    {index < funnelSteps.length - 1 && (
                      <div className="flex justify-center my-1">
                        <ArrowRight className="w-4 h-4 text-slate-600 rotate-90" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Bottom Grid */}
        {stats && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Income Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Distribuição de Renda</h2>
              <div className="space-y-3">
                {stats.incomeDistribution.length === 0 ? (
                  <p className="text-slate-500 text-sm">Nenhum dado disponível</p>
                ) : (
                  stats.incomeDistribution.map((item) => (
                    <div key={item.range} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{item.range || 'Não informado'}</span>
                      <span className="text-sm font-medium bg-slate-800 px-3 py-1 rounded-full">
                        {item.count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Daily Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Visitantes por Dia</h2>
              <div className="flex items-end justify-between gap-2 h-32">
                {stats.dailyStats.map((day) => {
                  const maxCount = Math.max(...stats.dailyStats.map(d => d.count), 1);
                  const height = (day.count / maxCount) * 100;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-slate-400">{day.count}</span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(height, 4)}%` }}
                        transition={{ duration: 0.5 }}
                        className="w-full bg-indigo-500 rounded-t-sm min-h-[4px]"
                      />
                      <span className="text-xs text-slate-500">
                        {new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* Insights */}
        {stats && stats.overview.totalSessions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold mb-3">Insights</h2>
            <ul className="space-y-2 text-slate-300">
              {parseFloat(stats.overview.completionRate) < 50 && (
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">⚠</span>
                  <span>Taxa de conclusão abaixo de 50%. Considere simplificar as perguntas ou reduzir o número.</span>
                </li>
              )}
              {stats.funnel['q1'] && stats.funnel['landing'] && 
               ((stats.funnel['landing'] - stats.funnel['q1']) / stats.funnel['landing'] * 100) > 30 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-400">🚨</span>
                  <span>Grande abandono na primeira pergunta. Revise a copy da landing page.</span>
                </li>
              )}
              {parseFloat(stats.overview.conversionRate) >= 5 && (
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✅</span>
                  <span>Ótima taxa de conversão! Continue monitorando para manter a performance.</span>
                </li>
              )}
              {stats.overview.totalSessions < 10 && (
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">📊</span>
                  <span>Poucos dados ainda. Aguarde mais visitantes para análises mais precisas.</span>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}
