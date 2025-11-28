// Simple Netlify Function for GraphQL (without Apollo Server)
const data = {
  users: [
    { id: "1", name: "Sarah Chen", email: "sarah@company.com", avatar: "👩‍💻", role: "Senior Developer", departmentId: "1", tasksAssigned: 0, tasksCompleted: 45, skills: ["React", "GraphQL"], isActive: true },
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

const resolveTask = (task) => ({
  ...task,
  assignee: data.users.find(u => u.id === task.assigneeId),
  reporter: data.users.find(u => u.id === task.reporterId),
  project: data.projects.find(p => p.id === task.projectId),
  comments: data.comments.filter(c => c.taskId === task.id).map(c => ({
    ...c,
    author: data.users.find(u => u.id === c.authorId)
  })),
  timeEntries: data.timeEntries.filter(te => te.taskId === task.id).map(te => ({
    ...te,
    user: data.users.find(u => u.id === te.userId)
  })),
  watchers: data.users.filter(u => task.watcherIds?.includes(u.id))
});

const resolveProject = (project) => ({
  ...project,
  owner: data.users.find(u => u.id === project.ownerId),
  team: data.users.filter(u => project.teamIds?.includes(u.id))
});

const resolveUser = (user) => ({
  ...user,
  department: data.departments.find(d => d.id === user.departmentId)
});

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'GraphQL API is running. Use POST with GraphQL queries.' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const query = body.query || '';
    const variables = body.variables || {};

    console.log('Query received:', query);
    console.log('Variables:', variables);

    let responseData = { data: null };

    // Parse query type
    if (query.includes('GetTasks') || query.includes('tasks {')) {
      const tasks = data.tasks.map(resolveTask);
      responseData = {
        data: {
          tasks: {
            tasks,
            totalCount: tasks.length,
            hasMore: false
          }
        }
      };
    } else if (query.includes('GetProjects') || query.includes('projects {')) {
      const projects = data.projects.map(resolveProject);
      responseData = { data: { projects } };
    } else if (query.includes('GetUsers') || query.includes('users {')) {
      const users = data.users.map(resolveUser);
      responseData = { data: { users } };
    } else if (query.includes('GetTaskStatistics') || query.includes('taskStatistics {')) {
      responseData = {
        data: {
          taskStatistics: {
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
          }
        }
      };
    } else if (query.includes('CreateTask') || query.includes('createTask(')) {
      const input = variables.input;
      const newTask = {
        id: String(data.tasks.length + 1),
        ...input,
        actualHours: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        watcherIds: input.watcherIds || []
      };
      data.tasks.push(newTask);
      responseData = { data: { createTask: resolveTask(newTask) } };
    } else if (query.includes('UpdateTask') || query.includes('updateTask(')) {
      const { id, input } = variables;
      const idx = data.tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        data.tasks[idx] = {
          ...data.tasks[idx],
          ...input,
          updatedAt: new Date().toISOString()
        };
        responseData = { data: { updateTask: resolveTask(data.tasks[idx]) } };
      }
    } else if (query.includes('CreateComment') || query.includes('createComment(')) {
      const input = variables.input;
      const newComment = {
        id: String(data.comments.length + 1),
        ...input,
        authorId: "1",
        createdAt: new Date().toISOString(),
        isEdited: false
      };
      data.comments.push(newComment);
      responseData = {
        data: {
          createComment: {
            ...newComment,
            author: data.users.find(u => u.id === newComment.authorId)
          }
        }
      };
    } else if (query.includes('LogTime') || query.includes('logTime(')) {
      const input = variables.input;
      const newEntry = {
        id: String(data.timeEntries.length + 1),
        userId: "1",
        ...input
      };
      data.timeEntries.push(newEntry);
      const task = data.tasks.find(t => t.id === input.taskId);
      if (task) task.actualHours = (task.actualHours || 0) + input.hours;
      responseData = {
        data: {
          logTime: {
            ...newEntry,
            user: data.users.find(u => u.id === newEntry.userId)
          }
        }
      };
    } else {
      responseData = { errors: [{ message: 'Unknown query' }] };
    }

    console.log('Response:', JSON.stringify(responseData).substring(0, 200));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        errors: [{ message: error.message, stack: error.stack }]
      })
    };
  }
};
