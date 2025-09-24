import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await employeeAPI.getAll();
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="user-management">
            <div className="page-header">
                <h1>User Management</h1>
                <button className="btn primary">Add New User</button>
            </div>
            
            <div className="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-info">
                                        <strong>{user.name}</strong>
                                        <span>{user.email}</span>
                                    </div>
                                </td>
                                <td>{user.role}</td>
                                <td>
                                    <span className={`status-badge ${user.status}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn sm">Edit</button>
                                    <button className="btn sm danger">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;