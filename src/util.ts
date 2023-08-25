export function safeSlice<T>(array: T[], length: number) {
  return array.length > length ? array.slice(0, length) : array;
}

export async function silently<T>(value: Promise<T>) {
  try {
    await value;
  } catch {}
}
