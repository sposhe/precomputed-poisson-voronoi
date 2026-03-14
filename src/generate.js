import fs from 'fs'
import Poisson from 'poisson-disc-sampler'
import { Delaunay } from 'd3-delaunay'

const dest = './dist'
const decimals = 3

const write = (title, data) => `export const ${title} = ${JSON.stringify(data)};\n`
const round = (arr) => arr.map(a => a.map(n => +n.toFixed(decimals)))

const dimensions = [
  [100, 100],
  [200, 200],
  [500, 500],
  [600, 400],
  [900, 600],
  [1000, 1000],
  [1440, 1440],
  [2000, 2000]
]

const scales = [
  10,
  20,
  30,
  40,
  50,
  60,
  70,
  80,
  100,
  120,
  140,
  160,
  180,
  200,
  250,
  300,
  350,
  400,
  450,
  500
]

for (const dimension of dimensions) {

  let file = ''
  const [w, h] = dimension
  const bounds = [0, 0, w, h]

  for (const scale of scales) {

    let points = []
    const sampler = Poisson(w, h, scale)
    let sample
    while ((sample = sampler())) {
      points.push([sample[0], sample[1]])
    }

    let verticies = []
    const delaunay = Delaunay.from(points)
    const voronoi = delaunay.voronoi(bounds)
    for (const cell of voronoi.cellPolygons()) {
      verticies.push(round(cell))
    }

    const edges = []
    for (const vertex of verticies) {
      edges.push(`M ${vertex.map(v => v.join(' ')).join(' L ')} Z`)
    }

    points = round(points)
    file += write(`points_${scale}`, points)
    file += write(`verticies_${scale}`, verticies)
    file += write(`edges_${scale}`, edges)

  }

  fs.writeFileSync(`${dest}/${w}x${h}.js`, file, 'utf8')

  process.stdout.write(`- ${w}x${h} complete\n`)

}

const index = dimensions.map(d => `export * from './dist/${d.join('x')}.js'`).join('\n')
fs.writeFileSync(`index.js`, index, 'utf8')
process.stdout.write(`- index complete\n`)

process.stdout.write(`Done! Processed ${scales.length} scales across ${dimensions.length} dimensions.\n`)