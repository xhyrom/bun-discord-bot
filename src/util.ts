export function safeSlice<T>(input: T[] | string, length: number) {
  return input.length > length ? input.slice(0, length) : input;
}

export async function silently<T>(value: Promise<T>) {
  try {
    await value;
  } catch {}
}
