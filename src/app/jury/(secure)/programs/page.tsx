import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getCurrentJury } from "@/lib/auth";
import { getAssignments, getPrograms } from "@/lib/data";

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Assigned Programs</h1>
      {myAssignments.length === 0 && (
        <Card>
          <CardTitle>No assignments yet</CardTitle>
          <CardDescription>
            Once admins assign events to you, they will appear here.
          </CardDescription>
        </Card>
      )}
      <div className="space-y-4">
        {myAssignments.map((assignment) => {
          const program = programMap.get(assignment.program_id);
          const locked = assignment.status === "submitted" || assignment.status === "completed";
          return (
            <Card key={`${assignment.program_id}-${assignment.jury_id}`} className="bg-slate-900/70">
              <CardTitle>{program?.name}</CardTitle>
              <CardDescription className="mt-1">
                Section: {program?.section} · Category: {program?.category} · Status:{" "}
                <span className="font-semibold text-white">
                  {assignment.status}
                </span>
              </CardDescription>
              <div className="mt-4">
                {locked ? (
                  <Button variant="ghost" disabled>
                    Submitted
                  </Button>
                ) : (
                  <Link href={`/jury/add-result/${assignment.program_id}`}>
                    <Button variant="secondary">Open result form</Button>
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

