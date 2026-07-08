import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TranscriptView } from "./TranscriptView";
import { MaterialsList } from "./MaterialsList";
import { NotesPanel } from "./NotesPanel";
import { CommentsThread } from "./CommentsThread";

interface LessonTabsProps {
  lessonId: string;
  description: string | null;
  transcriptFileUrl: string | null;
  transcriptFileName: string | null;
  materials: { id: string; title: string; fileUrl: string }[];
}

const triggerClassName = "w-full";

export function LessonTabs({
  lessonId,
  description,
  transcriptFileUrl,
  transcriptFileName,
  materials,
}: LessonTabsProps) {
  return (
    <Tabs defaultValue="descricao">
      <TabsList className="group-data-horizontal/tabs:h-auto grid h-auto w-full grid-cols-3 gap-1 sm:grid-cols-5">
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
        <TabsTrigger value="transcricao" className={triggerClassName}>
          Transcrição
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
        <CommentsThread lessonId={lessonId} />
      </TabsContent>
      <TabsContent value="transcricao">
        <TranscriptView
          transcriptFileUrl={transcriptFileUrl}
          transcriptFileName={transcriptFileName}
        />
      </TabsContent>
    </Tabs>
  );
}
