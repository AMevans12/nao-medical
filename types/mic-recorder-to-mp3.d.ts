declare module "mic-recorder-to-mp3" {
  interface MicRecorderOptions {
    bitRate?: number;
    sampleRate?: number;
  }

  export default class MicRecorder {
    constructor(options?: MicRecorderOptions);
    start(): Promise<void>;
    stop(): Promise<{ blob: Blob; buffer: ArrayBuffer[]; audioUrl: string }>;
    pause(): void;
    resume(): void;
    /**
     * Returns the MP3 buffer and blob.
     */
    getMp3(): Promise<[ArrayBuffer[], Blob]>;
  }
}
