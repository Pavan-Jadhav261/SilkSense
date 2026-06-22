import { promises as fs } from "fs";
import path from "path";

export type StoredUser = {
  id: string;
  identifier: string;
  password: string;
  role: "farmer" | "buyer" | "expert";
  createdAt: string;
};

const usersFilePath = path.join(process.cwd(), "data", "users.json");

async function ensureFile() {
  await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
  try {
    await fs.access(usersFilePath);
  } catch {
    await fs.writeFile(usersFilePath, "[]", "utf8");
  }
}

export async function readUsers(): Promise<StoredUser[]> {
  await ensureFile();
  const raw = await fs.readFile(usersFilePath, "utf8");
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

export async function writeUsers(users: StoredUser[]) {
  await ensureFile();
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), "utf8");
}

export async function findUser(identifier: string) {
  const users = await readUsers();
  return users.find((user) => user.identifier.toLowerCase() === identifier.toLowerCase()) || null;
}

export async function addUser(input: Omit<StoredUser, "id" | "createdAt">) {
  const users = await readUsers();
  const user: StoredUser = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeUsers(users);
  return user;
}
