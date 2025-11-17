import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  calculateScore,
  updateAssignmentStatus,
  updateLiveScore,
  updateStudentScore,
} from "./data";
import { connectDB } from "./db";
import {
  ApprovedResultModel,
  JuryModel,
  PendingResultModel,
  ProgramModel,
  StudentModel,
  TeamModel,
} from "./models";
import type { ResultRecord } from "./types";

type WinnerPayload = {
  position: 1 | 2 | 3;
  id: string;
  grade: "A" | "B" | "C" | "none";
};

function sanitizeGrade(grade: string | undefined): "A" | "B" | "C" | "none" {
  if (grade === "A" || grade === "B" || grade === "C" || grade === "none") {
    return grade;
  }
  return "none";
}

export async function submitResultToPending({
  programId,
  juryId,
  winners,
}: {
  programId: string;
  juryId: string;
  winners: WinnerPayload[];
}) {
  await connectDB();
  const [program, jury] = await Promise.all([
    ProgramModel.findOne({ id: programId }).lean(),
    JuryModel.findOne({ id: juryId }).lean(),
  ]);

  if (!program) throw new Error("Program not found");
  if (!jury) throw new Error("Jury not found");

  const alreadySubmitted =
    (await PendingResultModel.exists({ program_id: programId })) ||
    (await ApprovedResultModel.exists({ program_id: programId }));
  if (alreadySubmitted) {
    throw new Error("Result already exists for this program");
  }

  const entries = await Promise.all(
    winners.map(async (winner) => {
      if (program.section === "single") {
        const student = await StudentModel.findOne({ id: winner.id }).lean();
        if (!student) throw new Error("Invalid student selected");
        const grade = sanitizeGrade(winner.grade);
        return {
          position: winner.position,
          student_id: student.id,
          team_id: student.team_id,
          grade,
          score: calculateScore(
            program.section,
            program.category,
            winner.position,
            grade,
          ),
        };
      }
      const team = await TeamModel.findOne({ id: winner.id }).lean();
      if (!team) throw new Error("Invalid team selected");
      return {
        position: winner.position,
        team_id: team.id,
        grade: "none" as const,
        score: calculateScore(program.section, "none", winner.position, "none"),
      };
    }),
  );

  const record: ResultRecord = {
    id: randomUUID(),
    program_id: program.id,
    jury_id: jury.id,
    submitted_by: jury.name,
    submitted_at: new Date().toISOString(),
    entries,
    status: "pending",
  };

  await PendingResultModel.create(record);
  await updateAssignmentStatus(program.id, jury.id, "submitted");

  revalidatePath("/admin/pending-results");
  revalidatePath("/jury/programs");
}

export async function approveResult(resultId: string) {
  await connectDB();
  const record = await PendingResultModel.findOne({ id: resultId }).lean();
  if (!record) {
    throw new Error("Result not found");
  }

  await PendingResultModel.deleteOne({ id: resultId });
  const approvedRecord: ResultRecord = {
    ...record,
    status: "approved",
    submitted_at: new Date().toISOString(),
  };
  await ApprovedResultModel.create(approvedRecord);

  for (const entry of record.entries) {
    if (entry.student_id) {
      await updateStudentScore(entry.student_id, entry.score);
    }
    if (entry.team_id) {
      await updateLiveScore(entry.team_id, entry.score);
    }
  }

  await updateAssignmentStatus(record.program_id, record.jury_id, "completed");

  revalidatePath("/");
  revalidatePath("/scoreboard");
  revalidatePath("/results");
  revalidatePath("/admin/pending-results");
  revalidatePath("/admin/approved-results");
}

export async function rejectResult(resultId: string) {
  await connectDB();
  const record = await PendingResultModel.findOne({ id: resultId }).lean();
  if (!record) return;
  await PendingResultModel.deleteOne({ id: resultId });
  await updateAssignmentStatus(record.program_id, record.jury_id, "pending");

  revalidatePath("/admin/pending-results");
  revalidatePath("/jury/programs");
}

