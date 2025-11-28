
# 📋 TaskHub Pro

> A modern, enterprise-grade task management platform with real-time collaboration, analytics, and serverless architecture.
> 
## ✨ Features

### 🎯 Core Functionality
- **Task Management** - Create, update, and track tasks with status, priority, and due dates
- **Project Organization** - Group tasks into projects with budget tracking and progress monitoring
- **Team Collaboration** - Assign tasks, add comments, and mention team members
- **Time Tracking** - Log work hours with billable/non-billable entries
- **Real-time Updates** - Instant UI updates when tasks are created or modified

### 📊 Analytics & Insights
- **Interactive Dashboards** - Visualize task distribution with pie charts and bar graphs
- **Team Velocity** - Track sprint performance and completion trends
- **Performance Metrics** - Monitor average completion time and delivery rates
- **Custom Filters** - Filter tasks by status, priority, assignee, and search terms

### 👥 Team Management
- **User Profiles** - View team members with skills, roles, and performance stats
- **Department Organization** - Organize teams by departments
- **Notifications** - Stay updated with task assignments and comments
- **Watchers** - Follow specific tasks for updates

### 🎨 Modern UI/UX
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Ready** - Eye-friendly interface (coming soon)
- **Drag & Drop** - Intuitive task management (coming soon)
- **Keyboard Shortcuts** - Power user features (coming soon)

## 🚀 Tech Stack

### Frontend
- **React 18.2** - Modern UI library with hooks
- **Apollo Client 3.8** - GraphQL client with caching
- **Recharts 2.10** - Beautiful, responsive charts
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Clean, consistent icons

### Backend
- **Netlify Functions** - Serverless GraphQL API
- **GraphQL** - Flexible, efficient data queries
- **In-Memory Storage** - Fast, simple data persistence

### DevOps
- **GitHub** - Version control and collaboration
- **Netlify** - Continuous deployment and hosting
- **ESLint** - Code quality and consistency

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
```bash
   git clone https://github.com/saraabraham/TaskHub-Pro.git
   cd TaskHub-Pro
```

2. **Install dependencies**
```bash
   npm install
```

3. **Install Netlify CLI** (for local serverless functions)
```bash
   npm install -g netlify-cli
```

4. **Start development server**
```bash
   netlify dev
```

5. **Open your browser**
```
   http://localhost:8888
```

### Build for Production
```bash
npm run build
```

## 🌐 Deployment

### Deploy to Netlify

1. **Push to GitHub**
```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
```

2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `build`
     - **Functions directory**: `netlify/functions`

3. **Deploy!**
   - Netlify will automatically build and deploy
   - Your site will be live in 2-3 minutes

### Environment Variables
No environment variables required! The app works out of the box.

## 📁 Project Structure
```
TaskHub-Pro/
├── netlify/
│   └── functions/
│       └── graphql.js          # Serverless GraphQL API
├── public/
│   ├── index.html              # HTML template
│   └── favicon.ico             # Site icon
├── src/
│   ├── App.jsx                 # Main application component
│   ├── index.js                # React entry point
│   └── index.css               # Global styles
├── .gitignore                  # Git ignore rules
├── netlify.toml                # Netlify configuration
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS config
└── README.md                   # This file
```

## 🎮 Usage

### Creating a Task
1. Click the **"New Task"** button
2. Fill in task details (title, description, assignee, etc.)
3. Set priority and due date
4. Click **"Create Task"**

### Managing Tasks
- **Change Status**: Use the dropdown on each task card
- **View Details**: Click on any task card
- **Add Comments**: Open task details → Comments tab
- **Log Time**: Open task details → Time Tracking tab

### Filtering Tasks
- Use the **search bar** to find tasks by title or description
- Filter by **status** (Backlog, To Do, In Progress, etc.)
- Filter by **priority** (Low, Medium, High, etc.)

### Viewing Analytics
- Click **"Analytics"** in the sidebar
- View completion trends, priority distribution, and team velocity

## 🔧 Configuration

### GraphQL API
The backend is a simple serverless function at `netlify/functions/graphql.js`. To modify:

1. Edit the `data` object to change initial data
2. Update `resolvers` to add new query logic
3. Redeploy to Netlify

### Styling
- Edit `tailwind.config.js` for theme customization
- Modify `src/index.css` for global styles
- Update component styles directly in JSX

## 🐛 Troubleshooting

### Data not loading?
- Check browser console for errors (F12)
- Verify GraphQL endpoint: `https://your-site.netlify.app/.netlify/functions/graphql`
- Check Netlify function logs in dashboard

### Build failing?
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for disk space
- Review Netlify build logs

### CORS issues?
- GraphQL function has CORS enabled by default
- Check network tab in browser DevTools

