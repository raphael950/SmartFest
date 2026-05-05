import type { UserRole } from '#models/user_role'

export type UserLevel = 'debutant' | 'intermediaire' | 'avance' | 'expert'

type LevelDefinition = {
  key: UserLevel
  label: string
  minPoints: number
}

export type UserLevelProgress = {
  level: UserLevel
  levelLabel: string
  nextLevel: UserLevel | null
  nextLevelLabel: string | null
  currentLevelMinPoints: number
  nextLevelThreshold: number | null
  progressPercent: number
  pointsToNextLevel: number
  isMaxLevel: boolean
}

const LEVELS: LevelDefinition[] = [
  { key: 'debutant', label: 'Debutant', minPoints: 0 },
  { key: 'intermediaire', label: 'Intermediaire', minPoints: 50 },
  { key: 'avance', label: 'Avance', minPoints: 150 },
  { key: 'expert', label: 'Expert', minPoints: 300 },
]

const LEVEL_ROLES: Record<UserLevel, UserRole> = {
  debutant: 'simple',
  intermediaire: 'simple',
  avance: 'complexe',
  expert: 'admin',
}

const ROLE_LEVELS: Record<UserRole, UserLevel> = {
  simple: 'debutant',
  complexe: 'avance',
  admin: 'expert',
}

class UserLevelService {
  getLevelFromPoints(points: number): UserLevel {
    const normalizedPoints = Math.max(0, points)

    for (let index = LEVELS.length - 1; index >= 0; index--) {
      const level = LEVELS[index]
      if (normalizedPoints >= level.minPoints) {
        return level.key
      }
    }

    return 'debutant'
  }

  getNextLevel(level: UserLevel): UserLevel | null {
    const currentIndex = LEVELS.findIndex((entry) => entry.key === level)

    return LEVELS[currentIndex + 1]?.key ?? null
  }

  getRoleForLevel(level: UserLevel): UserRole {
    return LEVEL_ROLES[level]
  }

  getLevelAndPointsForRole(role: UserRole): { level: UserLevel; minPoints: number } {
    const level = ROLE_LEVELS[role]
    const levelDef = LEVELS.find((l) => l.key === level)

    return {
      level,
      minPoints: levelDef?.minPoints ?? 0,
    }
  }

  getProgress(points: number, activeLevel?: UserLevel): UserLevelProgress {
    const normalizedPoints = Math.max(0, points)
    const level = activeLevel ?? this.getLevelFromPoints(normalizedPoints)
    const currentIndex = LEVELS.findIndex((entry) => entry.key === level)
    const currentLevelDefinition = LEVELS[currentIndex]
    const nextLevel = this.getNextLevel(level)

    if (!nextLevel) {
      return {
        level,
        levelLabel: currentLevelDefinition.label,
        nextLevel: null,
        nextLevelLabel: null,
        currentLevelMinPoints: currentLevelDefinition.minPoints,
        nextLevelThreshold: null,
        progressPercent: 100,
        pointsToNextLevel: 0,
        isMaxLevel: true,
      }
    }

    const nextLevelDefinition = LEVELS.find((entry) => entry.key === nextLevel)

    if (!nextLevelDefinition) {
      return {
        level,
        levelLabel: currentLevelDefinition.label,
        nextLevel: null,
        nextLevelLabel: null,
        currentLevelMinPoints: currentLevelDefinition.minPoints,
        nextLevelThreshold: null,
        progressPercent: 100,
        pointsToNextLevel: 0,
        isMaxLevel: true,
      }
    }

    const span = nextLevelDefinition.minPoints - currentLevelDefinition.minPoints
    const progressPercent = Math.max(
      0,
      Math.min(100, Math.round(((normalizedPoints - currentLevelDefinition.minPoints) / span) * 100))
    )

    return {
      level,
      levelLabel: currentLevelDefinition.label,
      nextLevel,
      nextLevelLabel: nextLevelDefinition.label,
      currentLevelMinPoints: currentLevelDefinition.minPoints,
      nextLevelThreshold: nextLevelDefinition.minPoints,
      progressPercent,
      pointsToNextLevel: Math.max(0, nextLevelDefinition.minPoints - normalizedPoints),
      isMaxLevel: false,
    }
  }
}

export default new UserLevelService()
