import { MessageCircle, Users2, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSettings } from "@/lib/settings";

export default async function CommunityPage() {
  const settings = await getSettings();
  const whatsappUrl = settings.whatsappCommunityUrl;
  const guidelines = (settings.communityGuidelines ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Comunidade</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Nossa comunidade</h1>
      </div>

      <Card className="overflow-hidden">
        <div className="relative flex items-center justify-center overflow-hidden bg-black py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(199,40,37,0.35),_transparent_60%)]" />
          <Users2 size={48} className="relative text-white/80" />
        </div>
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            A comunidade é o espaço para você trocar experiências com outros participantes das
            mentorias, tirar dúvidas entre as aulas, compartilhar resultados e ficar por dentro
            de novidades e avisos importantes — tudo direto pelo WhatsApp, sem burocracia.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-primary" />
              <span>Networking com quem também está participando das mentorias.</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-primary" />
              <span>Espaço para dúvidas rápidas fora do horário das mentorias.</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-primary" />
              <span>Avisos sobre novas aulas, materiais e conteúdos liberados.</span>
            </li>
          </ul>

          {whatsappUrl ? (
            <Button
              render={
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={16} />
                  Entrar no grupo do WhatsApp
                </a>
              }
              nativeButton={false}
              className="flex w-full items-center justify-center gap-2 sm:w-auto"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              O link do grupo ainda não foi configurado. Fale com o administrador.
            </p>
          )}
        </CardContent>
      </Card>

      {guidelines.length > 0 && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              <h2 className="text-base font-semibold tracking-tight">Regras de boa conduta</h2>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {guidelines.map((rule, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-primary">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
