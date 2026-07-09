import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialsList } from "./MaterialsList";
import { NotesPanel } from "./NotesPanel";
import { CommentsThread } from "./CommentsThread";

interface LessonTabsProps {
  lessonId: string;
  description: string | null;
  materials: { id: string; title: string; fileUrl: string | null; content: string | null }[];
  currentUserId: string;
  isAdmin: boolean;
}

const triggerClassName = "w-full";

export function LessonTabs({
  lessonId,
  description,
  materials,
  currentUserId,
  isAdmin,
}: LessonTabsProps) {
  return (
    <Tabs defaultValue="descricao">
      <TabsList className="group-data-horizontal/tabs:h-auto grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
        <TabsTrigger value="descricao" className={triggerClassName}>
          Descrição
        </TabsTrigger>
        <TabsTrigger value="materiais" className={triggerClassName}>
          Materiais
        </TabsTrigger>
        <TabsTrigger value="anotacoes" className={triggerClassName}>
          Anotações
        </TabsTrigger>
        <TabsTrigger value="comentarios" className={triggerClassName}>
          Comentários
        </TabsTrigger>
      </TabsList>

      <TabsContent value="descricao">
        <p className="text-sm leading-relaxed">
          {description || "Sem descrição para esta aula."}
        </p>
      </TabsContent>
      <TabsContent value="materiais">
        <MaterialsList materials={materials} />
      </TabsContent>
      <TabsContent value="anotacoes">
        <NotesPanel lessonId={lessonId} />
      </TabsContent>
      <TabsContent value="comentarios">
        <CommentsThread lessonId={lessonId} currentUserId={currentUserId} isAdmin={isAdmin} />
      </TabsContent>
    </Tabs>
  );
}
