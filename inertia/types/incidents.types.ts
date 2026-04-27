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
