export type signUpBody=
|
{
  provider:"email",
  email:string,
  password:string
}|
{
  provider:"google"|"github"
  oauthToken:string
}


export type provider="email"|"google"|"github"