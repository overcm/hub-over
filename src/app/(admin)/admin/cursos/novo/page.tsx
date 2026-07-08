import { createCourse } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackLink } from "@/components/layout/BackLink";

export default function NewCoursePage() {
  return (
    <div className="max-w-lg space-y-4">
      <BackLink href="/admin/cursos" label="Voltar para conteúdos" />
      <Card>
        <CardHeader>
          <CardTitle>Novo conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCourse} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" rows={4} />
            </div>
            <Button type="submit">Criar conteúdo</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
