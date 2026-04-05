/**
 * Aegis Voice System
 * Local TTS and STT using Web Speech API.
 */

import { GoogleGenAI, Modality } from "@google/genai";

export class VoiceSystem {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private lastRequestId: number = 0;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
  }

  /**
   * High-quality AI Speech using Gemini TTS
   */
  public async speakAI(text: string, voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Kore') {
    this.stop();
    const requestId = ++this.lastRequestId;
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      if (requestId !== this.lastRequestId) return false;

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        await this.playRawAudio(base64Audio, requestId);
        return true;
      }
    } catch (error) {
      console.error("[Aegis] AI Speech Error:", error);
    }
    return false;
  }

  private async playRawAudio(base64Data: string, requestId: number) {
    if (requestId !== this.lastRequestId) return;
    
    const ctx = this.initAudioContext();
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Gemini TTS returns raw PCM with sample rate 24000
    // We need to convert this to an AudioBuffer
    const audioBuffer = ctx.createBuffer(1, len / 2, 24000);
    const channelData = audioBuffer.getChannelData(0);
    
    // Int16 to Float32 conversion
    const dataView = new DataView(bytes.buffer);
    for (let i = 0; i < len / 2; i++) {
      channelData[i] = dataView.getInt16(i * 2, true) / 32768;
    }

    const source = ctx.createBufferSource();
    this.currentSource = source;
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start();
    
    return new Promise((resolve) => {
      source.onended = () => {
        if (this.currentSource === source) {
          this.currentSource = null;
        }
        resolve(true);
      };
    });
  }

  public speak(text: string, gender: 'male' | 'female' = 'female') {
    this.stop();
    this.lastRequestId++; // Invalidate any pending AI speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a premium-sounding voice or a Bengali voice
    const preferredVoice = this.voices.find(v => 
      (v.lang.startsWith('bn') || v.name.includes('Bengali')) ||
      (gender === 'female' 
        ? (v.name.includes('Google UK English Female') || v.name.includes('Female') || v.name.includes('Samantha'))
        : (v.name.includes('Google UK English Male') || v.name.includes('Male') || v.name.includes('Daniel')))
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      // Adjust pitch/rate if it's a Bengali voice for better clarity
      if (preferredVoice.lang.startsWith('bn')) {
        utterance.pitch = gender === 'female' ? 1.2 : 1.0;
        utterance.rate = 0.9;
      }
    }
    
    utterance.pitch = gender === 'female' ? 1.1 : 0.9;
    utterance.rate = 0.95; // Slightly slower for "premium" feel
    
    this.synth.speak(utterance);
    return utterance;
  }

  public stop() {
    this.lastRequestId++; // Invalidate any pending async calls
    this.synth.cancel();
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Source might have already stopped
      }
      this.currentSource = null;
    }
  }

  public downloadAudio(text: string, filename: string = 'aegis_response.txt') {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    console.log(`[Aegis] Exporting response: ${filename}`);
  }
}

export const aegisVoice = new VoiceSystem();
