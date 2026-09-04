import { NextResponse } from "next/server";
import { PrismaClient, Role, TaskPriority, TaskStatus, ProjectStatus, ProjectPriority, HealthStatus, VerificationStatus, RiskSeverity, IssueStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

// One-time setup, triggered by visiting this URL in a browser instead of
// running a terminal command. Protected by SETUP_SECRET so a stranger can't
// hit it. Safe to visit more than once — everything is an upsert.
//
//   https://your-site.vercel.app/api/setup/seed?secret=YOUR_SETUP_SECRET

const DEFAULT_PASSWORD = "Welcome@123";

const HO_STAFF = [
  { name: "Siddhant Karahe", email: "Siddhant27karahe@gmail.com", phone: "7974591494" },
  { name: "Chirag Ghodke", email: "civilengineerchirag@gmail.com", phone: "9370515152" },
  { name: "Ratnadipsinh Zala", email: "ratnadipsinhht@gamil.com", phone: "8141105724" },
  { name: "Raghvendra Pandey", email: null, phone: null },
  { name: "Jigisha Tadvi", email: "jjeeggoo4998@gamil.com", phone: "8128942640" },
  { name: "Saurabh Chauhan", email: "saurabh.nitsichar12@gmail.com", phone: "6397521973" },
  { name: "Thakor Jayendra", email: "jay351028@gmail.com", phone: "9327201705" },
  { name: "Vishvesh A Solanki", email: "vishveshsolanki23800@gmail.com", phone: "9408418694" },
  { name: "Sunil Yadav", email: "sunilce0100@gmail.com", phone: "8009864229" },
  { name: "Krishna Rami", email: "krishnarami48@gmail.com", phone: "8156016311" },
  { name: "Narendra Thaner", email: null, phone: null },
];

const FIELD_STAFF = [
  { name: "Pawan Gond", email: null, phone: null },
  { name: "Amit Kumar", email: null, phone: null },
  { name: "Aman", email: null, phone: null },
  { name: "Aniruddha", email: null, phone: null },
];

function slugEmail(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, ".") + "@ap-pms.local"
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  if (!process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "SETUP_SECRET is not set in your environment variables." }, { status: 500 });
  }
  if (secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Wrong or missing secret." }, { status: 401 });
  }

  const prisma = new PrismaClient();

  try {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const dgm = await prisma.user.upsert({
      where: { email: "dgm@ap-pms.local" },
      update: {},
      create: {
        name: "DGM / Head Office",
        email: "dgm@ap-pms.local",
        passwordHash,
        role: Role.DGM,
        jobTitle: "Deputy General Manager",
        department: "Management",
      },
    });

    const staffUsers = [];
    for (const person of [...H
