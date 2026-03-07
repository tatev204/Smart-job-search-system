# Diplomayin Frontend UI Guide

## Overview
Beautiful, modern React UI for the Diplomayin job matching platform. Built with React 18, TypeScript, Vite, and Tailwind CSS styling.

## Features

### 🎨 Modern Design
- **Gradient color scheme** - Purple/blue gradient theme (colors: #667eea and #764ba2)
- **Responsive layout** - Works perfectly on desktop, tablet, and mobile
- **Smooth animations** - Hover effects and transitions for better UX
- **Loading skeletons** - Visual feedback while loading data

### 📱 Key Pages

#### 1. **Home / Job List** (`/`)
- Hero section with call-to-action buttons
- Search functionality to filter jobs by title or company
- Grid layout of job cards with:
  - Job title and company
  - Location and salary range
  - Job description preview (truncated)
  - "View Details" link to job detail page
- Loading skeleton while fetching data

#### 2. **Job Detail** (`/jobs/:id`)
- Full job information display
- Company, location, and salary details
- Complete job description
- Back button for easy navigation
- Apply button (ready for implementation)

#### 3. **Login** (`/login`)
- Email and password form
- Form validation
- Error message display
- Loading state during login

#### 4. **Upload CV** (`/upload`)
- File upload with drag-and-drop support
- File type validation (PDF, DOC, DOCX)
- File size validation (max 10MB)
- Upload progress feedback
- Success/error message display

#### 5. **Header/Navigation**
- Logo with link to home
- Navigation links (Jobs, Upload CV, Login/Logout)
- Sticky positioning
- Responsive mobile menu

## Color Scheme

```
Primary Gradient: #667eea → #764ba2
Secondary Gradient: #f5f7fa → #c3cfe2
Text: #333
Muted Text: #666, #999
Success: #4caf50
Error: #c62828
Link: #667eea
```

## Components

### `src/components/`
- **Hero.tsx** - Welcome section with call-to-action buttons
- **LoadingSkeleton.tsx** - Animated skeleton for loading states

### `src/pages/`
- **VacancyList.tsx** - Main jobs listing page
- **VacancyDetail.tsx** - Individual job details
- **Login.tsx** - Authentication page
- **UploadResume.tsx** - CV upload page

### `src/contexts/`
- **AuthContext.tsx** - Global authentication state

### `src/services/`
- **api.ts** - Axios instance with interceptors
- **auth.ts** - Authentication API calls
- **jobs.ts** - Job listing API calls

## Styling

All styles are in `src/styles.css` with:
- Modern color palette
- Responsive grid layouts
- Smooth transitions and hover effects
- Mobile-friendly breakpoints (@media 768px)

## React Query Usage

The app uses TanStack Query v5 with the new object-based API:

```typescript
// Correct v5 syntax
const { data, isLoading, error } = useQuery({
  queryKey: ['jobs'],
  queryFn: getJobs,
})

// ❌ OLD v4 syntax (DO NOT USE)
const { data, isLoading, error } = useQuery(['jobs'], getJobs)
```

## Running the Application

### Prerequisites
- Node.js 16+ and npm
- Go 1.19+ (for backend)

### Development Mode

**Terminal 1 - Backend (Go)**
```powershell
cd C:\Users\aniar\GolandProjects\Diplomayin
go run main.go
```

**Terminal 2 - Frontend**
```powershell
cd C:\Users\aniar\GolandProjects\Diplomayin\frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build
```powershell
cd frontend
npm run build
npm run preview
```

## API Integration

The frontend communicates with the backend at `http://localhost:8088`:

### Endpoints Used
- `GET /jobs` - Get all job listings
- `POST /login` - User authentication
- `POST /upload-cv` - Upload resume
- `GET /recommended-jobs?user_id=123` - Get AI-recommended jobs

### CORS Configuration
The Vite dev server includes a proxy for `/api` requests to prevent CORS issues:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8088',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```

## Key Features Implementation

### Search Functionality
```typescript
const filteredJobs = data?.filter(job =>
  job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  job.company.toLowerCase().includes(searchTerm.toLowerCase())
) || []
```

### File Upload Validation
```typescript
const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const maxSize = 10 * 1024 * 1024 // 10MB
```

### Authentication
JWT tokens are stored in localStorage and automatically included in all API requests via interceptors.

## Future Enhancements

- [ ] Recommended jobs dashboard
- [ ] User profile page
- [ ] Job favorites/bookmarks
- [ ] Advanced filtering (salary range, location, skills)
- [ ] Dark mode support
- [ ] Email notifications
- [ ] Mobile app version

## Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.14.1",
  "@tanstack/react-query": "^5.7.0",
  "axios": "^1.5.0",
  "typescript": "^5.1.6",
  "vite": "^5.2.0"
}
```

## Troubleshooting

### Blank screen / Nothing loads
1. Check browser console for errors
2. Ensure backend is running on :8088
3. Clear browser cache and refresh
4. Check that `npm run dev` is running

### API errors
1. Make sure `go run main.go` is executing in the Diplomayin root folder
2. Check database connection in Go backend
3. Verify CORS is handled (use proxy or enable CORS in backend)

### React Query errors
- Make sure to use v5 syntax (object-based, not array-based)
- Check that `QueryClientProvider` wraps your components
- Look for `queryKey` and `queryFn` properties

## Contributing

When making changes:
1. Follow the existing code style
2. Update this documentation
3. Test on mobile and desktop
4. Use semantic HTML and accessibility practices
5. Keep components small and reusable

---

**Last Updated**: March 2024
**Version**: 1.0.0

