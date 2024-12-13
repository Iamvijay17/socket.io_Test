import { customAlphabet } from "nanoid";

export const generateId = (key) => {
  let prefix = key.toLowerCase() + "";
  const nanoid = customAlphabet("1234567890abcdef", 10);
  let id = prefix + "-" + nanoid().toLowerCase();
  return id;
};
