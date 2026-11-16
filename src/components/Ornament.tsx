import { ACCENTS, CREAM } from '../theme'

/**
 * Қазақ ою-өрнегінің геометриялық жиектері (қошқар мүйіз, құс саңғы мотивтері).
 * Әр топ кездейсоқ бір нұсқаны алады — тақтаның «бет-әлпеті».
 */

function tileSVG(variant: number): string {
  const s = `stroke='${CREAM}' stroke-width='1.6' fill='none' stroke-linejoin='round'`
  switch (variant % 4) {
    case 0: // ромбтар тізбегі
      return `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='16' viewBox='0 0 56 16'>
        <path ${s} d='M2 8 L14 2 L26 8 L14 14 Z'/>
        <path ${s} d='M30 8 L38 4 L46 8 L38 12 Z'/>
        <circle cx='52' cy='8' r='1.8' fill='${CREAM}'/>
      </svg>`
    case 1: // қошқар мүйіз толқыны
      return `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='16' viewBox='0 0 56 16'>
        <path ${s} d='M2 13 C10 3 18 3 28 8 C38 13 46 13 54 5'/>
        <circle cx='28' cy='8' r='2' fill='${CREAM}'/>
      </svg>`
    case 2: // зигзаг — түлкі терісі
      return `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='16' viewBox='0 0 56 16'>
        <path ${s} d='M2 13 L10 3 L18 13 L26 3 L34 13 L42 3 L50 13'/>
        <circle cx='26' cy='8' r='1.6' fill='${CREAM}'/>
      </svg>`
    default: // сақиналар — құс саңғы
      return `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='16' viewBox='0 0 56 16'>
        <path ${s} d='M2 8 L16 1 L30 8 L16 15 Z'/>
        <path ${s} d='M26 8 L40 1 L54 8 L40 15 Z'/>
      </svg>`
  }
}

const cache = new Map<number, string>()

export function ornamentBG(variant: number): string {
  let uri = cache.get(variant)
  if (!uri) {
    uri = `url("data:image/svg+xml,${encodeURIComponent(tileSVG(variant))}")`
    cache.set(variant, uri)
  }
  return uri
}

/** Акцент жолағы: түсті таспа үстінде кірістірілген өрнек */
export function OrnamentBand({ accent, className = '' }: { accent: number; className?: string }) {
  const a = ACCENTS[accent % ACCENTS.length]
  return (
    <div
      className={`ornband ${className}`}
      style={{ backgroundColor: a.main, backgroundImage: ornamentBG(accent) }}
      aria-hidden="true"
    />
  )
}
