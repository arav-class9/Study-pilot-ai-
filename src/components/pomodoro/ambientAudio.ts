import { AmbientSoundType } from '../../types';

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType = 'none';
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private volume = 0.5;

  // Active audio nodes for cleanup
  private activeSources: (AudioNode | NodeJS.Timeout | number)[] = [];
  private rainInterval: number | null = null;
  private crackleInterval: number | null = null;

  private initContext(): boolean {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    return true;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public stop() {
    this.stopAllNodes();
    this.isPlaying = false;
  }

  private stopAllNodes() {
    if (this.rainInterval) {
      window.clearInterval(this.rainInterval);
      this.rainInterval = null;
    }
    if (this.crackleInterval) {
      window.clearInterval(this.crackleInterval);
      this.crackleInterval = null;
    }
    this.activeSources.forEach((item) => {
      try {
        if (typeof item === 'object' && item !== null && 'stop' in item && typeof (item as AudioScheduledSourceNode).stop === 'function') {
          (item as AudioScheduledSourceNode).stop();
        }
        if (typeof item === 'object' && item !== null && 'disconnect' in item && typeof (item as AudioNode).disconnect === 'function') {
          (item as AudioNode).disconnect();
        }
      } catch {
        // Ignore disconnection issues
      }
    });
    this.activeSources = [];
  }

  public play(type: AmbientSoundType) {
    this.stop();
    if (type === 'none') {
      this.currentType = 'none';
      return;
    }

    if (!this.initContext() || !this.ctx || !this.masterGain) return;

    this.currentType = type;
    this.isPlaying = true;

    switch (type) {
      case 'white_noise':
        this.playWhiteNoise();
        break;
      case 'brown_noise':
        this.playBrownNoise();
        break;
      case 'rain':
        this.playRain();
        break;
      case 'library':
        this.playLibraryAmbience();
        break;
      case 'binaural_40hz':
        this.playBinaural40Hz();
        break;
      case 'campfire':
        this.playCampfire();
        break;
      default:
        break;
    }
  }

  // 1. White Noise generator
  private playWhiteNoise() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    // Filter to remove piercing highs
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.25;

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    this.activeSources.push(whiteNoise, filter, gain);
  }

  // 2. Brown Noise (Deep focus waterfall)
  private playBrownNoise() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = buffer;
    brownNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.6;

    brownNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    brownNoise.start();
    this.activeSources.push(brownNoise, filter, gain);
  }

  // 3. Gentle Rain & Distant Thunder
  private playRain() {
    if (!this.ctx || !this.masterGain) return;

    // Rain bed
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.05 * white) / 1.05;
      lastOut = output[i];
      output[i] *= 2.0;
    }

    const rainBed = this.ctx.createBufferSource();
    rainBed.buffer = buffer;
    rainBed.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.8;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.45;

    rainBed.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    rainBed.start();
    this.activeSources.push(rainBed, filter, gain);

    // Random raindrops
    this.rainInterval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      try {
        const dropOsc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const baseFreq = 800 + Math.random() * 1200;

        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(baseFreq, now);
        dropOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.05);

        dropGain.gain.setValueAtTime(0.08 * Math.random(), now);
        dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        dropOsc.connect(dropGain);
        dropGain.connect(this.masterGain);

        dropOsc.start(now);
        dropOsc.stop(now + 0.07);
      } catch {
        // Ignore drop failure
      }
    }, 180);
  }

  // 4. Library Ambience (Warm ambient murmur & soft room acoustic)
  private playLibraryAmbience() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      left[i] = (Math.random() * 2 - 1) * 0.5;
      right[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 350;

    const peak = this.ctx.createBiquadFilter();
    peak.type = 'peaking';
    peak.frequency.value = 180;
    peak.gain.value = 4;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.55;

    noise.connect(lowpass);
    lowpass.connect(peak);
    peak.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.activeSources.push(noise, lowpass, peak, gain);
  }

  // 5. Binaural 40Hz Focus Wave (Left 200Hz, Right 240Hz for Gamma neuro-focus)
  private playBinaural40Hz() {
    if (!this.ctx || !this.masterGain) return;

    // Stereo Panner or Channel Merger
    const merger = this.ctx.createChannelMerger(2);

    const oscLeft = this.ctx.createOscillator();
    const oscRight = this.ctx.createOscillator();

    const gainLeft = this.ctx.createGain();
    const gainRight = this.ctx.createGain();

    oscLeft.type = 'sine';
    oscLeft.frequency.value = 200; // Base carrier

    oscRight.type = 'sine';
    oscRight.frequency.value = 240; // 40Hz Gamma differential

    gainLeft.gain.value = 0.25;
    gainRight.gain.value = 0.25;

    oscLeft.connect(gainLeft);
    oscRight.connect(gainRight);

    gainLeft.connect(merger, 0, 0); // left channel
    gainRight.connect(merger, 0, 1); // right channel

    // Gentle low sub undertone
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.value = 100;
    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.1;
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);

    merger.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();
    subOsc.start();

    this.activeSources.push(oscLeft, oscRight, subOsc, gainLeft, gainRight, subGain, merger);
  }

  // 6. Campfire & Crackle
  private playCampfire() {
    if (!this.ctx || !this.masterGain) return;

    // Warm base rumble
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.03 * white) / 1.03;
      lastOut = output[i];
    }

    const rumble = this.ctx.createBufferSource();
    rumble.buffer = buffer;
    rumble.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 280;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.5;

    rumble.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    rumble.start();
    this.activeSources.push(rumble, filter, gain);

    // Stochastic pops & crackles
    this.crackleInterval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      try {
        const pop = this.ctx.createBufferSource();
        const popBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
        const popData = popBuffer.getChannelData(0);
        for (let i = 0; i < popData.length; i++) {
          popData[i] = (Math.random() * 2 - 1) * Math.exp(-i / 80);
        }
        pop.buffer = popBuffer;

        const popGain = this.ctx.createGain();
        popGain.gain.value = 0.15 * Math.random();

        pop.connect(popGain);
        popGain.connect(this.masterGain);
        pop.start();
      } catch {
        // Ignore pop error
      }
    }, 240);
  }

  // Bell chimes
  public playChime(type: 'start' | 'complete') {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      if (type === 'complete') {
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        freqs.forEach((f, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.12);
          gain.gain.setValueAtTime(0.2, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.85);
        });
      } else {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      }
    } catch {
      // Safe fallback
    }
  }
}

export const ambientAudio = new AmbientAudioEngine();
