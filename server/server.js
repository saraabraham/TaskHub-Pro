
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { GraphQLError } = require('graphql');

// Complete GraphQL Schema matching queries.js
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
    createdAt: String
    lastLogin: String
    performance: Performance
    projects: [Project!]!
  }

  type Performance {
    tasksCompletedThisMonth: Int!
    averageCompletionTime: Float!
    onTimeDeliveryRate: Float!
    qualityScore: Float!
  }

  type Department {
    id: ID!
    name: String!
    description: String
    budget: Float
    manager: User
    members: [User!]!
    projects: [Project!]!
  }

  type Project {
    id: ID!
    name: String!
    description: String!
    status: ProjectStatus!
    priority: Priority!
    startDate: String!
    endDate: String
    budget: Float
    actualCost: Float
    progress: Float!
    owner: User!
    department: Department
    team: [User!]!
    tasks: [Task!]!
    tags: [String!]!
    milestones: [Milestone!]!
    risks: [Risk!]!
  }

  type Milestone {
    id: ID!
    title: String!
    dueDate: String!
    status: MilestoneStatus!
  }

  type Risk {
    id: ID!
    title: String!
    severity: RiskSeverity!
    probability: RiskProbability!
    status: RiskStatus!
  }

  type Task {
    id: ID!
    title: String!
    description: String!
    status: TaskStatus!
    priority: Priority!
    assignee: User!
    reporter: User!
    project: Project
    dueDate: String!
    estimatedHours: Float
    actualHours: Float
    createdAt: String!
    updatedAt: String
    completedAt: String
    tags: [String!]!
    comments: [Comment!]!
    timeEntries: [TimeEntry!]!
    watchers: [User!]!
    milestone: Milestone
    parent: Task
    subtasks: [Task!]!
    dependencies: [Task!]!
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    task: Task!
    createdAt: String!
    isEdited: Boolean!
  }

  type TimeEntry {
    id: ID!
    user: User!
    task: Task!
    hours: Float!
    description: String
    date: String!
    billable: Boolean!
  }

  enum TaskStatus {
    BACKLOG
    TODO
    IN_PROGRESS
    IN_REVIEW
    BLOCKED
    COMPLETED
    CANCELLED
  }

  enum ProjectStatus {
    PLANNING
    ACTIVE
    ON_HOLD
    COMPLETED
    CANCELLED
  }

  enum MilestoneStatus {
    NOT_STARTED
    IN_PROGRESS
    COMPLETED
    DELAYED
  }

  enum RiskSeverity {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum RiskProbability {
    UNLIKELY
    POSSIBLE
    LIKELY
    CERTAIN
  }

  enum RiskStatus {
    IDENTIFIED
    ANALYZING
    MITIGATING
    RESOLVED
    ACCEPTED
  }

  enum Priority {
    LOWEST
    LOW
    MEDIUM
    HIGH
    HIGHEST
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
    status: TaskStatus!
    priority: Priority!
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
    status: TaskStatus
    priority: Priority
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
    mentionIds: [ID!]
  }

  input TimeEntryInput {
    taskId: ID!
    hours: Float!
    description: String
    date: String!
    billable: Boolean!
  }

  type Query {
    # Tasks
    tasks(
      status: TaskStatus
      priority: Priority
      assigneeId: ID
      projectId: ID
      search: String
      tags: [String!]
      limit: Int
      offset: Int
    ): TaskConnection!
    task(id: ID!): Task
    
    # Projects
    projects(status: ProjectStatus, departmentId: ID): [Project!]!
    project(id: ID!): Project
    
    # Users
    users(departmentId: ID, role: String, isActive: Boolean): [User!]!
    user(id: ID!): User
    
    # Departments
    departments: [Department!]!
    department(id: ID!): Department
    
    # Statistics
    taskStatistics(projectId: ID, userId: ID, dateFrom: String, dateTo: String): TaskStatistics!
  }

  type Mutation {
    createTask(input: TaskInput!): Task!
    updateTask(id: ID!, input: TaskUpdateInput!): Task!
    deleteTask(id: ID!): Boolean!
    createComment(input: CommentInput!): Comment!
    logTime(input: TimeEntryInput!): TimeEntry!
  }
`;

// In-memory data store
const data = {
  users: [
    { id: '1', name: 'Sarah Chen', email: 'sarah@company.com', avatar: '👩‍💻', role: 'Senior Developer', departmentId: '1', tasksAssigned: 0, tasksCompleted: 45, skills: ['React', 'GraphQL', 'Node.js'], isActive: true, createdAt: '2024-01-15', lastLogin: '2025-11-27' },
    { id: '2', name: 'Mike Johnson', email: 'mike@company.com', avatar: '👨‍💼', role: 'Tech Lead', departmentId: '1', tasksAssigned: 0, tasksCompleted: 67, skills: ['Node.js', 'AWS', 'Docker'], isActive: true, createdAt: '2023-11-10', lastLogin: '2025-11-27' },
    { id: '3', name: 'Emma Davis', email: 'emma@company.com', avatar: '👩‍🔬', role: 'QA Engineer', departmentId: '2', tasksAssigned: 0, tasksCompleted: 89, skills: ['Jest', 'Cypress', 'Testing'], isActive: true, createdAt: '2024-03-20', lastLogin: '2025-11-26' },
    { id: '4', name: 'Alex Wong', email: 'alex@company.com', avatar: '🔒', role: 'Security Specialist', departmentId: '1', tasksAssigned: 0, tasksCompleted: 34, skills: ['Security', 'Compliance'], isActive: true, createdAt: '2024-06-01', lastLogin: '2025-11-27' }
  ],
  departments: [
    { id: '1', name: 'Engineering', description: 'Product development', managerId: '2', budget: 500000 },
    { id: '2', name: 'Quality Assurance', description: 'Testing and QA', managerId: '3', budget: 200000 }
  ],
  projects: [
    {
      id: '1',
      name: 'E-Commerce Platform',
      description: 'Complete platform redesign',
      status: 'ACTIVE',
      priority: 'HIGHEST',
      startDate: '2025-10-01',
      endDate: '2026-03-31',
      budget: 150000,
      actualCost: 45000,
      progress: 35,
      ownerId: '2',
      departmentId: '1',
      teamIds: ['1', '2', '3'],
      tags: ['frontend', 'backend']
    },
    {
      id: '2',
      name: 'Mobile App',
      description: 'iOS and Android apps',
      status: 'PLANNING',
      priority: 'HIGH',
      startDate: '2026-01-01',
      endDate: '2026-08-31',
      budget: 200000,
      actualCost: 0,
      progress: 10,
      ownerId: '1',
      departmentId: '1',
      teamIds: ['1', '2'],
      tags: ['mobile']
    }
  ],
  tasks: [
    {
      id: '1',
      title: 'Design new landing page',
      description: 'Create modern, responsive landing page',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeId: '1',
      reporterId: '2',
      projectId: '1',
      dueDate: '2025-12-05',
      estimatedHours: 16,
      actualHours: 8,
      createdAt: '2025-11-20',
      updatedAt: '2025-11-27',
      tags: ['design', 'frontend'],
      watcherIds: ['2', '3']
    },
    {
      id: '2',
      title: 'Implement GraphQL API',
      description: 'Set up Apollo Server with schema',
      status: 'COMPLETED',
      priority: 'HIGHEST',
      assigneeId: '2',
      reporterId: '2',
      projectId: '1',
      dueDate: '2025-11-28',
      estimatedHours: 20,
      actualHours: 18,
      createdAt: '2025-11-15',
      updatedAt: '2025-11-26',
      completedAt: '2025-11-26',
      tags: ['backend', 'api'],
      watcherIds: ['1']
    }
  ],
  comments: [
    { id: '1', content: 'Looking good!', authorId: '2', taskId: '1', createdAt: '2025-11-21', isEdited: false },
    { id: '2', content: 'Great work!', authorId: '1', taskId: '2', createdAt: '2025-11-26', isEdited: false }
  ],
  timeEntries: [
    { id: '1', userId: '1', taskId: '1', hours: 4, description: 'Initial design', date: '2025-11-25', billable: true },
    { id: '2', userId: '1', taskId: '1', hours: 4, description: 'Responsive layout', date: '2025-11-26', billable: true }
  ],
  milestones: [],
  risks: []
};

// Resolvers
const resolvers = {
  Query: {
    tasks: (_, args) => {
      let filtered = [...data.tasks];
      if (args.status) filtered = filtered.filter(t => t.status === args.status);
      if (args.priority) filtered = filtered.filter(t => t.priority === args.priority);
      if (args.assigneeId) filtered = filtered.filter(t => t.assigneeId === args.assigneeId);
      if (args.projectId) filtered = filtered.filter(t => t.projectId === args.projectId);
      if (args.search) {
        const q = args.search.toLowerCase();
        filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
      }

      const limit = args.limit || 50;
      const offset = args.offset || 0;

      return {
        tasks: filtered.slice(offset, offset + limit),
        totalCount: filtered.length,
        hasMore: offset + limit < filtered.length
      };
    },

    task: (_, { id }) => data.tasks.find(t => t.id === id),
    projects: (_, { status }) => status ? data.projects.filter(p => p.status === status) : data.projects,
    project: (_, { id }) => data.projects.find(p => p.id === id),
    users: () => data.users,
    user: (_, { id }) => data.users.find(u => u.id === id),
    departments: () => data.departments,
    department: (_, { id }) => data.departments.find(d => d.id === id),

    taskStatistics: () => {
      const today = new Date().toISOString().split('T')[0];
      return {
        total: data.tasks.length,
        backlog: data.tasks.filter(t => t.status === 'BACKLOG').length,
        todo: data.tasks.filter(t => t.status === 'TODO').length,
        inProgress: data.tasks.filter(t => t.status === 'IN_PROGRESS').length,
        inReview: data.tasks.filter(t => t.status === 'IN_REVIEW').length,
        blocked: data.tasks.filter(t => t.status === 'BLOCKED').length,
        completed: data.tasks.filter(t => t.status === 'COMPLETED').length,
        cancelled: data.tasks.filter(t => t.status === 'CANCELLED').length,
        highPriority: data.tasks.filter(t => t.priority === 'HIGH' || t.priority === 'HIGHEST').length,
        overdue: data.tasks.filter(t => t.dueDate < today && t.status !== 'COMPLETED').length,
        completedThisWeek: 0,
        completedThisMonth: data.tasks.filter(t => t.status === 'COMPLETED').length,
        averageCompletionTime: 15.5
      };
    }
  },

  Mutation: {
    createTask: (_, { input }) => {
      const task = {
        id: String(data.tasks.length + 1),
        ...input,
        actualHours: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        watcherIds: input.watcherIds || []
      };
      data.tasks.push(task);
      const user = data.users.find(u => u.id === input.assigneeId);
      if (user) user.tasksAssigned++;
      console.log('✅ Created task:', task.title);
      return task;
    },

    updateTask: (_, { id, input }) => {
      const idx = data.tasks.findIndex(t => t.id === id);
      if (idx === -1) throw new GraphQLError('Task not found');
      data.tasks[idx] = { ...data.tasks[idx], ...input, updatedAt: new Date().toISOString() };
      console.log('✅ Updated task:', data.tasks[idx].title);
      return data.tasks[idx];
    },

    deleteTask: (_, { id }) => {
      const idx = data.tasks.findIndex(t => t.id === id);
      if (idx === -1) return false;
      data.tasks.splice(idx, 1);
      console.log('✅ Deleted task');
      return true;
    },

    createComment: (_, { input }) => {
      const comment = {
        id: String(data.comments.length + 1),
        ...input,
        authorId: '1',
        createdAt: new Date().toISOString(),
        isEdited: false
      };
      data.comments.push(comment);
      console.log('✅ Added comment');
      return comment;
    },

    logTime: (_, { input }) => {
      const entry = {
        id: String(data.timeEntries.length + 1),
        userId: '1',
        ...input
      };
      data.timeEntries.push(entry);
      const task = data.tasks.find(t => t.id === input.taskId);
      if (task) task.actualHours = (task.actualHours || 0) + input.hours;
      console.log('✅ Logged time:', input.hours, 'hours');
      return entry;
    }
  },

  // Nested resolvers
  User: {
    department: (p) => data.departments.find(d => d.id === p.departmentId),
    performance: () => ({ tasksCompletedThisMonth: 12, averageCompletionTime: 14.5, onTimeDeliveryRate: 85, qualityScore: 4.2 }),
    projects: (p) => data.projects.filter(pr => pr.teamIds?.includes(p.id) || pr.ownerId === p.id)
  },
  Department: {
    manager: (p) => data.users.find(u => u.id === p.managerId),
    members: (p) => data.users.filter(u => u.departmentId === p.id),
    projects: (p) => data.projects.filter(pr => pr.departmentId === p.id)
  },
  Project: {
    owner: (p) => data.users.find(u => u.id === p.ownerId),
    department: (p) => data.departments.find(d => d.id === p.departmentId),
    team: (p) => data.users.filter(u => p.teamIds?.includes(u.id)),
    tasks: (p) => data.tasks.filter(t => t.projectId === p.id),
    milestones: () => [],
    risks: () => []
  },
  Task: {
    assignee: (p) => data.users.find(u => u.id === p.assigneeId),
    reporter: (p) => data.users.find(u => u.id === p.reporterId),
    project: (p) => data.projects.find(pr => pr.id === p.projectId),
    comments: (p) => data.comments.filter(c => c.taskId === p.id),
    timeEntries: (p) => data.timeEntries.filter(te => te.taskId === p.id),
    watchers: (p) => data.users.filter(u => p.watcherIds?.includes(u.id)),
    milestone: () => null,
    parent: () => null,
    subtasks: () => [],
    dependencies: () => []
  },
  Comment: {
    author: (p) => data.users.find(u => u.id === p.authorId),
    task: (p) => data.tasks.find(t => t.id === p.taskId)
  },
  TimeEntry: {
    user: (p) => data.users.find(u => u.id === p.userId),
    task: (p) => data.tasks.find(t => t.id === p.taskId)
  }
};

const server = new ApolloServer({ typeDefs, resolvers, introspection: true });

const startServer = async () => {
  const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
  console.log(`🚀 Server: ${url}`);
  console.log(`✨ Pure GraphQL - matching queries.js`);
};

startServer();
