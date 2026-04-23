import { transporter } from "./nodemailer.js";
export async function sendVerificationEmail(email: string, token: string)
{
  const link = `http://localhost:3000/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
          
          <h2 style="text-align: center; color: #333;">Verify Your Email</h2>
          
          <p style="color: #555; font-size: 14px; text-align: center;">
            Thanks for signing up. Please confirm your email address to continue.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" 
              style="
                background: #4f46e5;
                color: white;
                padding: 12px 24px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: bold;
                display: inline-block;
              ">
              Verify Email
            </a>
          </div>

          <p style="font-size: 12px; color: #888; text-align: center;">
            Or copy and paste this link into your browser:
          </p>

          <p style="font-size: 12px; color: #4f46e5; word-break: break-all; text-align: center;">
            ${link}
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

          <p style="font-size: 11px; color: #aaa; text-align: center;">
            This link will expire in 15 minutes. If you didn’t request this, you can ignore this email.
          </p>

        </div>
      </div>
    `
  });
}

export async function sendResetEmail(email: string, token: string)
{
  const link = `http://localhost:3000/auth/reset?token=${token}`;

  await transporter.sendMail({
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
          
          <h2 style="text-align: center; color: #333;">Reset Your Password</h2>
          
          <p style="color: #555; font-size: 14px; text-align: center;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" 
              style="
                background: #4f46e5;
                color: white;
                padding: 12px 24px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: bold;
                display: inline-block;
              ">
              Reset Password
            </a>
          </div>

          <p style="font-size: 12px; color: #888; text-align: center;">
            Or copy and paste this link into your browser:
          </p>

          <p style="font-size: 12px; color: #4f46e5; word-break: break-all; text-align: center;">
            ${link}
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

          <p style="font-size: 11px; color: #aaa; text-align: center;">
            This link will expire in 15 minutes. If you didn't request this, you can ignore this email.
          </p>

        </div>
      </div>
    `
  });
}