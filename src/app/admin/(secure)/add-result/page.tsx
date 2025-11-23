import { redirect } from "next/navigation";
import { AddResultForm } from "@/components/forms/add-result-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getApprovedResults, getJuries, getPrograms, getStudents, getTeams } from "@/lib/data";
import { getProgramRegistrations } from "@/lib/team-data";
import { ensureRegisteredCandidates } from "@/lib/registration-guard";
import { submitResultToPending } from "@/lib/result-service";

type PenaltyFormPayload = {
  id: string;
  type: "student" | "team";
  points: number;
};

function parsePenaltyPayloads(formData: FormData): PenaltyFormPayload[] {
  const rowValue = String(formData.get("penalty_rows") ?? "");
  const rowIds = rowValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return rowIds
    .map((rowId) => {
      const target = String(formData.get(`penalty_target_${rowId}`) ?? "").trim();
      const type = String(formData.get(`penalty_type_${rowId}`) ?? "").trim();
      const pointsRaw = String(formData.get(`penalty_points_${rowId}`) ?? "").trim();
      const points = pointsRaw ? Math.abs(Number(pointsRaw)) : 0;
      if (!target || points <= 0 || (type !== "student" && type !== "team") || Number.isNaN(points)) {
        return null;
      }
      return {
        id: target,
        type,
        points,
      } satisfies PenaltyFormPayload;
    })
    .filter((penalty): penalty is PenaltyFormPayload => Boolean(penalty));
}

async function submitResultAction(formData: FormData) {
  "use server";

  const programId = String(formData.get("program_id") ?? "");
  const juryId = String(formData.get("jury_id") ?? "");

  const winners = ([
    { key: "winner_1", gradeKey: "grade_1", position: 1 as const },
    { key: "winner_2", gradeKey: "grade_2", position: 2 as const },
    { key: "winner_3", gradeKey: "grade_3", position: 3 as const },
  ] as const).map(({ key, gradeKey, position }) => {
    const value = String(formData.get(key) ?? "");
    if (!value) throw new Error("All placements are required");
    return {
      position,
      id: value,
      grade: String(formData.get(gradeKey) ?? "none") as
        | "A"
        | "B"
        | "C"
        | "none",
    };
  });

  // Validate that all three positions have different candidates
  const winnerIds = winners.map(w => w.id);
  const uniqueWinnerIds = new Set(winnerIds);
  if (uniqueWinnerIds.size !== 3) {
    throw new Error("1st, 2nd, and 3rd place must have different candidates.");
  }

  const penalties = parsePenaltyPayloads(formData);

  await ensureRegisteredCandidates(programId, [
    ...winners.map((winner) => winner.id),
    ...penalties.map((penalty) => penalty.id),
  ]);

  try {
    await submitResultToPending({
      programId,
      juryId,
      winners,
      penalties,
    });
  } catch (error: any) {
    // Handle published program error
    if (error.message?.includes("Program already published") || error.message?.includes("already published")) {
      throw new Error("Program already published");
    }
    // Handle duplicate result submission error
    if (error.message?.includes("already exists") || error.message?.includes("already been approved")) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to submit result: ${error.message}`);
  }

  redirect("/admin/pending-results");
}

export default async function AddResultPage() {
  const [programs, students, teams, juries, registrations, approvedResults] = await Promise.all([
    getPrograms(),
    getStudents(),
    getTeams(),
    getJuries(),
    getProgramRegistrations(),
    getApprovedResults(),
  ]);

  // Filter out programs that are already approved/published
  const approvedProgramIds = new Set(approvedResults.map((result) => result.program_id));
  const availablePrograms = programs.filter((program) => !approvedProgramIds.has(program.id));

  if (availablePrograms.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Add result (3 steps)</h1>
        <Card className="border-amber-500/40 bg-amber-500/10 p-6">
          <CardTitle>No Programs Available</CardTitle>
          <CardDescription className="mt-2">
            All programs have been published. No results can be added at this time.
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Add result (3 steps)</h1>
      <AddResultForm
        programs={availablePrograms}
        students={students}
        teams={teams}
        juries={juries}
        registrations={registrations}
        approvedResults={approvedResults}
        action={submitResultAction}
      />
    </div>
  );
}

