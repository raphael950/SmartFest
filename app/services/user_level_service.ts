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

  getProgress(points: number): UserLevelProgress {
    const normalizedPoints = Math.max(0, points)
    const level = this.getLevelFromPoints(normalizedPoints)
    const currentIndex = LEVELS.findIndex((entry) => entry.key === level)
    const currentLevel = LEVELS[currentIndex]
    const nextLevel = LEVELS[currentIndex + 1] ?? null

    if (!nextLevel) {
      return {
        level,
        levelLabel: currentLevel.label,
        nextLevel: null,
        nextLevelLabel: null,
        currentLevelMinPoints: currentLevel.minPoints,
        nextLevelThreshold: null,
        progressPercent: 100,
        pointsToNextLevel: 0,
        isMaxLevel: true,
      }
    }

    const span = nextLevel.minPoints - currentLevel.minPoints
    const progressPercent = Math.max(
      0,
      Math.min(100, Math.round(((normalizedPoints - currentLevel.minPoints) / span) * 100))
    )

    return {
      level,
      levelLabel: currentLevel.label,
      nextLevel: nextLevel.key,
      nextLevelLabel: nextLevel.label,
      currentLevelMinPoints: currentLevel.minPoints,
      nextLevelThreshold: nextLevel.minPoints,
      progressPercent,
      pointsToNextLevel: Math.max(0, nextLevel.minPoints - normalizedPoints),
      isMaxLevel: false,
    }
  }
}

export default new UserLevelService()
