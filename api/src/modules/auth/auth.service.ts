import type { signUpBody } from "../types/auth.types.js";
import { emailSignUpStrategy } from "./strategies/email.strategy.js";
import { githubSignUpStrategy } from "./strategies/github.strategy.js";
import { googleSignUpStrategy } from "./strategies/google.strategy.js";
export async function signUpService(input:signUpBody) {
  if(input.provider==="email"){
    return emailSignUpStrategy(input.email,input.password);
  }
  else if(input.provider==="google"){
    return googleSignUpStrategy(input.oauthToken)
  }
  else if(input.provider==="github"){
    return githubSignUpStrategy(input.oauthToken)
  }else{
    return ({
      success:false,
      message:"Pass the both provider and shit"
    })
  }
}