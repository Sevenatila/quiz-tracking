'use client';

import { useCallback, useRef, useEffect } from 'react';

// Gera som de moeda usando Web Audio API (sem arquivos externos)
function createCoinSound(audioContext: AudioContext): void {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Som de "coin" - frequência que sobe rapidamente
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
  oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.15);
  
  oscillator.type = 'sine';
  
  // Envelope do volume
  gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
}

function createClickSound(audioContext: AudioContext): void {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Som de click suave
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05);
  
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.08);
}

function createSuccessSound(audioContext: AudioContext): void {
  // Acorde de sucesso (duas notas)
  [523.25, 659.25].forEach((freq, i) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.12, audioContext.currentTime + i * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
    
    oscillator.start(audioContext.currentTime + i * 0.1);
    oscillator.stop(audioContext.currentTime + i * 0.1 + 0.3);
  });
}

function createTickSound(audioContext: AudioContext): void {
  const t = audioContext.currentTime;

  // Camada 1: impacto metálico agudo (o "toc" do relógio)
  const osc1 = audioContext.createOscillator();
  const gain1 = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  osc1.connect(filter);
  filter.connect(gain1);
  gain1.connect(audioContext.destination);
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(3500, t);
  osc1.frequency.exponentialRampToValueAtTime(1500, t + 0.008);
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2500, t);
  filter.Q.setValueAtTime(5, t);
  gain1.gain.setValueAtTime(0.06, t);
  gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  osc1.start(t);
  osc1.stop(t + 0.03);

  // Camada 2: corpo/ressonância grave (dá peso ao tick)
  const osc2 = audioContext.createOscillator();
  const gain2 = audioContext.createGain();
  osc2.connect(gain2);
  gain2.connect(audioContext.destination);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(400, t);
  osc2.frequency.exponentialRampToValueAtTime(200, t + 0.015);
  gain2.gain.setValueAtTime(0.03, t);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
  osc2.start(t);
  osc2.stop(t + 0.025);
}

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isEnabledRef = useRef(true);

  // Inicializa AudioContext no primeiro uso
  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    
    // Resume se estiver suspenso (política de autoplay)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    return audioContextRef.current;
  }, []);

  // Som de moeda
  const playCoinSound = useCallback(() => {
    if (!isEnabledRef.current) return;
    const ctx = getAudioContext();
    if (ctx) {
      createCoinSound(ctx);
    }
  }, [getAudioContext]);

  // Som de click
  const playClickSound = useCallback(() => {
    if (!isEnabledRef.current) return;
    const ctx = getAudioContext();
    if (ctx) {
      createClickSound(ctx);
    }
  }, [getAudioContext]);

  // Som de sucesso
  const playSuccessSound = useCallback(() => {
    if (!isEnabledRef.current) return;
    const ctx = getAudioContext();
    if (ctx) {
      createSuccessSound(ctx);
    }
  }, [getAudioContext]);

  // Som de tick (cronômetro)
  const playTickSound = useCallback(() => {
    if (!isEnabledRef.current) return;
    const ctx = getAudioContext();
    if (ctx) {
      createTickSound(ctx);
    }
  }, [getAudioContext]);

  // Toggle som
  const toggleSound = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playCoinSound,
    playClickSound,
    playSuccessSound,
    playTickSound,
    toggleSound,
  };
}
