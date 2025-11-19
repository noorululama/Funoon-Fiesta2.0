import Link from "next/link";
import { getCurrentJury } from "@/lib/auth";
import { getAssignments, getPrograms } from "@/lib/data";
import { JuryAssignmentsBoard } from "@/components/jury-assignments-board";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function JuryProgramsPage() {
  const jury = await getCurrentJury();
  const [assignments, programs] = await Promise.all([
    getAssignments(),
    getPrograms(),
  ]);
  const programMap = new Map(programs.map((program) => [program.id, program]));
  const myAssignments = assignments.filter(
    (assignment) => assignment.jury_id === jury?.id,
  );

  const enrichedAssignments = myAssignments
    .map((assignment) => {
      const program = programMap.get(assignment.program_id);
      if (!program) return null;
      return {
        id: `${assignment.program_id}-${assignment.jury_id}`,
        programId: assignment.program_id,
        programName: program.name,
        section: program.section,
        category: program.category,
        stage: program.stage,
        status: assignment.status,
      };
    })
    .filter(Boolean) as Array<{
      id: string;
      programId: string;
      programName: string;
      section: string;
      category: string;
      stage: boolean;
      status: (typeof myAssignments)[number]["status"];
    }>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/50">
          Jury workspace
        </p>
        <h1 className="text-3xl font-bold text-white">Assigned Programs</h1>
        <p className="text-sm text-white/70">
          Track everything assigned to you, filter by status, and jump into result forms without
          losing context.
        </p>
      </div>

      {enrichedAssignments.length === 0 ? (
        <Card>
          <CardTitle>No assignments yet</CardTitle>
          <CardDescription>
            Once admins assign events to you, they will appear here.
          </CardDescription>
        </Card>
      ) : (
        <JuryAssignmentsBoard assignments={enrichedAssignments} />
      )}
    </div>
  );
}

