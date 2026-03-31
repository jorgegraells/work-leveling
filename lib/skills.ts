export const SKILL_THRESHOLDS = [0, 100, 250, 500, 900, 1500, 2400, 3800, 6000, 9500]

export function calcSkillLevel(points: number): number {
  let level = 1
  for (let i = 0; i < SKILL_THRESHOLDS.length; i++) {
    if (points >= SKILL_THRESHOLDS[i]) level = i + 1
    else break
  }
  return level
}

export function skillProgressPct(points: number): number {
  const level = calcSkillLevel(points)
  if (level >= 10) return 100
  const current = SKILL_THRESHOLDS[level - 1]
  const next = SKILL_THRESHOLDS[level]
  return Math.round(((points - current) / (next - current)) * 100)
}
