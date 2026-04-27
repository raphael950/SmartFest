export type IncidentSeverity = 'leger' | 'moyen' | 'grave' | 'critique'

export type IncidentType = 'contact' | 'sortie_piste' | 'panne_mecanique' | 'incendie' | 'debris' | 'autre'

export type Team = {
  id: number
  name: string
  carModel: string
}

export type Incident = {
  id: number
  type: string
  vehicles: string | null
  severity: string
  sector: string
  description: string | null
  createdAt: string
  updatedAt: string | null
}
