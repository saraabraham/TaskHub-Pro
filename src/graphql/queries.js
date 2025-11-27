import { gql } from '@apollo/client';

// Authentication
export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
        role
        avatar
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      role
      avatar
      department {
        id
        name
      }
      tasksAssigned
      tasksCompleted
      skills
      performance {
        tasksCompletedThisMonth
        averageCompletionTime
        onTimeDeliveryRate
        qualityScore
      }
    }
  }
`;

// Tasks
export const GET_TASKS = gql`
  query GetTasks(
    $status: TaskStatus
    $priority: Priority
    $assigneeId: ID
    $projectId: ID
    $search: String
    $tags: [String!]
    $limit: Int
    $offset: Int
  ) {
    tasks(
      status: $status
      priority: $priority
      assigneeId: $assigneeId
      projectId: $projectId
      search: $search
      tags: $tags
      limit: $limit
      offset: $offset
    ) {
      tasks {
        id
        title
        description
        status
        priority
        dueDate
        estimatedHours
        actualHours
        tags
        assignee {
          id
          name
          avatar
        }
        reporter {
          id
          name
        }
        project {
          id
          name
        }
        comments {
          id
          content
          author {
            name
          }
        }
        watchers {
          id
          name
        }
      }
      totalCount
      hasMore
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      priority
      dueDate
      estimatedHours
      actualHours
      createdAt
      updatedAt
      completedAt
      tags
      assignee {
        id
        name
        avatar
        email
      }
      reporter {
        id
        name
      }
      project {
        id
        name
        status
      }
      milestone {
        id
        title
      }
      parent {
        id
        title
      }
      subtasks {
        id
        title
        status
      }
      dependencies {
        id
        title
        status
      }
      comments {
        id
        content
        author {
          id
          name
          avatar
        }
        createdAt
        isEdited
      }
      timeEntries {
        id
        hours
        description
        date
        user {
          name
        }
      }
      watchers {
        id
        name
        avatar
      }
    }
  }
`;

export const GET_MY_TASKS = gql`
  query GetMyTasks($status: TaskStatus) {
    myTasks(status: $status) {
      id
      title
      description
      status
      priority
      dueDate
      estimatedHours
      actualHours
      tags
      project {
        id
        name
      }
    }
  }
`;

export const GET_OVERDUE_TASKS = gql`
  query GetOverdueTasks {
    overdueTasks {
      id
      title
      status
      priority
      dueDate
      assignee {
        name
      }
      project {
        name
      }
    }
  }
`;

// Projects
export const GET_PROJECTS = gql`
  query GetProjects($status: ProjectStatus, $departmentId: ID) {
    projects(status: $status, departmentId: $departmentId) {
      id
      name
      description
      status
      priority
      startDate
      endDate
      budget
      actualCost
      progress
      tags
      owner {
        id
        name
      }
      department {
        id
        name
      }
      team {
        id
        name
        avatar
      }
      tasks {
        id
        status
      }
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      name
      description
      status
      priority
      startDate
      endDate
      budget
      actualCost
      progress
      tags
      owner {
        id
        name
        email
      }
      department {
        id
        name
      }
      team {
        id
        name
        avatar
        role
      }
      tasks {
        id
        title
        status
        priority
        dueDate
        assignee {
          name
        }
      }
      milestones {
        id
        title
        dueDate
        status
      }
      risks {
        id
        title
        severity
        probability
        status
      }
    }
  }
`;

export const GET_MY_PROJECTS = gql`
  query GetMyProjects {
    myProjects {
      id
      name
      status
      progress
      owner {
        name
      }
      team {
        id
        name
      }
    }
  }
`;

// Analytics
export const GET_TASK_STATISTICS = gql`
  query GetTaskStatistics($projectId: ID, $userId: ID, $dateFrom: String, $dateTo: String) {
    taskStatistics(projectId: $projectId, userId: $userId, dateFrom: $dateFrom, dateTo: $dateTo) {
      total
      backlog
      todo
      inProgress
      inReview
      blocked
      completed
      cancelled
      highPriority
      overdue
      completedThisWeek
      completedThisMonth
      averageCompletionTime
    }
  }
`;

export const GET_PROJECT_ANALYTICS = gql`
  query GetProjectAnalytics($projectId: ID!) {
    projectAnalytics(projectId: $projectId) {
      tasksCompleted
      tasksRemaining
      progress
      budgetUtilization
      teamSize
      averageTaskDuration
      riskCount
      milestoneProgress
      estimatedCompletionDate
    }
  }
`;

export const GET_USER_PERFORMANCE = gql`
  query GetUserPerformance($userId: ID!, $month: Int, $year: Int) {
    userPerformance(userId: $userId, month: $month, year: $year) {
      tasksCompleted
      tasksAssigned
      averageCompletionTime
      onTimeDeliveryRate
      hoursLogged
      commentsPosted
      projectsContributed
    }
  }
`;

export const GET_DEPARTMENT_METRICS = gql`
  query GetDepartmentMetrics($departmentId: ID!) {
    departmentMetrics(departmentId: $departmentId) {
      totalMembers
      activeProjects
      completedProjects
      totalTasks
      completedTasks
      budgetAllocated
      budgetSpent
      averageProjectDuration
    }
  }
`;

export const GET_BURNDOWN_CHART = gql`
  query GetBurndownChart($projectId: ID!) {
    burndownChart(projectId: $projectId) {
      date
      remainingTasks
      idealRemaining
    }
  }
`;

export const GET_VELOCITY_CHART = gql`
  query GetVelocityChart($projectId: ID!, $sprints: Int) {
    velocityChart(projectId: $projectId, sprints: $sprints) {
      sprint
      tasksCompleted
      storyPoints
    }
  }
`;

// Users & Departments
export const GET_USERS = gql`
  query GetUsers($departmentId: ID, $role: String, $isActive: Boolean) {
    users(departmentId: $departmentId, role: $role, isActive: $isActive) {
      id
      name
      email
      avatar
      role
      department {
        id
        name
      }
      tasksAssigned
      tasksCompleted
      skills
      isActive
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      avatar
      role
      department {
        id
        name
      }
      tasksAssigned
      tasksCompleted
      skills
      createdAt
      lastLogin
      isActive
      performance {
        tasksCompletedThisMonth
        averageCompletionTime
        onTimeDeliveryRate
        qualityScore
      }
      projects {
        id
        name
      }
    }
  }
`;

export const GET_DEPARTMENTS = gql`
  query GetDepartments {
    departments {
      id
      name
      description
      budget
      manager {
        id
        name
      }
      members {
        id
        name
      }
      projects {
        id
        name
      }
    }
  }
`;

// Notifications
export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications($isRead: Boolean) {
    myNotifications(isRead: $isRead) {
      id
      type
      title
      message
      isRead
      createdAt
      relatedTask {
        id
        title
      }
      relatedProject {
        id
        name
      }
    }
  }
`;

export const GET_UNREAD_COUNT = gql`
  query GetUnreadCount {
    unreadNotificationCount
  }
`;

// Search
export const GLOBAL_SEARCH = gql`
  query GlobalSearch($query: String!) {
    globalSearch(query: $query) {
      tasks {
        id
        title
        status
        priority
      }
      projects {
        id
        name
        status
      }
      users {
        id
        name
        role
      }
    }
  }
`;

// Mutations
export const CREATE_TASK = gql`
  mutation CreateTask($input: TaskInput!) {
    createTask(input: $input) {
      id
      title
      status
      priority
      assignee {
        id
        name
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: TaskUpdateInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      status
      priority
      updatedAt
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
      id
      name
      status
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) {
      id
      content
      author {
        name
      }
      createdAt
    }
  }
`;

export const LOG_TIME = gql`
  mutation LogTime($input: TimeEntryInput!) {
    logTime(input: $input) {
      id
      hours
      date
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_READ = gql`
  mutation MarkAllRead {
    markAllNotificationsRead
  }
`;

// Subscriptions
export const TASK_CREATED_SUBSCRIPTION = gql`
  subscription OnTaskCreated($projectId: ID) {
    taskCreated(projectId: $projectId) {
      id
      title
      status
      assignee {
        name
      }
    }
  }
`;

export const TASK_UPDATED_SUBSCRIPTION = gql`
  subscription OnTaskUpdated($taskId: ID) {
    taskUpdated(taskId: $taskId) {
      id
      title
      status
      updatedAt
    }
  }
`;

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotificationReceived($userId: ID!) {
    notificationReceived(userId: $userId) {
      id
      type
      title
      message
      createdAt
    }
  }
`;
