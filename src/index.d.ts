export type CaptchaType = "fidel" | "geez-math" | "click-image";
export interface CaptchaChallenge {
  success: true;
  type: CaptchaType;
  captchaId: string;
  expiresAt: number;
  /** SVG data URI (fidel, geez-math) or sprite URL (click-image). */
  image: string;
  /** click-image only */
  question?: string;
  grid?: number;
}
export interface CaptchaFailure { success: false; code: string; message: string; attemptsLeft?: number }
export interface CaptchaResult { success: boolean; code: string; message: string; attemptsLeft?: number }
export interface CaptchaStore {
  get(id: string): Promise<any> | any;
  set(id: string, record: any, ttlMs: number): Promise<void> | void;
  delete(id: string): Promise<void> | void;
  close?(): void;
}
export interface CaptchaOptions {
  type?: CaptchaType; count?: number; ttl?: number; maxAttempts?: number;
  maxEntries?: number; imageBaseUrl?: string;
  /** Required with a custom store; share it across instances. */
  secret?: string | Buffer; store?: CaptchaStore;
}
export interface CaptchaInstance {
  generate(type?: CaptchaType, count?: number): Promise<CaptchaChallenge | CaptchaFailure>;
  validate(captchaId: string, input: string | number): Promise<CaptchaResult>;
  close(): void;
}
export function createCaptcha(options?: CaptchaOptions): CaptchaInstance;
export function generateCaptcha(type?: CaptchaType, count?: number): Promise<CaptchaChallenge | CaptchaFailure>;
export function validateCaptcha(captchaId: string, input: string | number): Promise<CaptchaResult>;
export class MemoryStore implements CaptchaStore {
  constructor(o?: { maxEntries?: number; sweepIntervalMs?: number });
  get(id: string): Promise<any>; set(id: string, r: any): Promise<void>; delete(id: string): Promise<void>;
  sweep(): void; close(): void;
}
export const captchaConfig: Required<Omit<CaptchaOptions, "secret" | "store">>;
export function toGeez(n: number): string;
export function parseNumber(input: string): number;
