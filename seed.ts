import { PrismaClient, Role, TaskPriority, TaskStatus, ProjectStatus, ProjectPriority, HealthStatus, VerificationStatus, RiskSeverity, IssueStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Welcome@123";

// Real roster pulled from Team.xlsx (HO Staff + Field Staff).
// Users without a real email get a placeholder @ap-pms.local login —
// update these once real addresses are available.
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

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // --- DGM super-admin account -------------------------------------------
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

  // --- HO + Field staff -----------------------------------------------------
  const staffUsers = [];
  for (const person of [...HO_STAFF.map((p) => ({ ...p, department: "HO Staff" })), ...FIELD_STAFF.map((p) => ({ ...p, department: "Field Staff" }))]) {
    const email = person.email ?? slugEmail(person.name);
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: person.name,
        email,
        phone: person.phone ?? undefined,
        passwordHash,
        role: Role.TEAM_MEMBER,
        department: person.department,
        jobTitle: person.department === "Field Staff" ? "Field Engineer" : "Site/HO Engineer",
      },
    });
    staffUsers.push(user);
  }

  const [siddhant, chirag, ratnadipsinh, , jigisha, saurabh, jayendra, vishvesh, sunil, krishna] = staffUsers;

  // --- Sample projects --------------------------------------------------
  const today = new Date();
  const daysFromNow = (n: number) => new Date(today.getTime() + n * 86400000);

  const p1 = await prisma.project.upsert({
    where: { code: "AP-2026-014" },
    update: {},
    create: {
      code: "AP-2026-014",
      name: "Road Widening — NH-48 Package 3",
      client: "National Highways Authority",
      authorityDepartment: "NHAI",
      projectType: "Highway Construction",
      location: "Ahmedabad – Mehsana Stretch",
      projectManagerId: chirag.id,
      contractValue: 42_50_00_000,
      startDate: daysFromNow(-140),
      originalCompletionDate: daysFromNow(160),
      revisedCompletionDate: daysFromNow(190),
      status: ProjectStatus.CRITICAL,
      priority: ProjectPriority.CRITICAL,
      progressPercent: 46,
      healthStatus: HealthStatus.AT_RISK,
      healthScore: 58,
      members: {
        create: [
          { userId: chirag.id, roleOnProject: "Project Manager" },
          { userId: siddhant.id, roleOnProject: "Site Engineer" },
          { userId: sunil.id, roleOnProject: "Site Engineer" },
        ],
      },
    },
  });

  const p2 = await prisma.project.upsert({
    where: { code: "AP-2026-021" },
    update: {},
    create: {
      code: "AP-2026-021",
      name: "Water Supply Scheme — Kalol Taluka",
      client: "Gujarat Water Supply Board",
      authorityDepartment: "GWSSB",
      projectType: "Water Infrastructure",
      location: "Kalol, Gandhinagar",
      projectManagerId: jayendra.id,
      contractValue: 11_20_00_000,
      startDate: daysFromNow(-60),
      originalCompletionDate: daysFromNow(240),
      revisedCompletionDate: daysFromNow(240),
      status: ProjectStatus.ACTIVE,
      priority: ProjectPriority.HIGH,
      progressPercent: 22,
      healthStatus: HealthStatus.WATCH,
      healthScore: 74,
      members: {
        create: [
          { userId: jayendra.id, roleOnProject: "Project Manager" },
          { userId: jigisha.id, roleOnProject: "Site Engineer" },
          { userId: krishna.id, roleOnProject: "Site Engineer" },
        ],
      },
    },
  });

  const p3 = await prisma.project.upsert({
    where: { code: "AP-2025-098" },
    update: {},
    create: {
      code: "AP-2025-098",
      name: "Minor Bridge — Sabarmati Feeder Canal",
      client: "Roads & Buildings Department",
      authorityDepartment: "R&B",
      projectType: "Bridge Construction",
      location: "Sanand",
      projectManagerId: ratnadipsinh.id,
      contractValue: 6_80_00_000,
      startDate: daysFromNow(-320),
      originalCompletionDate: daysFromNow(-10),
      revisedCompletionDate: daysFromNow(25),
      status: ProjectStatus.DELAYED,
      priority: ProjectPriority.MEDIUM,
      progressPercent: 88,
      healthStatus: HealthStatus.AT_RISK,
      healthScore: 61,
      members: {
        create: [
          { userId: ratnadipsinh.id, roleOnProject: "Project Manager" },
          { userId: vishvesh.id, roleOnProject: "Site Engineer" },
        ],
      },
    },
  });

  // --- Sample tasks: mix of overdue / due today / critical / verified -----
  const taskSeed = [
    { code: "TSK-1001", title: "Submit revised BOQ for culvert realignment", project: p1, assignedTo: siddhant.id, priority: TaskPriority.CRITICAL, status: TaskStatus.IN_PROGRESS, due: daysFromNow(-2) },
    { code: "TSK-1002", title: "Client walkthrough — km 18 to km 22", project: p1, assignedTo: sunil.id, priority: TaskPriority.VERY_HIGH, status: TaskStatus.NOT_STARTED, due: daysFromNow(0) },
    { code: "TSK-1003", title: "Soil compaction test report", project: p1, assignedTo: siddhant.id, priority: TaskPriority.HIGH, status: TaskStatus.SUBMITTED, due: daysFromNow(-1), verification: VerificationStatus.PENDING_VERIFICATION },
    { code: "TSK-1004", title: "Update traffic diversion plan", project: p1, assignedTo: sunil.id, priority: TaskPriority.MEDIUM, status: TaskStatus.PLANNED, due: daysFromNow(5) },
    { code: "TSK-2001", title: "Pipe procurement — Phase 2", project: p2, assignedTo: jigisha.id, priority: TaskPriority.HIGH, status: TaskStatus.WAITING_CLIENT, due: daysFromNow(3) },
    { code: "TSK-2002", title: "Trenching permission — Kalol Municipality", project: p2, assignedTo: krishna.id, priority: TaskPriority.CRITICAL, status: TaskStatus.BLOCKED, due: daysFromNow(-4) },
    { code: "TSK-2003", title: "Weekly progress photographs", project: p2, assignedTo: jigisha.id, priority: TaskPriority.LOW, status: TaskStatus.COMPLETED, due: daysFromNow(-1), verification: VerificationStatus.VERIFIED },
    { code: "TSK-3001", title: "Final bridge deck inspection", project: p3, assignedTo: vishvesh.id, priority: TaskPriority.CRITICAL, status: TaskStatus.UNDER_REVIEW, due: daysFromNow(-6) },
    { code: "TSK-3002", title: "Handover documentation to R&B", project: p3, assignedTo: ratnadipsinh.id, priority: TaskPriority.VERY_HIGH, status: TaskStatus.NOT_STARTED, due: daysFromNow(1) },
  ];

  for (const t of taskSeed) {
    await prisma.task.upsert({
      where: { taskCode: t.code },
      update: {},
      create: {
        taskCode: t.code,
        title: t.title,
        projectId: t.project.id,
        assignedToId: t.assignedTo,
        createdById: dgm.id,
        dgmPriority: t.priority,
        teamPriority: t.priority,
        status: t.status,
        dueDate: t.due,
        startDate: daysFromNow(-14),
        verificationStatus: t.verification ?? VerificationStatus.NOT_SUBMITTED,
      },
    });
  }

  // --- Risks & issues ------------------------------------------------------
  await prisma.risk.createMany({
    data: [
      { projectId: p1.id, title: "Monsoon delay risk on earthwork", severity: RiskSeverity.HIGH, ownerId: chirag.id },
      { projectId: p3.id, title: "Approach road land dispute", severity: RiskSeverity.CRITICAL, ownerId: ratnadipsinh.id },
    ],
    skipDuplicates: true,
  });

  await prisma.issue.createMany({
    data: [{ projectId: p2.id, title: "Municipality permission pending 3 weeks", status: IssueStatus.OPEN, ownerId: jayendra.id }],
    skipDuplicates: true,
  });

  // --- Invoice cascading plan for Project 1 --------------------------------
  const year = today.getFullYear();
  const existingPlan = await prisma.invoiceThreeYearPlan.findFirst({ where: { projectId: p1.id } });
  if (!existingPlan) {
    const totalTarget = 12_00_00_000; // ₹12 Cr over 3 years
    const perYear = totalTarget / 3;
    const plan = await prisma.invoiceThreeYearPlan.create({
      data: { projectId: p1.id, startYear: year, totalTarget },
    });

    for (let y = 0; y < 3; y++) {
      const annual = await prisma.invoiceAnnualTarget.create({
        data: { planId: plan.id, year: year + y, targetAmount: perYear },
      });
      const perQuarter = Number(perYear) / 4;
      for (let q = 1; q <= 4; q++) {
        const quarterly = await prisma.invoiceQuarterlyTarget.create({
          data: { annualTargetId: annual.id, quarter: q, targetAmount: perQuarter },
        });
        const perMonth = perQuarter / 3;
        for (let m = 0; m < 3; m++) {
          const monthNum = (q - 1) * 3 + m + 1;
          await prisma.invoiceMonthlyTarget.create({
            data: { quarterlyTargetId: quarterly.id, month: monthNum, targetAmount: perMonth },
          });
        }
      }
    }

    // A little actual invoicing so the achievement % isn't zero
    await prisma.invoiceActual.createMany({
      data: [
        { projectId: p1.id, date: daysFromNow(-40), amount: 38_00_000, recordedById: chirag.id, description: "RA Bill 6" },
        { projectId: p1.id, date: daysFromNow(-10), amount: 41_50_000, recordedById: chirag.id, description: "RA Bill 7" },
      ],
    });
  }

  console.log("Seed complete.");
  console.log(`DGM login: dgm@ap-pms.local / ${DEFAULT_PASSWORD}`);
  console.log(`Team member login example: ${staffUsers[0].email} / ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
