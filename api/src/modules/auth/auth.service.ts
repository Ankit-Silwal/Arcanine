import type { SignUpBody } from "./auth.controller.js";
import pool from "../../config/db.js";

export async function  signup(body:SignUpBody) {
  let email:string|undefined;
  if(body.provider=="email"){
    if(!body.email||!body.password){
      throw new Error("Both email and password are required")
    }
    email=body.email;
    
  }
  else if(body.provider==="google"||body.provider==="github"){
    if(!body.oauthToken){
      return new Error("Invalid oauth token sir")
    }
  }
}