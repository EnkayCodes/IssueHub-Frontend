// API Configuration
export const API_BASE_URL = 'http://localhost:8000/api';

// Status options from your Issue model
export const STATUS_OPTIONS = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
];

// Priority options from your Issue model
export const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
];


// Department options for registration form
export const DEPARTMENT_OPTIONS = [
    'Engineering',
    'Design',
    'Marketing',
    'Sales',
    'Support',
    'HR',
    'Finance',
    'Operations'
];

// Position options
export const POSITION_OPTIONS = [
    'Software Developer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'UI/UX Designer',
    'Project Manager',
    'Quality Assurance',
    'DevOps Engineer',
    'Product Manager'
];