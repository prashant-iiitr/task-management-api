const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

// Use a separate test DB
const TEST_DB = "mongodb://localhost:27017/taskmanagement_test";

let authToken;
let createdTaskId;

// ─── Setup & Teardown ─────────────────────────────────────────────────────────
beforeAll(async () => {
  await mongoose.connect(TEST_DB);
});

afterAll(async () => {
  // Clean up test data and disconnect
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("Auth API", () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  test("POST /api/auth/register - should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test("POST /api/auth/register - should fail with duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toBe(409);
  });

  test("POST /api/auth/register - should fail with invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...testUser, email: "not-an-email" });
    expect(res.statusCode).toBe(400);
  });

  test("POST /api/auth/login - should login and return token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token; // save token for task tests
  });

  test("POST /api/auth/login - should fail with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/auth/me - should return current user", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });
});

// ─── Task Tests ───────────────────────────────────────────────────────────────
describe("Tasks API", () => {
  const authHeader = () => ({ Authorization: `Bearer ${authToken}` });

  // CREATE
  test("POST /api/tasks - should create a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set(authHeader())
      .send({ title: "Test Task", description: "A test task", priority: "high" });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe("Test Task");
    createdTaskId = res.body.data.id;
  });

  test("POST /api/tasks - should fail without title", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set(authHeader())
      .send({ description: "No title here" });
    expect(res.statusCode).toBe(400);
  });

  test("POST /api/tasks - should fail with invalid status", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set(authHeader())
      .send({ title: "Bad Status Task", status: "invalid-status" });
    expect(res.statusCode).toBe(400);
  });

  test("POST /api/tasks - should fail without auth token", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Unauthorized Task" });
    expect(res.statusCode).toBe(401);
  });

  // GET ALL
  test("GET /api/tasks - should return list of tasks", async () => {
    const res = await request(app).get("/api/tasks").set(authHeader());
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  test("GET /api/tasks?status=pending - should filter by status", async () => {
    const res = await request(app)
      .get("/api/tasks?status=pending")
      .set(authHeader());
    expect(res.statusCode).toBe(200);
    res.body.data.forEach((task) => expect(task.status).toBe("pending"));
  });

  test("GET /api/tasks?priority=high - should filter by priority", async () => {
    const res = await request(app)
      .get("/api/tasks?priority=high")
      .set(authHeader());
    expect(res.statusCode).toBe(200);
    res.body.data.forEach((task) => expect(task.priority).toBe("high"));
  });

  test("GET /api/tasks?page=1&limit=5 - should paginate", async () => {
    const res = await request(app)
      .get("/api/tasks?page=1&limit=5")
      .set(authHeader());
    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.limit).toBe(5);
    expect(res.body.pagination.page).toBe(1);
  });

  test("GET /api/tasks?status=invalid - should return 400", async () => {
    const res = await request(app)
      .get("/api/tasks?status=invalid")
      .set(authHeader());
    expect(res.statusCode).toBe(400);
  });

  // GET BY ID
  test("GET /api/tasks/:id - should return a task by ID", async () => {
    const res = await request(app)
      .get(`/api/tasks/${createdTaskId}`)
      .set(authHeader());
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(createdTaskId);
  });

  test("GET /api/tasks/:id - should return 404 for invalid ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/tasks/${fakeId}`)
      .set(authHeader());
    expect(res.statusCode).toBe(404);
  });

  test("GET /api/tasks/:id - should return 400 for malformed ID", async () => {
    const res = await request(app)
      .get("/api/tasks/not-a-valid-id")
      .set(authHeader());
    expect(res.statusCode).toBe(400);
  });

  // UPDATE
  test("PUT /api/tasks/:id - should update a task", async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set(authHeader())
      .send({ status: "in-progress", priority: "low" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("in-progress");
    expect(res.body.data.priority).toBe("low");
  });

  test("PUT /api/tasks/:id - should fail with invalid status", async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set(authHeader())
      .send({ status: "done" });
    expect(res.statusCode).toBe(400);
  });

  // DELETE
  test("DELETE /api/tasks/:id - should delete a task", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set(authHeader());
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /api/tasks/:id - should return 404 after deletion", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set(authHeader());
    expect(res.statusCode).toBe(404);
  });
});
