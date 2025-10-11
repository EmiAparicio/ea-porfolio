type SoundKey = 'hover' | 'on' | 'off' | 'click';

const SOUND_SOURCES: Record<SoundKey, string> = {
  hover: 'https://cdn.freesound.org/previews/28/28094_199517-lq.mp3',
  on: 'https://cdn.freesound.org/previews/220/220166_4100837-lq.mp3',
  off: 'https://cdn.freesound.org/previews/657/657950_6142149-lq.mp3',
  click: 'https://cdn.freesound.org/previews/367/367997_6512973-lq.mp3',
};

const SOUND_LEVELS: Record<SoundKey, number> = {
  hover: 0.4,
  on: 1,
  off: 1,
  click: 0.9,
};

/**
 * Manages the loading and playback of UI sound effects using the Web Audio API.
 * This class handles AudioContext unlocking, preloading sounds, and playing them.
 * It is intended to be used as a singleton.
 */
class AudioManager {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Partial<Record<SoundKey, AudioBuffer>> = {};
  private isUnlocked = false;
  private isLoading = false;

  /**
   * Lazily initializes the AudioContext.
   * This method is called internally before any audio operations.
   * @private
   */
  private init() {
    if (!this.audioContext && typeof window !== 'undefined') {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Unlocks the AudioContext, allowing sounds to be played.
   * This must be called in response to a user gesture (e.g., a click).
   * It resumes the context if it's suspended and triggers preloading of all sounds.
   */
  public unlock = () => {
    this.init();
    if (this.isUnlocked || !this.audioContext) return;

    const context = this.audioContext;

    const onUnlock = () => {
      this.isUnlocked = true;
      this.preloadAll();
    };

    if (context.state === 'suspended') {
      context
        .resume()
        .then(() => {
          // "Priming" trick: Play a silent buffer to fully unlock audio on iOS.
          const source = context.createBufferSource();
          source.buffer = context.createBuffer(1, 1, 22050);
          source.connect(context.destination);
          source.start(0);

          onUnlock();
        })
        .catch((err) => {
          console.error('AudioContext resume failed: ', err);
        });
    } else {
      onUnlock();
    }
  };

  /**
   * Preloads all sound effects defined in `SOUND_SOURCES`.
   * This fetches and decodes the audio data, storing it for later playback.
   */
  public preloadAll = async () => {
    // Se elimina la condición que causaba el problema.
    if (!this.audioContext || this.isLoading) return;
    this.isLoading = true;

    const soundKeys = Object.keys(SOUND_SOURCES) as SoundKey[];
    await Promise.all(soundKeys.map((key) => this.loadSound(key))).catch();

    this.isLoading = false;
  };

  /**
   * Loads a single sound file and decodes it into an AudioBuffer.
   * @param key The key of the sound to load.
   * @private
   */
  private async loadSound(key: SoundKey): Promise<void> {
    if (!this.audioContext || this.audioBuffers[key]) return;

    try {
      const response = await fetch(SOUND_SOURCES[key]);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffers[key] = audioBuffer;
    } catch (_error) {}
  }

  /**
   * Plays a preloaded sound.
   * @param key The key of the sound to play.
   * @param options Optional playback settings.
   * @param options.tailSec If provided, plays only the last `tailSec` seconds of the sound.
   */
  public play(key: SoundKey, options?: { tailSec?: number }) {
    if (!this.isUnlocked || !this.audioContext) return;

    const audioBuffer = this.audioBuffers[key];
    if (!audioBuffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = SOUND_LEVELS[key];

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const offset = options?.tailSec
      ? Math.max(0, audioBuffer.duration - options.tailSec)
      : 0;

    source.start(0, offset);
  }
}

/**
 * The singleton instance of the AudioManager for global use.
 */
export const audioManager = new AudioManager();
