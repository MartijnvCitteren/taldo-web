/**
 * "Sanne de Vries" → "SV": first and last word, so Dutch prefixes ("de", "van") don't count.
 * Undefined for an empty name.
 */
export function toInitials(name: string | undefined): string | undefined {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return undefined;
  }
  const first = words[0];
  const last = words.length > 1 ? words[words.length - 1] : '';
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}
