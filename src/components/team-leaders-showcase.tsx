"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Users, Crown, Sparkles } from "lucide-react";
import type { Team } from "@/lib/types";

interface TeamLeadersShowcaseProps {
  teams: Team[];
}

// Team color mappings (matching live-score-pulse)
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

function parseLeaders(leaderString: string): string[] {
  // Handle multiple leaders separated by &, and, or comma
  return leaderString
    .split(/[&,]/)
    .map((name) => name.trim())
    .filter(Boolean);
}

export function TeamLeadersShowcase({ teams }: TeamLeadersShowcaseProps) {
  return (
    <section className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <Crown className="w-8 h-8 text-yellow-400" />
          <h2 className="text-4xl font-bold text-white">Team Leaders</h2>
          <Crown className="w-8 h-8 text-yellow-400" />
        </div>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          Meet the inspiring leaders guiding each team towards excellence in Islamic art and culture
        </p>
      </motion.div>

      <div className="relative overflow-hidden">
        {/* Infinite Slider Container */}
        <div className="flex gap-6 animate-scroll">
          {/* Duplicate slides for infinite effect */}
          {[...teams, ...teams].map((team, index) => {
            const leaders = parseLeaders(team.leader);
            const colors = TEAM_COLORS[team.name] || {
              primary: "#6B7280",
              gradient: "from-gray-500 to-gray-600",
              light: "#F9FAFB",
            };

            return (
              <motion.div
                key={`${team.id}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative flex-shrink-0 w-[350px] md:w-[400px]"
              >
                <div
                  className={`bg-gradient-to-br ${colors.gradient} rounded-2xl p-[2px] shadow-lg hover:shadow-2xl transition-all duration-300`}
                >
                  <div className="bg-slate-900/95 rounded-2xl p-6 backdrop-blur-sm h-full">
                    {/* Team Name Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-md"
                          style={{ backgroundColor: colors.light }}
                        >
                          <span style={{ color: colors.primary }}>
                            {team.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{team.name}</h3>
                          <p className="text-xs text-white/60">Team</p>
                        </div>
                      </div>
                      <Sparkles className="w-5 h-5 text-yellow-400/50 group-hover:text-yellow-400 transition-colors" />
                    </div>

                    {/* Leaders Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Users className="w-4 h-4" />
                        <span>
                          {leaders.length === 1 ? "Team Leader" : "Team Leaders"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {leaders.map((leader, leaderIndex) => (
                          <motion.div
                            key={leaderIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: leaderIndex * 0.1 }}
                            className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item"
                          >
                            <div
                              className="relative w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0 ring-2 ring-transparent group-hover/item:ring-yellow-400/50 transition-all"
                              style={{ borderColor: colors.primary }}
                            >
                              <Image
                                src={`${team.leader_photo}?auto=format&fit=facearea&facepad=2&w=120&h=120&seed=${leaderIndex}`}
                                alt={leader}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white truncate">{leader}</p>
                              <p className="text-xs text-white/60">
                                {leaders.length > 1 ? "Co-Leader" : "Team Leader"}
                              </p>
                            </div>
                            <Crown className="w-5 h-5 text-yellow-400/70 group-hover/item:text-yellow-400 flex-shrink-0 transition-colors" />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Team Description */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <p className="text-sm text-white/70 line-clamp-2">{team.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Gradient Overlays for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
}

