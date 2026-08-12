require("dotenv").config();
const sequelize = require("./config/database");
const Task = require("./models/Task");

const sampleTasks = [
  {
    title: "Set up project repo",
    description: "Initialize git, push skeleton commit",
    status: "Done",
  },
  {
    title: "Build backend API",
    description: "Express routes for CRUD + validation",
    status: "Done",
  },
  {
    title: "Build frontend UI",
    description: "React form and task list wired to the API",
    status: "In Progress",
  },
  {
    title: "Write README",
    description: "Setup steps, stack rationale, assumptions",
    status: "To Do",
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL");

    await sequelize.sync();
    await Task.destroy({ where: {}, truncate: true });
    await Task.bulkCreate(sampleTasks);

    console.log(`Seeded ${sampleTasks.length} tasks.`);
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
