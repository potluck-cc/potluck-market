export function slugify(str: string) {
  return str.toLowerCase().replace(/ /g, "_");
}
