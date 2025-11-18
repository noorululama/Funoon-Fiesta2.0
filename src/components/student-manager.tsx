"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, Pencil, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { Student, Team } from "@/lib/types";

interface StudentManagerProps {
  students: Student[];
  teams: Team[];
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  bulkDeleteAction: (formData: FormData) => Promise<void>;
}

type SortOption = "latest" | "az" | "chest";

const pageSizeOptions = [
  { label: "8 / page", value: 8 },
  { label: "15 / page", value: 15 },
  { label: "25 / page", value: 25 },
];

export function StudentManager({
  students,
  teams,
  updateAction,
  deleteAction,
  bulkDeleteAction,
}: StudentManagerProps) {
  const teamOptions = useMemo(
    () => [{ value: "", label: "All Teams" }, ...teams.map((team) => ({ value: team.id, label: team.name }))],
    [teams],
  );
  const teamMap = useMemo(() => new Map(teams.map((team) => [team.id, team.name])), [teams]);

  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [sort, setSort] = useState<SortOption>("latest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(pageSizeOptions[0].value);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, teamFilter, sort]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        student.name.toLowerCase().includes(query) || student.chest_no.toLowerCase().includes(query);
      const matchesTeam = teamFilter ? student.team_id === teamFilter : true;
      return matchesSearch && matchesTeam;
    });
  }, [students, searchQuery, teamFilter]);

  const sortedStudents = useMemo(() => {
    const list = [...filteredStudents];
    if (sort === "az") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "chest") {
      list.sort((a, b) => a.chest_no.localeCompare(b.chest_no));
    } else {
      list.sort((a, b) => b.id.localeCompare(a.id));
    }
    return list;
  }, [filteredStudents, sort]);

  useEffect(() => {
    const available = new Set(sortedStudents.map((student) => student.id));
    setSelected((prev) => {
      const filtered = new Set(Array.from(prev).filter((id) => available.has(id)));
      return filtered.size === prev.size ? prev : filtered;
    });
  }, [sortedStudents]);

  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / pageSize)) || 1;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startIndex = (page - 1) * pageSize;
  const visibleStudents = sortedStudents.slice(startIndex, startIndex + pageSize);
  const showingFrom = sortedStudents.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, sortedStudents.length);
  const hasSelection = selected.size > 0;
  const selectedIdsValue = Array.from(selected).join(",");
  const allSelected = sortedStudents.length > 0 && sortedStudents.every((student) => selected.has(student.id));

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(sortedStudents.map((student) => student.id)));
    } else {
      setSelected(new Set());
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const viewStudent = viewStudentId ? students.find((student) => student.id === viewStudentId) : null;

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(8,47,73,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50">Students roster</p>
          <h2 className="text-2xl font-semibold text-white">Manage participants</h2>
          <p className="text-sm text-white/60">Search, filter, edit, or bulk-delete student entries.</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="gap-2"
          disabled={!hasSelection}
          onClick={() => setShowDeleteModal(true)}
        >
          <Trash2 className="h-4 w-4" />
          Bulk delete ({selected.size})
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="md:col-span-2 flex items-center rounded-2xl border border-white/10 bg-white/5 px-4">
          <Search className="mr-2 h-4 w-4 text-white/50" />
          <Input
            type="text"
            placeholder="Search by name or chest number"
            className="border-none bg-transparent px-0"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <Select value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)}>
          {teamOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select value={String(pageSize)} onChange={(event) => setPageSize(Number(event.target.value))}>
          {pageSizeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-widest text-white/50">Quick sort</span>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Latest", value: "latest" },
            { label: "A-Z Name", value: "az" },
            { label: "Chest No.", value: "chest" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSort(option.value as SortOption)}
              className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                sort === option.value
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "border border-white/10 text-white/60 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-white/60">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          {sortedStudents.length} students
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-widest text-white/50">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(event) => toggleSelectAll(event.target.checked)}
              className="h-4 w-4 rounded border-white/30 bg-transparent text-emerald-400 focus:ring-fuchsia-400/40"
            />
            Select all
          </div>
          <span className="flex-1">Student</span>
          <span>Team</span>
          <span>Chest No.</span>
          <span>Actions</span>
        </div>

        {visibleStudents.map((student) => {
          const isSelected = selected.has(student.id);
          const isEditing = editingId === student.id;
          return (
            <div
              key={student.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-800/40 px-4 py-4 shadow-[0_15px_60px_rgba(15,23,42,0.45)] transition hover:border-fuchsia-400/40"
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectOne(student.id)}
                    className="h-4 w-4 rounded border-white/30 bg-transparent text-emerald-400 focus:ring-fuchsia-400/40"
                  />
                  <div>
                    <p className="text-sm text-white/40">#{student.id.slice(0, 8)}</p>
                    <p className="text-lg font-semibold text-white">{student.name}</p>
                  </div>
                </div>
                <div className="flex flex-1 flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-white/60">
                  <span className="rounded-full border border-white/15 px-3 py-1">
                    {teamMap.get(student.team_id) ?? "Unknown team"}
                  </span>
                  <span className="rounded-full border border-white/15 px-3 py-1">Chest #{student.chest_no}</span>
                </div>
                <div className="ml-auto flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={() => setViewStudentId(student.id)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2 border border-white/15 bg-white/5"
                    onClick={() => setEditingId((prev) => (prev === student.id ? null : student.id))}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <form action={deleteAction}>
                    <input type="hidden" name="id" value={student.id} />
                    <Button type="submit" variant="danger" size="sm" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
              {isEditing && (
                <form
                  action={updateAction}
                  className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white md:grid-cols-3"
                >
                  <input type="hidden" name="id" value={student.id} />
                  <Input name="name" defaultValue={student.name} placeholder="Student name" />
                  <Input name="chest_no" defaultValue={student.chest_no} placeholder="Chest number" />
                  <Select name="team_id" defaultValue={student.team_id}>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </Select>
                  <div className="flex items-center gap-3 md:col-span-3">
                    <Button type="submit" className="flex-1">
                      Save changes
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          );
        })}
        {visibleStudents.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-white/60">
            No students match your filters.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
        <p>
          Showing{" "}
          <span className="font-semibold text-white">
            {sortedStudents.length === 0 ? 0 : `${showingFrom}-${showingTo}`}
          </span>{" "}
          of <span className="font-semibold text-white">{sortedStudents.length}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="border border-white/10 bg-white/5"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <div className="rounded-xl border border-white/10 px-4 py-1 text-xs uppercase tracking-widest text-white/80">
            Page {page} of {totalPages}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="border border-white/10 bg-white/5"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages || sortedStudents.length === 0}
          >
            Next
          </Button>
        </div>
      </div>

      <Modal
        open={Boolean(viewStudent)}
        onClose={() => setViewStudentId(null)}
        title={viewStudent?.name ?? ""}
        actions={
          <Button variant="secondary" onClick={() => setViewStudentId(null)}>
            Close
          </Button>
        }
      >
        {viewStudent && (
          <div className="space-y-3 text-sm text-white/80">
            <p>
              <span className="text-white/50">Student ID:</span> {viewStudent.id}
            </p>
            <p>
              <span className="text-white/50">Team:</span> {teamMap.get(viewStudent.team_id) ?? "Unknown"}
            </p>
            <p>
              <span className="text-white/50">Chest number:</span> {viewStudent.chest_no}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm bulk delete"
        actions={
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
        }
      >
        <p className="text-sm text-white/70">
          You are deleting {selected.size} student{selected.size === 1 ? "" : "s"}. This cannot be undone.
        </p>
        <form action={bulkDeleteAction} className="space-y-4">
          <input type="hidden" name="student_ids" value={selectedIdsValue} />
          <Button type="submit" variant="danger" className="w-full" disabled={!hasSelection}>
            Delete {selected.size} student{selected.size === 1 ? "" : "s"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}


