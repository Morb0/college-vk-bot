export const createMention = (id: number, firstName: string): string => {
  return `@id${id} (${firstName})`;
};
