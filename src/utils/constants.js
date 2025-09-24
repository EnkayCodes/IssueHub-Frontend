export const API_BASE_URL = 'http://localhost:8000/api';

// Match EXACTLY what's in your Django model
export const STATUS_OPTIONS = [
    { value: 'Open', label: 'Open' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'blocked', label: 'blocked' },
    { value: 'Resolved', label: 'Resolved' }
];

export const PRIORITY_OPTIONS = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },  // ✅ Fixed spelling
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
];

export const DEFAULT_STATUS = 'Open';
export const DEFAULT_PRIORITY = 'Low';