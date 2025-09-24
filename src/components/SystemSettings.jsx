import React, { useState } from 'react';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        defaultIssueType: 'Task',
        defaultPriority: 'Medium',
        enableGuestAccess: false,
        requireMFA: true
    });

    const handleSave = () => {
        // Save settings logic
        console.log('Saving settings:', settings);
    };

    return (
        <div className="system-settings">
            <div className="page-header">
                <h1>System Settings</h1>
                <button className="btn primary" onClick={handleSave}>
                    Save Settings
                </button>
            </div>

            <div className="settings-grid">
                <div className="setting-group">
                    <label>Default Issue Type</label>
                    <select 
                        value={settings.defaultIssueType}
                        onChange={(e) => setSettings({...settings, defaultIssueType: e.target.value})}
                    >
                        <option value="Task">Task</option>
                        <option value="Bug">Bug</option>
                        <option value="Feature">Feature</option>
                    </select>
                </div>

                <div className="setting-group">
                    <label>Default Priority</label>
                    <select 
                        value={settings.defaultPriority}
                        onChange={(e) => setSettings({...settings, defaultPriority: e.target.value})}
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>

                <div className="setting-group checkbox">
                    <label>
                        <input 
                            type="checkbox" 
                            checked={settings.enableGuestAccess}
                            onChange={(e) => setSettings({...settings, enableGuestAccess: e.target.checked})}
                        />
                        Enable Guest Access
                    </label>
                </div>

                <div className="setting-group checkbox">
                    <label>
                        <input 
                            type="checkbox" 
                            checked={settings.requireMFA}
                            onChange={(e) => setSettings({...settings, requireMFA: e.target.checked})}
                        />
                        Require Multi-Factor Authentication
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;