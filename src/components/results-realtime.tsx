"use client";

import { ProgramsGrid } from "@/components/programs-grid";
import { useResultUpdates } from "@/hooks/use-realtime";
import { useRouter } from "next/navigation";
import type { Program, ResultRecord } from "@/lib/types";

interface ResultsRealtimeProps {
  programs: Program[];
  results: ResultRecord[];
  programMap: Map<string, Program>;
}

export function ResultsRealtime({
  programs: initialPrograms,
  results: initialResults,
  programMap: initialProgramMap,
}: ResultsRealtimeProps) {
  const router = useRouter();

  useResultUpdates(() => {
    router.refresh();
  });

  return (
    <ProgramsGrid
      programs={initialPrograms}
      results={initialResults}
      programMap={initialProgramMap}
    />
  );
}



