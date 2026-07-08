import { Resend } from "resend";

export async function sendStudentCredentialsEmail(params: {
  name: string;
  email: string;
  temporaryPassword: string;
}) {
  const { name, email, temporaryPassword } = params;
  const loginUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (!process.env.RESEND_API_KEY) {
    console.warn(
      `[email] RESEND_API_KEY não configurada. Credenciais de ${email}: senha temporária "${temporaryPassword}".`,
    );
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Hub Over <onboarding@resend.dev>",
    to: email,
    subject: "Seu acesso ao Hub Over",
    html: `
      <p>Olá, ${name}!</p>
      <p>Sua conta na área de membros foi criada. Use as credenciais abaixo para acessar:</p>
      <p><strong>E-mail:</strong> ${email}<br/>
      <strong>Senha temporária:</strong> ${temporaryPassword}</p>
      <p>Acesse em: <a href="${loginUrl}/login">${loginUrl}/login</a></p>
      <p>Recomendamos trocar a senha após o primeiro acesso.</p>
    `,
  });
}
