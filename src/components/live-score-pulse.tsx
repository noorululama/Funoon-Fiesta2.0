"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Activity, Medal } from "lucide-react";
import type { Team } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface LiveScorePulseProps {
  teams: Team[];
  liveScores: Map<string, number>;
}

// Team color mappings
const TEAM_COLORS: Record<string, { primary: string; gradient: string; light: string }> = {
  SAMARQAND: {
    primary: "#D72638",
    gradient: "from-[#D72638] to-[#B01E2E]",
    light: "#FEE2E2",
  },
  NAHAVAND: {
    primary: "#1E3A8A",
    gradient: "from-[#1E3A8A] to-[#172554]",
    light: "#DBEAFE",
  },
  YAMAMA: {
    primary: "#7C3AED",
    gradient: "from-[#7C3AED] to-[#6D28D9]",
    light: "#EDE9FE",
  },
  QURTUBA: {
    primary: "#FACC15",
    gradient: "from-[#FACC15] to-[#EAB308]",
    light: "#FEF9C3",
  },
  MUQADDAS: {
    primary: "#059669",
    gradient: "from-[#059669] to-[#047857]",
    light: "#D1FAE5",
  },
  BUKHARA: {
    primary: "#FB923C",
    gradient: "from-[#FB923C] to-[#F97316]",
    light: "#FFEDD5",
  },
};

function getMedalColor(index: number): string {
  switch (index) {
    case 0:
      return "#FFD700";
    case 1:
      return "#C0C0C0";
    case 2:
      return "#CD7F32";
    default:
      return "transparent";
  }
}

interface TeamCardProps {
  team: Team & { totalPoints: number; colors: { primary: string; gradient: string; light: string } };
  index: number;
  maxPoints: number;
}

function TeamCard({ team, index, maxPoints }: TeamCardProps) {
  const percentage = maxPoints > 0 ? (team.totalPoints / maxPoints) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="relative group"
    >
      <div
        className={`bg-gradient-to-br ${team.colors.gradient} rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] transform-gpu p-[2px]`}
      >
        <div className="bg-slate-900/95 dark:bg-[#1a1a1a] rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg font-bold text-xl shadow-md"
                style={{ backgroundColor: team.colors.light }}
              >
                <span style={{ color: team.colors.primary }}>{team.name.charAt(0)}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-lg">{team.name}</h3>
                  {index < 3 && (
                    <Medal className="w-5 h-5" style={{ color: getMedalColor(index) }} />
                  )}
                </div>
                <p className="text-sm text-white/60">Rank #{index + 1}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-2xl text-white">
                {formatNumber(team.totalPoints)}
              </span>
              <p className="text-xs text-white/60">points</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-slate-800/50 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                className="h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ backgroundColor: team.colors.primary }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-white/50">
              <span>Progress</span>
              <span className="font-medium text-white/70">{percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface DistributionChartProps {
  teams: Array<Team & { totalPoints: number; colors: { primary: string } }>;
}

function DistributionChart({ teams }: DistributionChartProps) {
  const maxPoints = Math.max(...teams.map((team) => team.totalPoints), 1);

  return (
    <div className="p-8 rounded-xl  h-[400px] lg:h-auto flex flex-col">
      <h4 className="text-sm font-semibold text-white/80 mb-6">Points Distribution</h4>
      <div className="relative flex-1 min-h-[260px] flex items-end justify-between gap-2">
        {teams.map((team, index) => {
          const height = maxPoints > 0 ? (team.totalPoints / maxPoints) * 100 : 0;
          return (
            <motion.div
              key={team.id}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.6, delay: index * 0.1 + 0.4 }}
              className="relative flex-1 group"
            >
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-300 hover:opacity-100 hover:scale-105"
                style={{
                  backgroundColor: team.colors.primary,
                  opacity: 0.9,
                  height: "100%",
                }}
              >
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10 border border-white/10">
                  <div className="font-semibold">{team.name}</div>
                  <div className="text-white/80">{formatNumber(team.totalPoints)} pts</div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                </div>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                  <span className="text-xs font-bold text-white drop-shadow-lg">
                    {formatNumber(team.totalPoints)}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center w-full">
                <span className="text-xs font-semibold text-white/70 whitespace-nowrap">
                  {team.name.slice(0, 4)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function LiveScorePulse({ teams, liveScores }: LiveScorePulseProps) {
  const teamsWithScores = teams.map((team) => {
    const totalPoints = liveScores.get(team.id) ?? team.total_points;
    const colors = TEAM_COLORS[team.name] || {
      primary: "#6B7280",
      gradient: "from-gray-500 to-gray-600",
      light: "#F9FAFB",
    };
    return { ...team, totalPoints, colors };
  });

  const sortedTeams = [...teamsWithScores].sort((a, b) => b.totalPoints - a.totalPoints);
  const maxPoints = Math.max(...sortedTeams.map((t) => t.totalPoints), 1);

  return (
    <section className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2.5 rounded-lg">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Live Score Pulse</h2>
            <p className="text-sm text-white/60 mt-1">Real-time team rankings & performance</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedTeams.map((team, index) => (
              <TeamCard key={team.id} team={team} index={index} maxPoints={maxPoints} />
            ))}
          </div>
        </div>

        <DistributionChart teams={sortedTeams} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center items-center gap-4 pt-4"
      >
        <Link
          href="/scoreboard"
          className="bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:from-fuchsia-700 hover:to-rose-700 transition-all py-3 px-8 rounded-full text-lg font-semibold text-white shadow-lg hover:shadow-xl transform-gpu transition-all duration-300 hover:scale-105"
        >
          View Full Scoreboard
        </Link>
        <Link
          href="/results"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all py-3 px-8 rounded-full text-lg font-semibold text-white shadow-lg hover:shadow-xl transform-gpu transition-all duration-300 hover:scale-105"
        >
          View Results
        </Link>
      </motion.div>
    </section>
  );
}

