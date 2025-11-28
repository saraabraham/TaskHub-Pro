import { ApolloServer } from "@apollo/server";
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from "@as-integrations/aws-lambda";

// =====================
// GRAPHQL SCHEMA
// =====================
const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    avatar: String
    role: String!
    department: Department
    tasksAssigned: Int!
    tasksCompleted: Int!
    skills: [String!]!
    isActive: Boolean!
  }

  type Department {
    id: ID!
    name: String!
    description: String
    members: [User!]!
  }

  type Project {
    id: ID!
    name: String!
    description: String!
    status: String!
    priority: String!
    progress: Float!
    budget: Float
    actualCost: Float
    owner: User!
    team: [User!]!
    tags: [String!]!
  }

  type Task {
    id: ID!
    title: String!
    description: String!
    status: String!
    priority: String!
    assignee: User!
    reporter: User!
    project: Project
    dueDate: String!
    estimatedHours: Float
    actualHours: Float
    tags: [String!]!
    comments: [Comment!]!
    timeEntries: [TimeEntry!]!
    watchers: [User!]!
    createdAt: String!
    updatedAt: String
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    createdAt: String!
    isEdited: Boolean!
  }

  type TimeEntry {
    id: ID!
    hours: Float!
    description: String
    date: String!
    user: User!
  }

  type TaskConnection {
    tasks: [Task!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type TaskStatistics {
    total: Int!
    backlog: Int!
    todo: Int!
    inProgress: Int!
    inReview: Int!
    blocked: Int!
    completed: Int!
    cancelled: Int!
    highPriority: Int!
    overdue: Int!
    completedThisWeek: Int!
    completedThisMonth: Int!
    averageCompletionTime: Float!
  }

  input TaskInput {
    title: String!
    description: String!
    status: String!
    priority: String!
    assigneeId: ID!
    reporterId: ID!
    projectId: ID
    dueDate: String!
    estimatedHours: Float
    tags: [String!]
    watcherIds: [ID!]
  }

  input TaskUpdateInput {
    title: String
    description: String
    status: String
    priority: String
    assigneeId: ID
    projectId: ID
    dueDate: String
    estimatedHours: Float
    actualHours: Float
    tags: [String!]
  }

  input CommentInput {
    content: String!
    taskId: ID!
  }

  input TimeEntryInput {
    taskId: ID!
    hours: Float!
    description: String
    date: String!
    billable: Boolean!
  }

  type Query {
    tasks(status: String, priority: String, assigneeId: ID, projectId: ID, search: String, limit: Int, offset: Int): TaskConnection!
    task(id: ID!): Task
    projects(status: String): [Project!]!
    project(id: ID!): Project
    users: [User!]!
    user(id: ID!): User
    departments: [Department!]!
    taskStatistics: TaskStatistics!
  }

  type Mutation {
    createTask(input: TaskInput!): Task!
    updateTask(id: ID!, input: TaskUpdateInput!): Task!
    deleteTask(id: ID!): Boolean!
    createComment(input: CommentInput!): Comment!
    logTime(input: TimeEntryInput!): TimeEntry!
  }
`;

// =====================
// SAMPLE DATA
// =====================

const data = {
  users: [
    { id: "1", name: "Sarah Chen", email: "sarah@company.com", avatar: "💻", role: "Senior Developer", departmentId: "1", tasksAssigned: 0, tasksCompleted: 45, skills: ["React", "GraphQL"], isActive: true },
    { id: "2", name: "Mike Johnson", email: "mike@company.com", avatar: "👨‍💼", role: "Tech Lead", departmentId: "1", tasksAssigned: 0, tasksCompleted: 67, skills: ["Node.js", "AWS"], isActive: true },
    { id: "3", name: "Emma Davis", email: "emma@company.com", avatar: "👩‍🔬", role: "QA Engineer", departmentId: "2", tasksAssigned: 0, tasksCompleted: 89, skills: ["Jest"], isActive: true },
    { id: "4", name: "Alex Wong", email: "alex@company.com", avatar: "🔒", role: "Security Specialist", departmentId: "1", tasksAssigned: 0, tasksCompleted: 34, skills: ["Security"], isActive: true },
  ],

  departments: [
    { id: "1", name: "Engineering", description: "Product development" },
    { id: "2", name: "Quality Assurance", description: "Testing" },
  ],

  projects: [
    { id: "1", name: "E-Commerce Platform", description: "Platform redesign", status: "ACTIVE", priority: "HIGHEST", progress: 35, budget: 150000, actualCost: 45000, ownerId: "2", departmentId: "1", teamIds: ["1", "2", "3"], tags: ["frontend", "backend"] },
    { id: "2", name: "Mobile App", description: "iOS and Android", status: "PLANNING", priority: "HIGH", progress: 10, budget: 200000, actualCost: 0, ownerId: "1", departmentId: "1", teamIds: ["1", "2"], tags: ["mobile"] },
  ],

  tasks: [
    { id: "1", title: "Design landing page", description: "Create responsive design", status: "IN_PROGRESS", priority: "HIGH", assigneeId: "1", reporterId: "2", projectId: "1", dueDate: "2025-12-05", estimatedHours: 16, actualHours: 8, createdAt: "2025-11-20", updatedAt: "2025-11-27", tags: ["design"], watcherIds: ["2"] },
    { id: "2", title: "GraphQL API", description: "Setup Apollo", status: "COMPLETED", priority: "HIGHEST", assigneeId: "2", reporterId: "2", projectId: "1", dueDate: "2025-11-28", estimatedHours: 20, actualHours: 18, createdAt: "2025-11-15", updatedAt: "2025-11-26", tags: ["backend"], watcherIds: ["1"] },
  ],

  comments: [
    { id: "1", content: "Looking good!", authorId: "2", taskId: "1", createdAt: "2025-11-21", isEdited: false },
    { id: "2", content: "Great work!", authorId: "1", taskId: "2", createdAt: "2025-11-26", isEdited: false },
  ],

  timeEntries: [
    { id: "1", userId: "1", taskId: "1", hours: 4, description: "Design work", date: "2025-11-25", billable: true },
    { id: "2", userId: "1", taskId: "1", hours: 4, description: "Implementation", date: "2025-11-26", billable: true },
  ],
};

// =====================
// RESOLVERS
// =====================

const resolvers = {
  Query: {
    tasks: (_, args) => {
      let filtered = [...data.tasks];
      if (args.status) filtered = filtered.filter(t => t.status === args.status);
      if (args.priority) filtered = filtered.filter(t => t.priority === args.priority);
      if (args.search) filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(args.search.toLowerCase())
      );
      return { tasks: filtered, totalCount: filtered.length, hasMore: false };
    },
    task: (_, { id }) => data.tasks.find(t => t.id === id),
    projects: () => data.projects,
    project: (_, { id }) => data.projects.find(p => p.id === id),
    users: () => data.users,
    user: (_, { id }) => data.users.find(u => u.id === id),
    departments: () => data.departments,
    taskStatistics: () => ({
      total: data.tasks.length,
      backlog: 0,
      todo: 0,
      inProgress: data.tasks.filter(t => t.status === "IN_PROGRESS").length,
      inReview: 0,
      blocked: 0,
      completed: data.tasks.filter(t => t.status === "COMPLETED").length,
      cancelled: 0,
      highPriority: data.tasks.filter(t => t.priority === "HIGH").length,
      overdue: 0,
      completedThisWeek: 0,
      completedThisMonth: 1,
      averageCompletionTime: 15.5,
    }),
  },

  Mutation: {
    createTask: (_, { input }) => {
      const task = {
        id: String(data.tasks.length + 1),
        ...input,
        actualHours: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        watcherIds: input.watcherIds || [],
      };
      data.tasks.push(task);
      return task;
    },

    updateTask: (_, { id, input }) => {
      const idx = data.tasks.findIndex(t => t.id === id);
      if (idx === -1) throw new Error("Task not found");
      data.tasks[idx] = {
        ...data.tasks[idx],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      return data.tasks[idx];
    },

    deleteTask: (_, { id }) => {
      const idx = data.tasks.findIndex(t => t.id === id);
      if (idx === -1) return false;
      data.tasks.splice(idx, 1);
      return true;
    },

    createComment: (_, { input }) => {
      const comment = {
        id: String(data.comments.length + 1),
        ...input,
        authorId: "1",
        createdAt: new Date().toISOString(),
        isEdited: false,
      };
      data.comments.push(comment);
      return comment;
    },

    logTime: (_, { input }) => {
      const entry = {
        id: String(data.timeEntries.length + 1),
        userId: "1",
        ...input,
      };
      data.timeEntries.push(entry);

      const task = data.tasks.find(t => t.id === input.taskId);
      if (task) task.actualHours = (task.actualHours || 0) + input.hours;

      return entry;
    },
  },

  User: {
    department: p => data.departments.find(d => d.id === p.departmentId),
  },

  Department: {
    members: p => data.users.filter(u => u.departmentId === p.id),
  },

  Project: {
    owner: p => data.users.find(u => u.id === p.ownerId),
    team: p => data.users.filter(u => p.teamIds?.includes(u.id)),
  },

  Task: {
    assignee: p => data.users.find(u => u.id === p.assigneeId),
    reporter: p => data.users.find(u => u.id === p.reporterId),
    project: p => data.projects.find(pr => pr.id === p.projectId),
    comments: p => data.comments.filter(c => c.taskId === p.id),
    timeEntries: p => data.timeEntries.filter(te => te.taskId === p.id),
    watchers: p => data.users.filter(u => p.watcherIds?.includes(u.id)),
  },

  Comment: {
    author: p => data.users.find(u => u.id === p.authorId),
  },

  TimeEntry: {
    user: p => data.users.find(u => u.id === p.userId),
  },
};

// =====================
// APOLLO SERVER V5
// =====================

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

// =====================
// NETLIFY HANDLER FIXED
// =====================

export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler()
);
