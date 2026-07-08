import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return null;

  return (
    <div className="max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meu perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Nome:</span> {user.name}
          </p>
          <p>
            <span className="text-muted-foreground">E-mail:</span> {user.email}
          </p>
          <p>
            <span className="text-muted-foreground">Membro desde:</span>{" "}
            {user.createdAt.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alterar senha</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
