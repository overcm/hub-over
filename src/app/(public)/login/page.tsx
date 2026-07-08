import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative flex flex-col justify-between overflow-hidden bg-black p-6 text-white sm:p-10 lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(199,40,37,0.35),_transparent_55%)]" />
        <div className="relative flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-sm font-semibold tracking-[0.25em] uppercase">
            Hub <span className="text-primary">Over</span>
          </span>
        </div>
        <div className="relative mt-4 max-w-md lg:mt-0">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
            Sua área de conhecimento, feita para acelerar resultados.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60 lg:mt-4">
            Aulas gravadas, mentorias, materiais e acompanhamento em um só lugar.
          </p>
        </div>
        <p className="relative mt-6 hidden text-xs text-white/40 lg:mt-0 lg:block">
          © {new Date().getFullYear()} Hub Over
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-8">
        <div className="w-full max-w-sm py-8">
          <h2 className="text-2xl font-semibold tracking-tight">Bem-vindo(a)</h2>
          <p className="mt-1 mb-8 text-sm text-muted-foreground">
            Entre com suas credenciais para acessar o conteúdo.
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
