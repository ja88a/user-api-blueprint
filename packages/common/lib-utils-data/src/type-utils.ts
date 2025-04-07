export type StrictOmit<T, K extends keyof T> = Omit<T, K>

export const Omit = <T, K extends keyof T>(
  Class: new () => T,
  keys: K[],
): new () => StrictOmit<T, (typeof keys)[number]> => Class
