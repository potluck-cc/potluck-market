export function stackHistory(
  history,
  currentLocation: string,
  path: string,
  state: {}
) {
  history.push(`${currentLocation}${path}`, [state]);
}
