import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Clock, ChevronRight } from "lucide-react";

interface Generation {
  id: string;
  job_description: string;
  generated_resume: string | null;
  generated_cover_letter: string | null;
  created_at: string;
}

interface Props {
  onSelect: (gen: Generation) => void;
  refreshKey: number;
  onHasHistory?: (has: boolean) => void;
}

export function GenerationHistory({ onSelect, refreshKey, onHasHistory }: Props) {
  const [generations, setGenerations] = useState<Generation[]>([]);

  useEffect(() => {
    const fetchGenerations = async () => {
      const { data } = await supabase
        .from("generations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) {
        setGenerations(data);
        onHasHistory?.(data.length > 0);
      } else {
        onHasHistory?.(false);
      }
    };
    fetchGenerations();
  }, [refreshKey]);

  if (generations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        Recent Generations
      </h3>
      <div className="space-y-2">
        {generations.map((gen) => (
          <button
            key={gen.id}
            onClick={() => onSelect(gen)}
            className="w-full text-left bg-card rounded-lg p-4 shadow-sm hover:shadow-[var(--card-shadow)] transition-shadow flex items-center justify-between group"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {gen.job_description.slice(0, 80)}...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(gen.created_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
}
