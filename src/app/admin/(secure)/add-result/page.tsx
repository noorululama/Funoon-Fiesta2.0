import { redirect } from "next/navigation";
import { AddResultForm } from "@/components/forms/add-result-form";
import { getJuries, getPrograms, getStudents, getTeams } from "@/lib/data";
import { submitResultToPending } from "@/lib/result-service";

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

  await submitResultToPending({
    programId,
    juryId,
    winners,
  });

  redirect("/admin/pending-results");
}

export default async function AddResultPage() {
  const [programs, students, teams, juries] = await Promise.all([
    getPrograms(),
    getStudents(),
    getTeams(),
    getJuries(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Add result (3 steps)</h1>
      <AddResultForm
        programs={programs}
        students={students}
        teams={teams}
        juries={juries}
        action={submitResultAction}
      />
    </div>
  );
}

