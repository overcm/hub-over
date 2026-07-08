import { getSettings } from "@/lib/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateCommunitySettings } from "./actions";

export default async function AdminCommunityPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Comunidade</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Comunidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure o link do grupo do WhatsApp e as regras de boa conduta exibidas para os
          alunos na página "Comunidade".
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateCommunitySettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsappCommunityUrl">Link do grupo do WhatsApp</Label>
              <Input
                id="whatsappCommunityUrl"
                name="whatsappCommunityUrl"
                placeholder="https://chat.whatsapp.com/xxxxxxxx"
                defaultValue={settings.whatsappCommunityUrl ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="communityGuidelines">Regras de boa conduta</Label>
              <Textarea
                id="communityGuidelines"
                name="communityGuidelines"
                rows={8}
                placeholder="Ex: Respeite os outros participantes, não compartilhe o conteúdo fora do grupo, evite spam..."
                defaultValue={settings.communityGuidelines ?? ""}
              />
              <p className="text-xs text-muted-foreground">
                Cada linha vira um item na lista de regras exibida para o aluno.
              </p>
            </div>
            <Button type="submit">Salvar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
