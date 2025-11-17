import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  getJuries,
  getPendingResults,
  getPrograms,
  getStudents,
  getTeams,
} from "@/lib/data";
import { approveResult, rejectResult } from "@/lib/result-service";

async function approveResultAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  await approveResult(id);
}

async function rejectResultAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  await rejectResult(id);
}

export default async function PendingResultsPage() {
  const [pending, programs, juries, students, teams] = await Promise.all([
    getPendingResults(),
    getPrograms(),
    getJuries(),
    getStudents(),
    getTeams(),
  ]);

  const programMap = new Map(programs.map((program) => [program.id, program]));
  const juryMap = new Map(juries.map((jury) => [jury.id, jury]));
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const teamMap = new Map(teams.map((team) => [team.id, team]));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Pending Results</h1>
      {pending.length === 0 && (
        <Card>
          <CardTitle>No pending entries</CardTitle>
          <CardDescription>
            Awaiting submissions from jury portal or admin form.
          </CardDescription>
        </Card>
      )}

      <div className="space-y-6">
        {pending.map((result) => (
          <Card key={result.id} className="bg-slate-900/70">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>{programMap.get(result.program_id)?.name}</CardTitle>
                <CardDescription>
                  Jury · {juryMap.get(result.jury_id)?.name ?? "—"}
                </CardDescription>
              </div>
              <div className="flex gap-3">
                <form action={approveResultAction}>
                  <input type="hidden" name="id" value={result.id} />
                  <Button type="submit" variant="secondary">
                    Approve
                  </Button>
                </form>
                <form action={rejectResultAction}>
                  <input type="hidden" name="id" value={result.id} />
                  <Button type="submit" variant="danger">
                    Reject
                  </Button>
                </form>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {result.entries.map((entry) => {
                const student = entry.student_id
                  ? studentMap.get(entry.student_id)
                  : undefined;
                const team = entry.team_id
                  ? teamMap.get(entry.team_id)
                  : student
                    ? teamMap.get(student.team_id)
                    : undefined;
                return (
                  <div
                    key={`${result.id}-${entry.position}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-sm uppercase text-white/60">
                      {entry.position === 1
                        ? "1st Place"
                        : entry.position === 2
                          ? "2nd Place"
                          : "3rd Place"}
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {student?.name ?? team?.name ?? "—"}
                    </p>
                    {student && (
                      <p className="text-xs text-white/60">
                        Chest #{student.chest_no}
                      </p>
                    )}
                    {team && (
                      <p className="text-xs text-white/50">{team.name}</p>
                    )}
                    <p className="mt-2 text-sm text-emerald-300">
                      Score: {entry.score}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

