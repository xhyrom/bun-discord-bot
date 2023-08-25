export function safeSlice<T>(array: T[], length: number) {
  return array.length > length ? array.slice(0, length) : array;
}
