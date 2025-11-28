
let data = null;

function initData() {
  return {
    users: [
      { id: "1", name: "Sarah Chen", email: "sarah@company.com", avatar: "👩‍💻", role: "Senior Developer", departmentId: "1", tasksAssigned: 0, tasksCompleted: 45, skills: ["React"], isActive: true },
      { id: "2", name: "Mike Johnson", email: "mike@company.com", avatar: "👨‍💼", role: "Tech Lead", departmentId: "1", tasksAssigned: 0, tasksCompleted: 67, skills: ["Node.js"], isActive: true },
      { id: "3", name: "Emma Davis", email: "emma@company.com", avatar: "👩‍🔬", role: "QA Engineer", departmentId: "2", tasksAssigned: 0, tasksCompleted: 89, skills: ["Testing"], isActive: true },
      { id: "4", name: "Alex Wong", email: "alex@company.com", avatar: "🔒", role: "Security", departmentId: "1", tasksAssigned: 0, tasksCompleted: 34, skills: ["Security"], isActive: true }
    ],
    departments: [
      { id: "1", name: "Engineering", description: "Development" },
      { id: "2", name: "QA", description: "Testing" }
    ],
    projects: [
      { id: "1", name: "E-Commerce Platform", description: "Platform redesign", status: "ACTIVE", priority: "HIGHEST", progress: 35, budget: 150000, actualCost: 45000, ownerId: "2", teamIds: ["1","2","3"], tags: ["frontend"], startDate: "2025-10-01", endDate: "2026-03-31" },
      { id: "2", name: "Mobile App", description: "iOS and Android", status: "PLANNING", priority: "HIGH", progress: 10, budget: 200000, actualCost: 0, ownerId: "1", teamIds: ["1","2"], tags: ["mobile"], startDate: "2026-01-01", endDate: "2026-08-31" }
    ],
    tasks: [
      { id: "1", title: "Design landing page", description: "Create design", status: "IN_PROGRESS", priority: "HIGH", assigneeId: "1", reporterId: "2", projectId: "1", dueDate: "2025-12-05", estimatedHours: 16, actualHours: 8, createdAt: "2025-11-20", tags: ["design"], watcherIds: ["2"] },
      { id: "2", title: "GraphQL API", description: "Setup Apollo", status: "COMPLETED", priority: "HIGHEST", assigneeId: "2", reporterId: "2", projectId: "1", dueDate: "2025-11-28", estimatedHours: 20, actualHours: 18, createdAt: "2025-11-15", tags: ["backend"], watcherIds: ["1"] }
    ],
    comments: [
      { id: "1", content: "Looking good!", authorId: "2", taskId: "1", createdAt: "2025-11-21", isEdited: false }
    ],
    timeEntries: [
      { id: "1", userId: "1", taskId: "1", hours: 4, description: "Work", date: "2025-11-25", billable: true }
    ]
  };
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'OK' }) };
  }

  try {
    if (!data) data = initData();

    const { query = '', variables = {} } = JSON.parse(event.body || '{}');
    
    if (query.includes('GetTasks')) {
      const tasks = data.tasks.map(t => ({
        ...t,
        assignee: data.users.find(u => u.id === t.assigneeId) || null,
        reporter: data.users.find(u => u.id === t.reporterId) || null,
        project: data.projects.find(p => p.id === t.projectId) || null,
        comments: data.comments.filter(c => c.taskId === t.id).map(c => ({
          ...c,
          author: data.users.find(u => u.id === c.authorId) || {}
        })),
        timeEntries: data.timeEntries.filter(te => te.taskId === t.id).map(te => ({
          ...te,
          user: data.users.find(u => u.id === te.userId) || {}
        })),
        watchers: (t.watcherIds || []).map(id => data.users.find(u => u.id === id)).filter(Boolean)
      }));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: { tasks: { tasks, totalCount: tasks.length, hasMore: false } } })
      };
    }

    if (query.includes('GetProjects')) {
      const projects = data.projects.map(p => ({
        ...p,
        owner: data.users.find(u => u.id === p.ownerId) || {},
        team: (p.teamIds || []).map(id => data.users.find(u => u.id === id)).filter(Boolean)
      }));
      
      return { statusCode: 200, headers, body: JSON.stringify({ data: { projects } }) };
    }

    if (query.includes('GetUsers')) {
      const users = data.users.map(u => ({
        ...u,
        department: data.departments.find(d => d.id === u.departmentId) || null
      }));
      
      return { statusCode: 200, headers, body: JSON.stringify({ data: { users } }) };
    }

    if (query.includes('GetTaskStatistics')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
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
              highPriority: data.tasks.filter(t => t.priority === "HIGH" || t.priority === "HIGHEST").length,
              overdue: 0,
              completedThisWeek: 0,
              completedThisMonth: 1,
              averageCompletionTime: 15.5
            }
          }
        })
      };
    }

    if (query.includes('CreateTask')) {
      const input = variables.input;
      const newTask = {
        id: String(Date.now()),
        ...input,
        actualHours: 0,
        createdAt: new Date().toISOString(),
        watcherIds: input.watcherIds || []
      };
      data.tasks.push(newTask);
      console.log('Created:', newTask.title);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          data: {
            createTask: {
              ...newTask,
              assignee: data.users.find(u => u.id === newTask.assigneeId) || null
            }
          }
        })
      };
    }

    if (query.includes('UpdateTask')) {
      const { id, input } = variables;
      const idx = data.tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        data.tasks[idx] = { ...data.tasks[idx], ...input };
        return { statusCode: 200, headers, body: JSON.stringify({ data: { updateTask: data.tasks[idx] } }) };
      }
    }

    if (query.includes('CreateComment')) {
      const input = variables.input;
      const newComment = {
        id: String(Date.now()),
        ...input,
        authorId: "1",
        createdAt: new Date().toISOString(),
        isEdited: false
      };
      data.comments.push(newComment);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          data: {
            createComment: {
              ...newComment,
              author: data.users.find(u => u.id === newComment.authorId) || {}
            }
          }
        })
      };
    }

    if (query.includes('LogTime')) {
      const input = variables.input;
      const newEntry = { id: String(Date.now()), userId: "1", ...input };
      data.timeEntries.push(newEntry);
      
      const task = data.tasks.find(t => t.id === input.taskId);
      if (task) task.actualHours = (task.actualHours || 0) + input.hours;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          data: {
            logTime: {
              ...newEntry,
              user: data.users.find(u => u.id === newEntry.userId) || {}
            }
          }
        })
      };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ errors: [{ message: 'Unknown query' }] }) };

  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ errors: [{ message: error.message }] }) };
  }
};
