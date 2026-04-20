export type IncidentSeverity = 'leger' | 'moyen' | 'grave' | 'critique'

export type IncidentType = 'contact' | 'sortie_piste' | 'panne_mecanique' | 'incendie' | 'debris' | 'autre'

export type Incident = {
  id: number
  type: string
  vehicles: string
  severity: string
  sector: string
  description: string
  createdAt: string
  updatedAt: string | null
}
