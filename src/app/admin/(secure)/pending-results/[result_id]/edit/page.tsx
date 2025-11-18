import { redirect } from "next/navigation";
import { AddResultForm } from "@/components/forms/add-result-form";
import {
  getJuries,
  getPendingResultById,
  getPrograms,
  getStudents,
  getTeams,
} from "@/lib/data";
import type { GradeType } from "@/lib/types";
import { updatePendingResultEntries } from "@/lib/result-service";

interface EditPendingResultPageProps {
  params: Promise<{ result_id: string }>;
}

function buildInitialEntries(result: Awaited<ReturnType<typeof getPendingResultById>>) {
  const initial: Partial<
    Record<
      1 | 2 | 3,
      {
        winnerId: string;
        grade?: GradeType;
      }
    >
  > = {};
  result?.entries.forEach((entry) => {
    const winnerId = entry.student_id ?? entry.team_id ?? "";
    if (!winnerId) return;
    initial[entry.position as 1 | 2 | 3] = {
      winnerId,
      grade: entry.grade,
    };
  });
  return initial;
}

export default async function EditPendingResultPage({
  params,
}: EditPendingResultPageProps) {
  const { result_id } = await params;
  const result = await getPendingResultById(result_id);
  if (!result) {
    redirect("/admin/pending-results");
  }

  const [programs, students, teams, juries] = await Promise.all([
    getPrograms(),
    getStudents(),
    getTeams(),
    getJuries(),
  ]);
  const program = programs.find((item) => item.id === result.program_id);
  const jury = juries.find((item) => item.id === result.jury_id);
  if (!program || !jury) {
    redirect("/admin/pending-results");
  }

  const initial = buildInitialEntries(result);

  async function updatePendingAction(formData: FormData) {
    "use server";
    const winners = [1, 2, 3].map((position) => {
      const value = String(formData.get(`winner_${position}`) ?? "").trim();
      if (!value) {
        throw new Error("All placements are required.");
      }
      const grade = String(formData.get(`grade_${position}`) ?? "none") as GradeType;
      return {
        position: position as 1 | 2 | 3,
        id: value,
        grade,
      };
    });
    await updatePendingResultEntries(result_id, winners);
    redirect("/admin/pending-results");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">
        Edit Pending Result • {program.name}
      </h1>
      <AddResultForm
        programs={[program]}
        students={students}
        teams={teams}
        juries={[jury]}
        action={updatePendingAction}
        lockProgram
        initial={initial}
        submitLabel="Update Pending Result"
      />
    </div>
  );
}


