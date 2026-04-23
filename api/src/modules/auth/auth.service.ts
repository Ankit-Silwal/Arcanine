import type { loginBody, signUpBody } from "../types/auth.types.js";
import { emailLoginStrategy, emailSignUpStrategy } from "./strategies/email.strategy.js";
import { githubSignUpStrategy } from "./strategies/github.strategy.js";
import { googleSignUpStrategy } from "./strategies/google.strategy.js";
export async function signUpService(input:signUpBody) {
  if(input.provider==="email"){
    return await emailSignUpStrategy(input.email,input.password);
  }
  else if(input.provider==="google"){
    return await googleSignUpStrategy(input.oauthToken)
  }
  else if(input.provider==="github"){
    return await githubSignUpStrategy(input.oauthToken)
  }else{
    return ({
      success:false,
      message:"Pass the both provider and shit"
    })
  }
}


export async function loginService(input:loginBody) {
  if(!input.provider){
    return ({
      success:false,
      message:"Provide the required provider sir"
    })
  }
  if(input.provider==="email"){
    return await emailLoginStrategy(input.email,input.password);
  }
}