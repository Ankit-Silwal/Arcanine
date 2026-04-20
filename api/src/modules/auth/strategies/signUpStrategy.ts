import type { SignUpBody } from "../auth.controller.js";
export interface SignupStrategy {
  signup(body: SignUpBody): Promise<void>;
}