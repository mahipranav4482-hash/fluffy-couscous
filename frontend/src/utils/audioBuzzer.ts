/**
 * High-Decibel Emergency Audio Siren & Synthesizer Engine
 * Generates attention-commanding dual-tone EAS emergency sirens (853Hz + 960Hz)
 * and automated speech synthesis alerts on mobile and desktop browsers.
 */

let audioCtx: AudioContext | null = null;
let sirenOsc1: OscillatorNode | null = null;
let sirenOsc2: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let isBuzzerActive = false;
let lfoTimer: any = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Starts the continuous emergency buzzer / siren.
 * Plays high-intensity alternating tones (853 Hz & 960 Hz - the standard EAS emergency attention signal).
 */
export function startEmergencyBuzzer(volume: number = 0.85): void {
  if (isBuzzerActive) return;

  try {
    const ctx = getAudioContext();
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.connect(ctx.destination);

    // Primary Tone: 853 Hz
    sirenOsc1 = ctx.createOscillator();
    sirenOsc1.type = 'sawtooth';
    sirenOsc1.frequency.setValueAtTime(853, ctx.currentTime);
    sirenOsc1.connect(gainNode);

    // Secondary Harmonizing Tone: 960 Hz
    sirenOsc2 = ctx.createOscillator();
    sirenOsc2.type = 'sawtooth';
    sirenOsc2.frequency.setValueAtTime(960, ctx.currentTime);
    sirenOsc2.connect(gainNode);

    sirenOsc1.start();
    sirenOsc2.start();
    isBuzzerActive = true;

    // Modulate pitch rapidly for alarm effect (853Hz <-> 1050Hz warble)
    let flip = false;
    lfoTimer = setInterval(() => {
      if (!isBuzzerActive || !sirenOsc1 || !sirenOsc2 || !audioCtx) return;
      flip = !flip;
      const t = audioCtx.currentTime;
      sirenOsc1.frequency.setValueAtTime(flip ? 853 : 980, t);
      sirenOsc2.frequency.setValueAtTime(flip ? 960 : 1120, t);
    }, 220);

    // Trigger device vibration if available
    if (navigator.vibrate) {
      navigator.vibrate([600, 200, 600, 200, 1000]);
    }
  } catch (err) {
    console.warn('Audio Context playback blocked by browser policy:', err);
  }
}

/**
 * Silences the emergency buzzer.
 */
export function stopEmergencyBuzzer(): void {
  if (!isBuzzerActive) return;

  if (lfoTimer) {
    clearInterval(lfoTimer);
    lfoTimer = null;
  }

  try {
    if (sirenOsc1) {
      sirenOsc1.stop();
      sirenOsc1.disconnect();
      sirenOsc1 = null;
    }
    if (sirenOsc2) {
      sirenOsc2.stop();
      sirenOsc2.disconnect();
      sirenOsc2 = null;
    }
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
  } catch (err) {
    console.error('Error stopping audio siren:', err);
  }

  isBuzzerActive = false;

  if (navigator.vibrate) {
    navigator.vibrate(0); // Cancel vibration
  }
}

export function isAudioBuzzerPlaying(): boolean {
  return isBuzzerActive;
}

/**
 * Text-to-Speech automated emergency voice broadcast.
 */
export function speakEmergencyBroadcast(text: string): void {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel(); // Stop any pending speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 1.1;
  utterance.volume = 1.0;

  // Prefer English or localized voices
  const voices = window.speechSynthesis.getVoices();
  const alertVoice = voices.find((v) => v.lang.startsWith('en') && v.name.includes('Natural')) || voices[0];
  if (alertVoice) {
    utterance.voice = alertVoice;
  }

  window.speechSynthesis.speak(utterance);
}
