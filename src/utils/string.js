export const ensurePrefix = (str, prefix) => (str.startsWith(prefix) ? str : `${prefix}${str}`)
export const withoutSuffix = (str, suffix) => (str.endsWith(suffix) ? str.slice(0, -suffix.length) : str)
export const withoutPrefix = (str, prefix) => (str.startsWith(prefix) ? str.slice(prefix.length) : str)

/** Format duration in seconds for admin tables: "44 sec" when < 60, else "1 min 30 sec" */
export const formatDurationSeconds = (seconds) => {
  const s = Number(seconds) || 0
  if (s < 60) return `${s} sec`
  const mins = Math.floor(s / 60)
  const rem = s % 60
  return rem ? `${mins} min ${rem} sec` : `${mins} min`
}
