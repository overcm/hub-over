import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle, Users, FileText, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Hub Over — Mentorias e conteúdos para acelerar resultados",
  description:
    "Aulas gravadas, mentorias ao vivo, materiais e uma comunidade de networking em um só lugar. Fale com a gente no WhatsApp.",
};

const WHATSAPP_URL = "https://wa.link/nw0115";

const BENEFITS = [
  {
    icon: PlayCircle,
    title: "Aulas gravadas",
    description: "Conteúdo prático liberado no seu ritmo, pra assistir quando quiser.",
  },
  {
    icon: Users,
    title: "Mentorias e networking",
    description: "Encontros ao vivo com o grupo e troca direta com quem já está na estrada.",
  },
  {
    icon: FileText,
    title: "Materiais de apoio",
    description: "Modelos, planilhas e resumos pra aplicar o que você aprende no mesmo dia.",
  },
  {
    icon: LineChart,
    title: "Acompanhamento",
    description: "Seu progresso registrado por aula, pra você ver a evolução de verdade.",
  },
];

const TESTIMONIAL_IMAGES = [
  "depoimento-6.jpeg",
  "depoimento-2.jpeg",
  "depoimento-1.jpeg",
  "depoimento-3.jpeg",
  "depoimento-4.jpeg",
  "depoimento-5.jpeg",
];

const PLANS = [
  {
    name: "Semestral",
    price: "R$ 2.400",
    installment: "ou em até 12x sem juros",
  },
  {
    name: "Anual",
    price: "R$ 4.000",
    installment: "ou em até 12x sem juros",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-sm font-semibold tracking-[0.25em] text-white uppercase">
              Hub <span className="text-primary">Over</span>
            </span>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
            render={<Link href="/login">Já sou aluno</Link>}
          />
        </div>
      </header>

      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(199,40,37,0.35),_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start px-6 py-24 sm:py-32">
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Sua área de conhecimento, feita para acelerar resultados.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Aulas gravadas, mentorias, materiais e acompanhamento em um só lugar — e um grupo de
            gente que está construindo resultado igual você.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              className="h-12 px-6 text-base"
              render={
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  Falar no WhatsApp
                </a>
              }
            />
            <Button
              size="lg"
              variant="ghost"
              nativeButton={false}
              className="h-12 px-6 text-base text-white hover:bg-white/10 hover:text-white"
              render={<Link href="/login">Já sou aluno → Entrar</Link>}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">O que tem dentro do Hub</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardContent className="space-y-3">
                <Icon size={28} className="text-primary" />
                <h3 className="font-semibold tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Quem já está dentro, fala melhor que a gente
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIAL_IMAGES.map((file) => (
              <div
                key={file}
                className="overflow-hidden rounded-xl bg-black ring-1 ring-foreground/10"
              >
                <Image
                  src={`/depoimentos/${file}`}
                  alt="Depoimento de aluno do Hub Over no WhatsApp"
                  width={800}
                  height={500}
                  className="h-auto w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Como entrar</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <Card key={plan.name}>
              <CardContent className="space-y-4 py-4">
                <h3 className="text-sm font-semibold tracking-widest text-primary uppercase">
                  {plan.name}
                </h3>
                <p className="text-4xl font-semibold tracking-tight">{plan.price}</p>
                <p className="text-sm text-muted-foreground">{plan.installment}</p>
                <Button
                  className="mt-2 w-full"
                  nativeButton={false}
                  render={
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                      Falar no WhatsApp
                    </a>
                  }
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-black py-10 text-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs">© {new Date().getFullYear()} Hub Over</p>
          <Button
            variant="ghost"
            nativeButton={false}
            className="h-9 text-white hover:bg-white/10 hover:text-white"
            render={<Link href="/login">Já sou aluno</Link>}
          />
        </div>
      </footer>
    </div>
  );
}
