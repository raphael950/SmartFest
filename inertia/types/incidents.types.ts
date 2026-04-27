<<<<<<<< HEAD:inertia/types/incidents.types.ts
export type IncidentSeverity = 'leger' | 'moyen' | 'grave' | 'critique'

export type IncidentType = 'contact' | 'sortie_piste' | 'panne_mecanique' | 'incendie' | 'debris' | 'autre'

export type IncidentSector = 'S1' | 'S2' | 'S3'

export type Incident = {
  id: number
  type: IncidentType
  vehicles: string
  severity: IncidentSeverity
  sector: IncidentSector
  description: string
  createdAt: string
  updatedAt: string | null
}
========
export type { Incident, IncidentSector, IncidentSeverity, IncidentType } from './incidents.types'
>>>>>>>> feature/incidents:inertia/types/incidents.ts
