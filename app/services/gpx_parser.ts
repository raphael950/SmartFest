import { parseString } from 'xml2js'
import fs from 'node:fs/promises'

export interface GpxPoint {
  lat: number
  lon: number
  ele?: number
}

/**
 * Parse GPX file and extract track points
 */
export async function parseGpx(filePath: string): Promise<GpxPoint[]> {
  const content = await fs.readFile(filePath, 'utf-8')
  return new Promise<GpxPoint[]>((resolve, reject) => {
    parseString(content, (err, result) => {
      if (err) return reject(err)

      try {
        const points: GpxPoint[] = []

        // Handle track segments
        if (result.gpx?.trk?.[0]?.trkseg) {
          const segments = result.gpx.trk[0].trkseg
          segments.forEach((segment: any) => {
            segment.trkpt?.forEach((pt: any) => {
              points.push({
                lat: parseFloat(pt.$.lat),
                lon: parseFloat(pt.$.lon),
                ele: pt.ele ? parseFloat(pt.ele[0]) : undefined,
              })
            })
          })
        }

        // Handle route points as fallback
        if (result.gpx?.rte?.[0]?.rtept) {
          const routePoints = result.gpx.rte[0].rtept
          routePoints.forEach((pt: any) => {
            points.push({
              lat: parseFloat(pt.$.lat),
              lon: parseFloat(pt.$.lon),
              ele: pt.ele ? parseFloat(pt.ele[0]) : undefined,
            })
          })
        }

        resolve(points)
      } catch (error) {
        reject(error)
      }
    })
  })
}

/**
 * Convert GPS coordinates to SVG path coordinates
 * Normalize to viewBox coordinates
 */
export function gpxPointsToSvgPath(
  points: GpxPoint[],
  viewBoxWidth: number = 500,
  viewBoxHeight: number = 300
): string {
  if (points.length === 0) return ''

  // Calculate bounding box
  const lats = points.map((p) => p.lat)
  const lons = points.map((p) => p.lon)

  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLon = Math.min(...lons)
  const maxLon = Math.max(...lons)

  const latRange = maxLat - minLat || 1
  const lonRange = maxLon - minLon || 1

  const paddingX = viewBoxWidth * 0.06
  const paddingY = viewBoxHeight * 0.08
  const usableWidth = viewBoxWidth - paddingX * 2
  const usableHeight = viewBoxHeight - paddingY * 2

  const svgPoints = points.map((point) => {
    const x = paddingX + ((point.lon - minLon) / lonRange) * usableWidth
    const y = viewBoxHeight - paddingY - ((point.lat - minLat) / latRange) * usableHeight
    return { x, y }
  })

  // Create path data
  if (svgPoints.length === 0) return ''

  let pathData = `M ${svgPoints[0].x} ${svgPoints[0].y}`

  for (let i = 1; i < svgPoints.length; i++) {
    pathData += ` L ${svgPoints[i].x} ${svgPoints[i].y}`
  }

  return pathData
}
