"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SearchSelect } from "@/components/ui/search-select";
import { Select } from "@/components/ui/select";
import type { GradeType, Jury, Program, Student, Team } from "@/lib/types";

interface AddResultFormProps {
  programs: Program[];
  students: Student[];
  teams: Team[];
  juries: Jury[];
  action: (formData: FormData) => Promise<void>;
  lockProgram?: boolean;
  initial?: Partial<
    Record<
      1 | 2 | 3,
      {
        winnerId: string;
        grade?: GradeType;
      }
    >
  >;
  submitLabel?: string;
}

const gradeOptions = [
  { value: "A", label: "Grade A (+5)" },
  { value: "B", label: "Grade B (+3)" },
  { value: "C", label: "Grade C (+1)" },
  { value: "none", label: "None" },
];

export function AddResultForm({
  programs,
  students,
  teams,
  juries,
  action,
  lockProgram = false,
  initial,
  submitLabel = "Submit for Approval",
}: AddResultFormProps) {
  const [programId, setProgramId] = useState(programs[0]?.id ?? "");
  const [showRules, setShowRules] = useState(false);
  const selectedProgram = useMemo(
    () => programs.find((program) => program.id === programId) ?? programs[0],
    [programId, programs],
  );

  const programOptions = useMemo(
    () =>
      programs.map((program) => ({
        value: program.id,
        label: program.name,
        meta: `${program.section} · Cat ${program.category}${
          program.stage ? " · On stage" : " · Off stage"
        }`,
      })),
    [programs],
  );

  const studentOptions = useMemo(
    () =>
      students.map((student) => ({
        value: student.id,
        label: student.name,
        meta: `Chest ${student.chest_no}`,
      })),
    [students],
  );

  const teamOptions = useMemo(
    () =>
      teams.map((team) => ({
        value: team.id,
        label: team.name,
        meta: team.leader ? `Leader · ${team.leader}` : undefined,
      })),
    [teams],
  );

  const isSingle = selectedProgram?.section === "single";
  const placementSelectOptions = isSingle ? studentOptions : teamOptions;

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="program_id" value={selectedProgram?.id} />
      <Card>
        <Badge tone="cyan">Step 1 · Program</Badge>
        <CardTitle className="mt-4">Select a program</CardTitle>
        <CardDescription className="mt-2">
          We auto-fill stage, section, and scoring rules.
        </CardDescription>
        <SearchSelect
          className="mt-6"
          name="program_selector"
          options={programOptions}
          value={programId}
          onValueChange={(next) => setProgramId(next)}
          disabled={lockProgram}
          placeholder="Search program..."
        />
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <p>Section: {selectedProgram?.section}</p>
          <p>Stage: {selectedProgram?.stage ? "On stage" : "Off stage"}</p>
          <p>Category: {selectedProgram?.category}</p>
        </div>
      </Card>

      <Card>
        <Badge tone="pink">Step 2 · Winners</Badge>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Add podium placements</CardTitle>
            <CardDescription className="mt-2">
              Select {isSingle ? "students" : "teams"} for 1st, 2nd and 3rd. Grades apply
              only to single events.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowRules(true)}
          >
            View scoring matrix
          </Button>
        </div>
        <div className="mt-6 grid gap-5">
          {[1, 2, 3].map((position) => (
            <div
              key={position}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-sm font-semibold text-white">
                {position === 1
                  ? "1st Place"
                  : position === 2
                    ? "2nd Place"
                    : "3rd Place"}
              </p>
              <SearchSelect
                className="mt-3"
                name={`winner_${position}`}
                required
                defaultValue={
                  initial?.[position]?.winnerId ??
                  placementSelectOptions[0]?.value
                }
                options={placementSelectOptions}
                placeholder={`Search ${isSingle ? "student" : "team"}...`}
              />
              {isSingle ? (
                <Select
                  className="mt-3"
                  name={`grade_${position}`}
                  defaultValue={initial?.[position]?.grade ?? "A"}
                >
                  {gradeOptions.map((grade) => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <input type="hidden" name={`grade_${position}`} value="none" />
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Badge tone="emerald">Step 3 · Submit</Badge>
        <CardTitle className="mt-4">Assign responsible jury</CardTitle>
        <CardDescription className="mt-2">
          Once you submit, the record lands in Pending Results for approval.
        </CardDescription>
        <Select
          className="mt-6"
          name="jury_id"
          required
          defaultValue={juries[0]?.id}
          disabled={lockProgram}
        >
          {juries.map((jury) => (
            <option key={jury.id} value={jury.id}>
              {jury.name}
            </option>
          ))}
        </Select>
        <Button type="submit" className="mt-4">
          {submitLabel}
        </Button>
      </Card>
      <Modal
        open={showRules}
        onClose={() => setShowRules(false)}
        title="Scoring Matrix"
        actions={
          <Button type="button" variant="secondary" onClick={() => setShowRules(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4 text-sm">
          <p>Single events (Category A/B/C) add grade bonus on top of podium points.</p>
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <p className="font-semibold">Single · Podium</p>
            <p>A: 10 / 7 / 5 · B: 7 / 5 / 3 · C: 5 / 3 / 1</p>
            <p className="font-semibold">Grade Bonus</p>
            <p>A +5 · B +3 · C +1</p>
          </div>
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <p className="font-semibold">Group</p>
            <p>1st 20 · 2nd 15 · 3rd 10</p>
            <p className="font-semibold">General</p>
            <p>1st 25 · 2nd 20 · 3rd 15</p>
          </div>
        </div>
      </Modal>
    </form>
  );
}

