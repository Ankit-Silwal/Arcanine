export type signUpBody=
|
{
  provider:"email",
  email:string,
  password:string
}|
{
  provider:authProviders
  oauthToken:string
}

export type loginBody=
|
{
  provider:"email",
  email:string,
  password:string
}|
{
  provider:authProviders,
  token:string 
}

export type changePasswordType=
{
  oldPassword:string,
  newPassword:string,
  confirmPassword:string
}

export type authProviders="google"|"github"