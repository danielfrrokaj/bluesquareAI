// Sets a new password for a user who can't sign in:  npm run reset-password -- <username>   (default: admin)
// The password is typed at a hidden prompt. With the local database (no DATABASE_URL), stop `npm run dev` first:
// only one process may open ./data/pglite at a time.
import { connect } from "node:net";
import { createInterface } from "node:readline";
import { query } from "../src/lib/db";
import { setPassword } from "../src/lib/users";

const port = Number(process.env.PORT || 4400);
const serverRunning = () =>
  new Promise<boolean>((resolve) => {
    const socket = connect(port, "127.0.0.1", () => { socket.destroy(); resolve(true); });
    socket.on("error", () => resolve(false));
  });

// One reader for both answers, buffered, so a fast second line isn't lost. Nothing typed is echoed.
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: !!process.stdin.isTTY });
(rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = () => {};
const lines = rl[Symbol.asyncIterator]();
async function ask(question: string): Promise<string> {
  process.stdout.write(question);
  const { value } = await lines.next();
  process.stdout.write("\n");
  return value ?? "";
}

async function main() {
  const username = (process.argv[2] ?? "admin").trim().toLowerCase();
  if (!process.env.DATABASE_URL && (await serverRunning())) {
    throw new Error(`Something is running on port ${port}. Stop the dev server first: it holds the local database open.`);
  }
  const [user] = await query<{ id: string; name: string; active: boolean }>("select id, name, active from users where username = $1", [username]);
  if (!user) {
    const names = await query<{ username: string }>("select username from users order by username");
    throw new Error(`No user "${username}". Usernames: ${names.map((n) => n.username).join(", ")}`);
  }
  const password = await ask(`New password for ${username} (${user.name}): `);
  if (password.length < 10 || password.length > 200) throw new Error("The password needs at least 10 characters.");
  if ((await ask("Repeat it: ")) !== password) throw new Error("The two passwords don't match.");
  await setPassword(user.id, password);
  if (!user.active) await query("update users set active = true where id = $1", [user.id]);
  console.log(`Done. Sign in as "${username}" with the new password${user.active ? "" : " (the account was inactive and is active again)"}.`);
}

main().then(() => { rl.close(); process.exit(0); }, (error: Error) => { rl.close(); console.error(error.message); process.exit(1); });
