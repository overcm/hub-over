import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle, Users, FileText, LineChart, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Hub Over | Gestão e escala para donos de restaurante",
  description:
    "Aulas gravadas, mentorias ao vivo com quem fatura R$30mi+/ano, materiais e uma comunidade de donos de restaurante construindo escala com previsibilidade. Fale com a gente no WhatsApp.",
};

const WHATSAPP_URL = "https://wa.link/nw0115";
const CTA_LABEL = "Quero fazer parte";

const STATS = [
  { value: "R$ 25Mi+", label: "faturados em 2025 pelos clientes da Over" },
  { value: "150+", label: "negócios atendidos" },
  { value: "1Mi+", label: "pedidos gerados" },
];

const BENEFITS = [
  {
    icon: PlayCircle,
    title: "Aulas gravadas",
    description: "Conteúdo prático liberado no seu ritmo, pra assistir quando quiser.",
  },
  {
    icon: Users,
    title: "Mentorias e networking",
    description: "Encontros ao vivo com quem já fatura R$30mi+/ano e troca direta com o grupo.",
  },
  {
    icon: FileText,
    title: "Materiais de apoio",
    description: "Planilhas de precificação, CMV e modelos pra aplicar no seu negócio no mesmo dia.",
  },
  {
    icon: Sparkles,
    title: "IA aplicada à gestão",
    description: "Como usar IA no dia a dia do restaurante: precificação, escala e atendimento.",
  },
  {
    icon: LineChart,
    title: "Acompanhamento",
    description: "Seu progresso registrado por aula, pra você ver a evolução de verdade.",
  },
];

const MENTORS = [
  {
    name: "Felipe Lohmann · Multifranqueado Quiero Café e Pop Poke",
    result: "8 restaurantes · faturamento de R$ 30mi/ano",
    topics: ["Gestão de pessoas", "Gestão financeira e CMV", "Gestão de processos", "Multilojas e sócios"],
  },
  {
    name: "Rodrigo · Grupo Saudoso",
    result: "5 restaurantes · faturamento de R$ 35mi/ano",
    topics: [
      "Negociação com fornecedores",
      "Negociação de taxa de maquininha",
      "Captação de investimento com banco",
    ],
  },
];

const TESTIMONIALS = [
  { file: "depoimento-6.jpeg", width: 1179, height: 320 },
  { file: "depoimento-2.jpeg", width: 1179, height: 792 },
  { file: "depoimento-1.jpeg", width: 1179, height: 516 },
  { file: "depoimento-3.jpeg", width: 1088, height: 1280 },
  { file: "depoimento-4.jpeg", width: 1179, height: 258 },
  { file: "depoimento-5.jpeg", width: 1179, height: 329 },
];

const CRITERIA = [
  "Donos e gestores que querem crescer com previsibilidade, não no improviso.",
  "Vontade de sair do operacional braçal e assumir a visão de dono do negócio.",
  "Disposição pra ajudar e ser ajudado dentro do grupo.",
  "Humildade nas trocas entre os membros.",
  "Ambição em aprender cada dia mais.",
  "Comprometimento com os encontros ao vivo e com a aplicação prática do conteúdo.",
  "Abertura pra expor números e desafios reais do negócio no grupo.",
];

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <Image src="/logo-over.png" alt="Over" width={28} height={22} className="invert" />
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
          <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
            Para donos e gestores de restaurante
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Pare de girar dinheiro. Aprenda a estruturar seu restaurante para escalar com
            previsibilidade.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Aulas gravadas, mentorias ao vivo com quem já fatura R$30mi+/ano, materiais práticos e
            uma comunidade de donos construindo o mesmo resultado que você.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              className="h-12 px-6 text-base"
              render={
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  {CTA_LABEL}
                </a>
              }
            />
          </div>
        </div>

        <div className="relative border-t border-white/10">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Sobre a Over</p>
        <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">
          Uma assessoria estratégica especializada em food service, agora em formato de mentoria.
        </h2>
        <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            A Over trabalha com donos e gestores de restaurante que querem estruturar e escalar o
            negócio, não só apagar incêndio, mas construir uma operação que funciona com
            previsibilidade.
          </p>
          <p>
            Na prática, isso significa gestão de pessoas, financeira e operacional: CRM,
            treinamento de equipe, desenvolvimento de metas, tráfego pago, conteúdo, controle de
            margem e lucratividade, tudo integrado, não serviços soltos. Incluindo o uso de IA para
            automatizar decisões de gestão no dia a dia do restaurante.
          </p>
          <p>
            O Hub Over nasce dessa mesma base: o mesmo método que a Over aplica na assessoria,
            agora em aulas, mentorias ao vivo e uma comunidade, pra você aplicar no seu ritmo.
          </p>
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">O que tem dentro do Hub</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Mentores</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Aprenda com quem faz, não com quem só ensina
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {MENTORS.map((mentor) => (
            <Card key={mentor.name}>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{mentor.name}</h3>
                  <p className="text-sm font-medium text-primary">{mentor.result}</p>
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {mentor.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {topic}
                    </li>
                  ))}
                </ul>
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
          <div className="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.file} className="mb-6 break-inside-avoid overflow-hidden rounded-xl ring-1 ring-foreground/10">
                <Image
                  src={`/depoimentos/${testimonial.file}`}
                  alt="Depoimento de aluno do Hub Over no WhatsApp"
                  width={testimonial.width}
                  height={testimonial.height}
                  className="h-auto w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-2xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Como entrar</h2>
        <p className="mt-3 text-muted-foreground">O Hub Over é pra quem se encaixa nisso:</p>
        <Card className="mt-6">
          <CardContent>
            <ul className="space-y-3 text-sm">
              {CRITERIA.map((criterion) => (
                <li key={criterion} className="flex items-start gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-primary" />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Button
          size="lg"
          className="mt-8 h-12 w-full text-base"
          nativeButton={false}
          render={
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              {CTA_LABEL}
            </a>
          }
        />
      </section>

      <footer className="border-t border-border bg-black py-10 text-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-center">
          <Image src="/logo-over.png" alt="Over" width={20} height={16} className="invert opacity-60" />
          <p className="text-xs">© {new Date().getFullYear()} Hub Over</p>
        </div>
      </footer>
    </div>
  );
}
