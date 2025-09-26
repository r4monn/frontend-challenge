declare module 'util' {
  export class TextEncoder {
    constructor(encoding?: string);
    encode(input?: string): Uint8Array;
  }
  
  export class TextDecoder {
    constructor(encoding?: string, options?: { fatal?: boolean; ignoreBOM?: boolean });
    decode(input?: BufferSource): string;
  }
}