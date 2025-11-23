"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Trophy, Award, AlertTriangle, CheckCircle2, Clock, User } from "lucide-react";
import type { ParticipantProfile } from "@/lib/participant-service";
import { QRCodeDisplay } from "./qr-code-display";

interface ParticipantProfileProps {
  profile: ParticipantProfile;
}

const COLORS = {
  first: "#FFD700",
  second: "#C0C0C0",
  third: "#CD7F32",
  gradeA: "#10B981",
  gradeB: "#3B82F6",
  gradeC: "#F59E0B",
};

const STATUS_COLORS = {
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  pending_result: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  registered: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  no_result: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const STATUS_ICONS = {
  completed: CheckCircle2,
  pending_result: Clock,
  registered: Clock,
  no_result: Clock,
};

export function ParticipantProfileDisplay({ profile }: ParticipantProfileProps) {
  const { student, team, registrations, totalPoints, stats } = profile;

  // Chart data for points breakdown
  const pointsChartData = useMemo(() => {
    const bySection = registrations.reduce(
      (acc, reg) => {
        const section = reg.program.section;
        if (!acc[section]) {
          acc[section] = { name: section, points: 0, count: 0 };
        }
        acc[section].points += reg.result?.score || 0;
        acc[section].count += 1;
        return acc;
      },
      {} as Record<string, { name: string; points: number; count: number }>,
    );

    return Object.values(bySection).map((item) => ({
      ...item,
      name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    }));
  }, [registrations]);

  // Chart data for wins
  const winsData = useMemo(
    () => [
      { name: "1st Place", value: stats.wins.first, color: COLORS.first },
      { name: "2nd Place", value: stats.wins.second, color: COLORS.second },
      { name: "3rd Place", value: stats.wins.third, color: COLORS.third },
    ],
    [stats.wins],
  );

  // Chart data for grades
  const gradesData = useMemo(
    () => [
      { name: "Grade A", value: stats.grades.A, color: COLORS.gradeA },
      { name: "Grade B", value: stats.grades.B, color: COLORS.gradeB },
      { name: "Grade C", value: stats.grades.C, color: COLORS.gradeC },
    ],
    [stats.grades],
  );

  // Chart data for program status
  const statusData = useMemo(
    () => [
      { name: "Completed", value: stats.completedPrograms, color: "#10B981" },
      { name: "Pending", value: stats.pendingPrograms, color: "#F59E0B" },
      { name: "Registered", value: stats.registeredPrograms, color: "#3B82F6" },
    ],
    [stats],
  );

  // Program performance over time (if we have timestamps)
  const performanceData = useMemo(() => {
    const withResults = registrations
      .filter((r) => r.result)
      .map((r) => ({
        program: r.program.name,
        points: r.result!.score,
        position: r.result!.position,
        date: r.timestamp,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return withResults;
  }, [registrations]);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="p-6 bg-gradient-to-r from-indigo-950/80 via-fuchsia-900/40 to-emerald-900/30 border-white/10 text-white">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <Avatar className="h-24 w-24 border-4 border-white/20">
            <AvatarImage src={student.avatar} alt={student.name} />
            <AvatarFallback className="text-2xl bg-white/10">
              {student.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">{student.name}</h1>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Chest: {student.chest_no}
              </Badge>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: team.color }}
                />
                <span className="text-lg">{team.name}</span>
              </div>
              <Separator orientation="vertical" className="h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="text-2xl font-bold">{totalPoints}</span>
                <span className="text-white/70">points</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Programs</p>
          </div>
          <p className="text-2xl font-bold">{stats.totalPrograms}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <p className="text-2xl font-bold text-green-500">{stats.completedPrograms}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-yellow-500" />
            <p className="text-sm text-muted-foreground">Wins</p>
          </div>
          <p className="text-2xl font-bold text-yellow-500">
            {stats.wins.first + stats.wins.second + stats.wins.third}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-muted-foreground">Penalties</p>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.totalPenalties}</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Points by Section */}
        <Card className="p-6">
          <CardTitle className="mb-4">Points by Section</CardTitle>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pointsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="points" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Wins Distribution */}
        <Card className="p-6">
          <CardTitle className="mb-4">Wins Distribution</CardTitle>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={winsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {winsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Grades Distribution */}
        <Card className="p-6">
          <CardTitle className="mb-4">Grades Distribution</CardTitle>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={gradesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {gradesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Program Status */}
        <Card className="p-6">
          <CardTitle className="mb-4">Program Status</CardTitle>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Performance Over Time */}
      {performanceData.length > 0 && (
        <Card className="p-6">
          <CardTitle className="mb-4">Performance Over Time</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="program" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="points" stroke="#3B82F6" name="Points" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* QR Code */}
      <QRCodeDisplay chestNumber={student.chest_no} participantName={student.name} />

      {/* Programs List */}
      <Card className="p-6">
        <CardTitle className="mb-4">All Programs</CardTitle>
        <div className="space-y-3">
          {registrations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No program registrations found
            </p>
          ) : (
            registrations.map((reg) => {
              const StatusIcon = STATUS_ICONS[reg.status];
              return (
                <Card key={reg.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{reg.program.name}</h3>
                        <Badge
                          variant="outline"
                          className={STATUS_COLORS[reg.status]}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {reg.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="secondary">
                          {reg.program.section}
                        </Badge>
                        {reg.program.category !== "none" && (
                          <Badge variant="outline">
                            Cat {reg.program.category}
                          </Badge>
                        )}
                      </div>
                      {reg.result && (
                        <div className="flex items-center gap-4 flex-wrap text-sm">
                          {reg.result.position && (
                            <div className="flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">
                                {reg.result.position === 1
                                  ? "1st"
                                  : reg.result.position === 2
                                    ? "2nd"
                                    : "3rd"}{" "}
                                Place
                              </span>
                            </div>
                          )}
                          {reg.result.grade && reg.result.grade !== "none" && (
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4 text-green-500" />
                              <span className="font-medium">Grade {reg.result.grade}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{reg.result.score} points</span>
                          </div>
                        </div>
                      )}
                      {reg.penalty && (
                        <div className="flex items-center gap-1 text-sm text-red-500">
                          <AlertTriangle className="h-4 w-4" />
                          <span>
                            Penalty: -{reg.penalty.points} points
                            {reg.penalty.reason && ` (${reg.penalty.reason})`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

