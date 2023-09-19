export function safeSlice<T>(input: T, length: number) {
  // @ts-expect-error i know where im using it
  return input.length > length ? input.slice(0, length) : input;
}

export async function silently<T>(value: Promise<T>) {
  try {
    await value;
  } catch {}
}
