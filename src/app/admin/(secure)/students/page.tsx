import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StudentManager } from "@/components/student-manager";
import {
  createStudent,
  deleteStudentById,
  getStudents,
  getTeams,
  updateStudentById,
} from "@/lib/data";

const studentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  team_id: z.string().min(2),
  chest_no: z.string().min(1),
});

const csvStudentSchema = z.object({
  name: z.string().min(2, "Student name is required"),
  team_id: z.string().min(2).optional(),
  team_name: z.string().min(2).optional(),
  chest_no: z.string().min(1, "Chest number is required"),
}).refine((data) => data.team_id || data.team_name, {
  message: "Either team_id or team_name is required",
  path: ["team_id"],
});

async function upsertStudent(formData: FormData, mode: "create" | "update") {
  const parsed = studentSchema.safeParse({
    id: String(formData.get("id") ?? "").trim() || undefined,
    name: String(formData.get("name") ?? "").trim(),
    team_id: String(formData.get("team_id") ?? "").trim(),
    chest_no: String(formData.get("chest_no") ?? "").trim(),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }
  const payload = parsed.data;

  if (mode === "create") {
    await createStudent({
      name: payload.name,
      team_id: payload.team_id,
      chest_no: payload.chest_no,
    });
  } else {
    if (!payload.id) throw new Error("Student ID missing");
    await updateStudentById(payload.id, {
      name: payload.name,
      team_id: payload.team_id,
      chest_no: payload.chest_no,
    });
  }

  revalidatePath("/admin/students");
}

async function deleteStudentAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  await deleteStudentById(id);
  revalidatePath("/admin/students");
}

async function bulkDeleteStudentsAction(formData: FormData) {
  "use server";
  const ids = String(formData.get("student_ids") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (ids.length === 0) {
    throw new Error("No students selected for deletion.");
  }
  for (const id of ids) {
    await deleteStudentById(id);
  }
  revalidatePath("/admin/students");
}

async function createStudentAction(formData: FormData) {
  "use server";
  await upsertStudent(formData, "create");
}

async function updateStudentAction(formData: FormData) {
  "use server";
  await upsertStudent(formData, "update");
}

function parseStudentCsv(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];
  const [headerLine, ...rows] = lines;
  const headers = headerLine
    .split(",")
    .map((header) => header.trim().toLowerCase());
  
  // Accept either team_id or team_name
  const hasTeamId = headers.includes("team_id");
  const hasTeamName = headers.includes("team_name");
  
  if (!hasTeamId && !hasTeamName) {
    throw new Error('Missing "team_id" or "team_name" column in CSV header.');
  }
  
  const requiredHeaders = ["name", "chest_no"];
  if (hasTeamId) requiredHeaders.push("team_id");
  if (hasTeamName) requiredHeaders.push("team_name");
  
  for (const column of requiredHeaders) {
    if (!headers.includes(column)) {
      throw new Error(`Missing "${column}" column in CSV header.`);
    }
  }
  const indexes = requiredHeaders.map((column) => headers.indexOf(column));
  return rows.map((row, index) => {
    const cells = row.split(",").map((cell) => cell.trim());
    if (cells.length < headers.length) {
      throw new Error(`Row ${index + 2} is incomplete.`);
    }
    const data = Object.fromEntries(
      requiredHeaders.map((column, idx) => [column, cells[indexes[idx]] ?? ""]),
    );
    return { row: index + 2, data };
  });
}

async function importStudentsAction(formData: FormData) {
  "use server";
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please upload a CSV file.");
  }
  const text = await file.text();
  const entries = parseStudentCsv(text);
  if (entries.length === 0) {
    throw new Error("CSV file does not contain any data rows.");
  }
  const teams = await getTeams();
  const teamIds = new Set(teams.map((team) => team.id));
  const teamNameToId = new Map(teams.map((team) => [team.name.toUpperCase(), team.id]));
  
  for (const entry of entries) {
    // Skip empty rows
    if (!entry.data.name || !entry.data.name.trim()) {
      continue;
    }
    
    const parsed = csvStudentSchema.safeParse(entry.data);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(", ");
      throw new Error(`Row ${entry.row}: ${message}`);
    }
    
    // Resolve team_id: check if provided value is a valid team_id, otherwise treat as team_name
    let resolvedTeamId = parsed.data.team_id;
    
    // If team_id is provided but not found in valid IDs, try treating it as a team name
    if (resolvedTeamId && !teamIds.has(resolvedTeamId)) {
      const teamNameUpper = resolvedTeamId.toUpperCase();
      const foundId = teamNameToId.get(teamNameUpper);
      if (foundId) {
        resolvedTeamId = foundId;
      }
    }
    
    // If still no team_id, try team_name field
    if (!resolvedTeamId && parsed.data.team_name) {
      const teamNameUpper = parsed.data.team_name.toUpperCase();
      resolvedTeamId = teamNameToId.get(teamNameUpper);
    }
    
    if (!resolvedTeamId) {
      const providedValue = parsed.data.team_id || parsed.data.team_name || "";
      throw new Error(
        `Row ${entry.row}: Team "${providedValue}" not found. Available teams: ${Array.from(teamNameToId.keys()).join(", ")}`
      );
    }
    
    await createStudent({
      name: parsed.data.name,
      team_id: resolvedTeamId,
      chest_no: parsed.data.chest_no,
    });
  }
  revalidatePath("/admin/students");
}

export default async function StudentsPage() {
  const [students, teams] = await Promise.all([
    getStudents(),
    getTeams(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-row gap-4 ">
      <Card className="flex-1">
        <CardTitle>Add Student</CardTitle>
        <CardDescription className="mt-2">
          Maintain a searchable roster for quick result entry.
        </CardDescription>
        <form
          action={createStudentAction}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <Input name="name" placeholder="Student name" required />
          <Input name="chest_no" placeholder="Chest number" required />
          <Select name="team_id" defaultValue={teams[0]?.id} required>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
          <Button type="submit" className="md:col-span-2">
            Save Student
          </Button>
        </form>
      </Card>
      <Card>
        <CardTitle>Bulk Import Students (CSV)</CardTitle>
        <CardDescription className="mt-2">
          Required columns: <code>name, chest_no</code> and either <code>team_id</code> or <code>team_name</code>
          <br />
          <span className="text-xs text-white/50">
            Team names: SAMARQAND, NAHAVAND, YAMAMA, QURTUBA, MUQADDAS, BUKHARA
          </span>
        </CardDescription>
        <form
          action={importStudentsAction}
          className="mt-6 flex flex-col gap-4 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <label className="text-sm font-semibold text-white/70">
              CSV File
            </label>
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
            />
          </div>
          <Button type="submit">Import CSV</Button>
        </form>
      </Card>
      </div>

      <StudentManager
        students={students}
        teams={teams}
        updateAction={updateStudentAction}
        deleteAction={deleteStudentAction}
        bulkDeleteAction={bulkDeleteStudentsAction}
      />
    </div>
  );
}

