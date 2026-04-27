export const INCIDENT_TYPES = [
  'contact',
  'sortie_piste',
  'panne_mecanique',
  'incendie',
  'debris',
  'autre',
] as const

export const INCIDENT_SEVERITIES = ['leger', 'moyen', 'grave', 'critique'] as const

export const INCIDENT_SECTORS = ['S1', 'S2', 'S3'] as const

export type IncidentType = (typeof INCIDENT_TYPES)[number]
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number]
export type IncidentSector = (typeof INCIDENT_SECTORS)[number]
