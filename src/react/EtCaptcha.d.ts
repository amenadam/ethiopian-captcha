import type { ReactElement, CSSProperties } from "react";
import type { CaptchaChallenge } from "../index.js";
export interface EtCaptchaProps {
  challenge: CaptchaChallenge | null | undefined;
  onVerify: (v: { captchaId: string; input: string | number }) => void;
  onRefresh: () => void;
  loading?: boolean;
  lang?: "both" | "en" | "am";
  style?: CSSProperties;
}
export function EtCaptcha(props: EtCaptchaProps): ReactElement | null;
