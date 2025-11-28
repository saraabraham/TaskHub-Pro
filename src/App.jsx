
import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, gql, useQuery, useMutation } from '@apollo/client';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Search, Plus, Bell, User, LogOut, Settings, Menu, X,
  LayoutDashboard, FolderKanban, Users, TrendingUp,
  Clock, CheckCircle, AlertCircle, Calendar, Tag,
  Filter, Download, Upload, Star, MessageSquare
} from 'lucide-react';


// Apollo Client Setup
const httpLink = createHttpLink({
  uri: process.env.REACT_APP_GRAPHQL_URI || 'http://localhost:4000/graphql',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// GraphQL Queries
const GET_TASKS = gql`
  query GetTasks {
    tasks {
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
            id
            name
            avatar
          }
          createdAt
          isEdited
        }
        watchers {
          id
          name
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
      }
    }
  }
`;

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      status
      priority
      progress
      budget
      actualCost
      startDate
      endDate
      owner {
        id
        name
      }
      team {
        id
        name
        avatar
        role
      }
    }
  }
`;

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      avatar
      role
      tasksAssigned
      tasksCompleted
      skills
      department {
        id
        name
      }
    }
  }
`;

const GET_TASK_STATISTICS = gql`
  query GetTaskStatistics {
    taskStatistics {
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

// Mutations
const CREATE_TASK = gql`
  mutation CreateTask($input: TaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      status
      priority
      assignee {
        id
        name
        avatar
      }
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: TaskUpdateInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      status
      priority
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) {
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
  }
`;

const LOG_TIME = gql`
  mutation LogTime($input: TimeEntryInput!) {
    logTime(input: $input) {
      id
      hours
      description
      date
      user {
        name
      }
    }
  }
`;

// Create Task Modal
const CreateTaskModal = ({ isOpen, onClose, users, projects }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    assigneeId: '',
    reporterId: '2',
    projectId: '',
    dueDate: '',
    estimatedHours: 0,
    tags: ''
  });

  const [createTask, { loading }] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }, { query: GET_TASK_STATISTICS }],
    onCompleted: () => {
      onClose();
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        assigneeId: '',
        reporterId: '2',
        projectId: '',
        dueDate: '',
        estimatedHours: 0,
        tags: ''
      });
    }
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const input = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      assigneeId: formData.assigneeId,
      reporterId: formData.reporterId,
      dueDate: formData.dueDate,
      estimatedHours: parseFloat(formData.estimatedHours) || 0,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
    };

    if (formData.projectId) {
      input.projectId = formData.projectId;
    }

    try {
      await createTask({ variables: { input } });
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create New Task</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter task title"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="Describe the task"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Assignee *</label>
            <select
              required
              value={formData.assigneeId}
              onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select assignee</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.role}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Project</label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">No Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="LOWEST">Lowest</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="HIGHEST">Highest</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Estimated Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="0"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="design, frontend, urgent"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Log Time Modal
const LogTimeModal = ({ isOpen, onClose, taskId, taskTitle }) => {
  const [formData, setFormData] = useState({
    hours: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    billable: true
  });

  const [logTime, { loading }] = useMutation(LOG_TIME, {
    refetchQueries: [{ query: GET_TASKS }],
    onCompleted: () => {
      onClose();
      setFormData({
        hours: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        billable: true
      });
    }
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await logTime({
        variables: {
          input: {
            taskId,
            hours: parseFloat(formData.hours),
            description: formData.description,
            date: formData.date,
            billable: formData.billable
          }
        }
      });
    } catch (error) {
      console.error('Error logging time:', error);
      alert('Error logging time: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Log Time</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-4">Task: {taskTitle}</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Hours *</label>
            <input
              type="number"
              required
              min="0.5"
              step="0.5"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="8"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="What did you work on?"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="billable"
              checked={formData.billable}
              onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="billable" className="text-sm font-medium">Billable</label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Logging...' : 'Log Time'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Notification Panel
const NotificationPanel = ({ isOpen, onClose }) => {
  const mockNotifications = [
    {
      id: '1',
      type: 'TASK_ASSIGNED',
      title: 'New Task Assigned',
      message: 'You have been assigned to "Design new landing page"',
      time: '2 hours ago',
      isRead: false
    },
    {
      id: '2',
      type: 'TASK_COMMENT',
      title: 'New Comment',
      message: 'Mike Johnson commented on your task',
      time: '5 hours ago',
      isRead: false
    },
    {
      id: '3',
      type: 'DEADLINE_APPROACHING',
      title: 'Deadline Approaching',
      message: 'Task "Implement GraphQL API" is due tomorrow',
      time: '1 day ago',
      isRead: true
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Notifications</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {mockNotifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''
              }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${!notification.isRead ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              <div className="flex-1">
                <div className="font-medium text-sm">{notification.title}</div>
                <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-200 text-center">
        <button className="text-blue-600 text-sm hover:text-blue-700">
          Mark all as read
        </button>
      </div>
    </div>
  );
};

// Task Detail Modal
const TaskDetailModal = ({ task, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [comment, setComment] = useState('');
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);

  const [createComment] = useMutation(CREATE_COMMENT, {
    refetchQueries: [{ query: GET_TASKS }],
    onCompleted: () => {
      setComment('');
    }
  });

  if (!task) return null;

  const handleAddComment = async () => {
    if (comment.trim()) {
      try {
        await createComment({
          variables: {
            input: {
              content: comment,
              taskId: task.id,
              mentionIds: []
            }
          }
        });
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>#{task.id}</span>
                <span>•</span>
                <span>{task.project?.name || 'No Project'}</span>
                <span>•</span>
                <span>Created by {task.reporter?.name || 'Unknown'}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3 border-b-2 ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-3 border-b-2 ${activeTab === 'comments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
              >
                Comments ({task.comments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('time')}
                className={`py-3 border-b-2 ${activeTab === 'time' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
              >
                Time Tracking
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{task.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {task.tags?.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Status</h3>
                    <div className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md font-medium">
                      {task.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Priority</h3>
                    <div className="px-3 py-2 bg-orange-100 text-orange-700 rounded-md font-medium">
                      {task.priority}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Assignee</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{task.assignee?.avatar || '👤'}</span>
                      <div>
                        <div className="font-medium">{task.assignee?.name || 'Unassigned'}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Due Date</h3>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span>{task.dueDate}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Time Estimate</h3>
                    <div className="text-gray-700">{task.estimatedHours}h estimated</div>
                    <div className="text-gray-700">{task.actualHours}h logged</div>
                    {task.estimatedHours > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min((task.actualHours / task.estimatedHours) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4">
                <div className="border border-gray-300 rounded-lg p-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full border-0 focus:ring-0 resize-none"
                    rows="3"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddComment}
                      disabled={!comment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Comment
                    </button>
                  </div>
                </div>

                {task.comments && task.comments.length > 0 ? (
                  task.comments.map(c => (
                    <div key={c.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{c.author?.avatar || '👤'}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{c.author?.name || 'Unknown'}</span>
                            <span className="text-sm text-gray-500">{c.createdAt}</span>
                          </div>
                          <p className="text-gray-700">{c.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            )}

            {activeTab === 'time' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Time Entries</h3>
                  <button
                    onClick={() => setIsLogTimeOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Log Time
                  </button>
                </div>

                {task.timeEntries && task.timeEntries.length > 0 ? (
                  task.timeEntries.map(entry => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{entry.hours}h logged</div>
                          <div className="text-sm text-gray-600">{entry.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            by {entry.user?.name} on {entry.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No time entries yet
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <LogTimeModal
        isOpen={isLogTimeOpen}
        onClose={() => setIsLogTimeOpen(false)}
        taskId={task.id}
        taskTitle={task.title}
      />
    </>
  );
};

// Task Card Component
const TaskCard = ({ task, onClick }) => {
  const [updateTask] = useMutation(UPDATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }, { query: GET_TASK_STATISTICS }]
  });

  const statusColors = {
    BACKLOG: 'bg-gray-100 text-gray-800',
    TODO: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    IN_REVIEW: 'bg-yellow-100 text-yellow-800',
    BLOCKED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-800'
  };

  const priorityColors = {
    LOWEST: 'border-l-4 border-gray-300',
    LOW: 'border-l-4 border-green-400',
    MEDIUM: 'border-l-4 border-yellow-400',
    HIGH: 'border-l-4 border-orange-400',
    HIGHEST: 'border-l-4 border-red-500'
  };

  const progressPercentage = task.estimatedHours > 0
    ? Math.min((task.actualHours / task.estimatedHours) * 100, 100)
    : 0;

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTask({
        variables: {
          id: task.id,
          input: { status: newStatus }
        }
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-all cursor-pointer ${priorityColors[task.priority]}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-800 flex-1">{task.title}</h3>
      </div>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{task.assignee?.avatar || '👤'}</span>
        <div>
          <div className="text-sm font-medium">{task.assignee?.name || 'Unassigned'}</div>
          <div className="text-xs text-gray-500">{task.project?.name || 'No Project'}</div>
        </div>
      </div>

      {task.estimatedHours > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {task.actualHours}h / {task.estimatedHours}h logged
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {task.tags?.map(tag => (
          <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{task.dueDate}</span>
        </div>
        <div className="flex items-center gap-3">
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments.length}</span>
            </div>
          )}
          {task.watchers && task.watchers.length > 0 && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{task.watchers.length}</span>
            </div>
          )}
        </div>
      </div>

      <select
        value={task.status}
        onChange={(e) => {
          e.stopPropagation();
          handleStatusChange(e.target.value);
        }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${statusColors[task.status]}`}
      >
        <option value="BACKLOG">Backlog</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="IN_REVIEW">In Review</option>
        <option value="BLOCKED">Blocked</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ project }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-lg">{project.name}</h4>
        <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
          {project.status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{project.description}</p>
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        {project.team.slice(0, 3).map(member => (
          <span key={member.id} className="text-xl" title={member.name}>
            {member.avatar}
          </span>
        ))}
        {project.team.length > 3 && (
          <span className="text-sm text-gray-600">+{project.team.length - 3}</span>
        )}
      </div>
      <div className="text-sm text-gray-500">
        <div>Budget: ${project.budget?.toLocaleString()}</div>
        <div>Spent: ${project.actualCost?.toLocaleString()}</div>
      </div>
    </div>
  );
};

// Team Member Card Component
const TeamMemberCard = ({ member }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{member.avatar}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{member.name}</h3>
          <p className="text-sm text-gray-600">{member.role}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-2">{member.email}</p>
      {member.department && (
        <p className="text-xs text-gray-500 mb-2">Department: {member.department.name}</p>
      )}
      <div className="flex flex-wrap gap-1 mb-3">
        {member.skills && member.skills.slice(0, 3).map(skill => (
          <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            {skill}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="text-center">
          <div className="font-semibold text-blue-600">{member.tasksAssigned}</div>
          <div className="text-xs text-gray-500">Assigned</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-green-600">{member.tasksCompleted}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { data: tasksData, loading: tasksLoading } = useQuery(GET_TASKS);
  const { data: projectsData, loading: projectsLoading } = useQuery(GET_PROJECTS);
  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS);
  const { data: statsData, loading: statsLoading } = useQuery(GET_TASK_STATISTICS);

  const tasks = tasksData?.tasks?.tasks || [];
  const projects = projectsData?.projects || [];
  const users = usersData?.users || [];
  const stats = statsData?.taskStatistics || {};

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'ALL' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statusChartData = [
    { name: 'Backlog', value: stats.backlog || 0, color: '#9CA3AF' },
    { name: 'To Do', value: stats.todo || 0, color: '#3B82F6' },
    { name: 'In Progress', value: stats.inProgress || 0, color: '#8B5CF6' },
    { name: 'In Review', value: stats.inReview || 0, color: '#F59E0B' },
    { name: 'Blocked', value: stats.blocked || 0, color: '#EF4444' },
    { name: 'Completed', value: stats.completed || 0, color: '#10B981' }
  ];

  const velocityData = [
    { sprint: 'Sprint 1', completed: 12, estimated: 15 },
    { sprint: 'Sprint 2', completed: 15, estimated: 15 },
    { sprint: 'Sprint 3', completed: 10, estimated: 12 },
    { sprint: 'Sprint 4', completed: 18, estimated: 16 },
    { sprint: 'Sprint 5', completed: 14, estimated: 14 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && <h2 className="text-xl font-bold text-gray-900">TaskHub Pro</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="Dashboard"
            active={activeView === 'dashboard'}
            onClick={() => setActiveView('dashboard')}
            collapsed={!sidebarOpen}
          />
          <NavItem
            icon={<FolderKanban className="w-5 h-5" />}
            label="Projects"
            active={activeView === 'projects'}
            onClick={() => setActiveView('projects')}
            collapsed={!sidebarOpen}
          />
          <NavItem
            icon={<CheckCircle className="w-5 h-5" />}
            label="My Tasks"
            active={activeView === 'tasks'}
            onClick={() => setActiveView('tasks')}
            collapsed={!sidebarOpen}
          />
          <NavItem
            icon={<Users className="w-5 h-5" />}
            label="Team"
            active={activeView === 'team'}
            onClick={() => setActiveView('team')}
            collapsed={!sidebarOpen}
          />
          <NavItem
            icon={<TrendingUp className="w-5 h-5" />}
            label="Analytics"
            active={activeView === 'analytics'}
            onClick={() => setActiveView('analytics')}
            collapsed={!sidebarOpen}
          />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks, projects, people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-6">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  SC
                </div>
                <span className="font-medium">Sarah Chen</span>
              </div>
            </div>
          </div>

          <NotificationPanel
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              </div>

              {statsLoading ? (
                <div className="text-center py-12">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Tasks" value={stats.total || 0} icon={<CheckCircle className="w-6 h-6" />} color="blue" />
                    <StatCard title="In Progress" value={stats.inProgress || 0} icon={<Clock className="w-6 h-6" />} color="purple" />
                    <StatCard title="Completed" value={stats.completed || 0} icon={<CheckCircle className="w-6 h-6" />} color="green" />
                    <StatCard title="Blocked" value={stats.blocked || 0} icon={<AlertCircle className="w-6 h-6" />} color="red" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold mb-4">Task Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold mb-4">Team Velocity</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={velocityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="sprint" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" fill="#3B82F6" name="Completed" />
                          <Bar dataKey="estimated" fill="#9CA3AF" name="Estimated" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{stats.completedThisWeek || 0}</div>
                        <div className="text-sm text-gray-600">Completed This Week</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">{stats.completedThisMonth || 0}</div>
                        <div className="text-sm text-gray-600">Completed This Month</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {stats.averageCompletionTime?.toFixed(1) || 0}h
                        </div>
                        <div className="text-sm text-gray-600">Avg Completion Time</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeView === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              </div>

              {projectsLoading ? (
                <div className="text-center py-12">Loading projects...</div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <FolderKanban className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">No projects found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex gap-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="ALL">All Status</option>
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="COMPLETED">Completed</option>
                  </select>

                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="ALL">All Priority</option>
                    <option value="LOWEST">Lowest</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="HIGHEST">Highest</option>
                  </select>
                </div>
              </div>

              {tasksLoading ? (
                <div className="text-center py-12">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <CheckCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">No tasks found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => setSelectedTask(task)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
              </div>

              {usersLoading ? (
                <div className="text-center py-12">Loading team members...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">No team members found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {users.map(user => (
                    <TeamMemberCard key={user.id} member={user} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Completion Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { week: 'Week 1', completed: 8 },
                      { week: 'Week 2', completed: 12 },
                      { week: 'Week 3', completed: 10 },
                      { week: 'Week 4', completed: 15 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="completed" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { priority: 'Lowest', count: 0 },
                      { priority: 'Low', count: 0 },
                      { priority: 'Medium', count: stats.total - stats.highPriority || 0 },
                      { priority: 'High', count: Math.floor((stats.highPriority || 0) / 2) },
                      { priority: 'Highest', count: Math.ceil((stats.highPriority || 0) / 2) }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        users={users}
        projects={projects}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
      }`}
  >
    {icon}
    {!collapsed && <span>{label}</span>}
  </button>
);

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ApolloProvider client={client}>
      <Dashboard />
    </ApolloProvider>
  );
}

export default App;