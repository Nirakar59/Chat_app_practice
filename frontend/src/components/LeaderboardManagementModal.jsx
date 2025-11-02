import React, { useState, useEffect } from 'react';
import { X, Plus, ChevronUp, ChevronDown, Trash2, Award, Upload, Medal, Save } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const LeaderboardManagementModal = ({ isOpen, onClose, guild, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('leaderboard'); // leaderboard, badges, manage-badges
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Add Entry Form
    const [newEntry, setNewEntry] = useState({ userId: '', gamerTag: '' });

    // Create Badge Form
    const [newBadge, setNewBadge] = useState({ name: '', description: '', image: '' });
    const [badgePreview, setBadgePreview] = useState(null);

    useEffect(() => {
        if (isOpen && guild) {
            fetchLeaderboard();
        }
    }, [isOpen, guild]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/leaderboard/${guild._id}`);
            setLeaderboardData(res.data.leaderboard);
        } catch (error) {
            toast.error('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const handleAddEntry = async () => {
        if (!newEntry.userId || !newEntry.gamerTag) {
            toast.error('Please select a member and enter a gamer tag');
            return;
        }

        try {
            await axiosInstance.post(`/leaderboard/${guild._id}/entry`, newEntry);
            toast.success('Entry added to leaderboard');
            setNewEntry({ userId: '', gamerTag: '' });
            fetchLeaderboard();
            onUpdate?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add entry');
        }
    };

    const handleMovePosition = async (userId, direction) => {
        try {
            await axiosInstance.put(`/leaderboard/${guild._id}/entry/${userId}/position`, { direction });
            toast.success('Position updated');
            fetchLeaderboard();
            onUpdate?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update position');
        }
    };

    const handleRemoveEntry = async (userId) => {
        if (!window.confirm('Remove this entry from leaderboard?')) return;

        try {
            await axiosInstance.delete(`/leaderboard/${guild._id}/entry/${userId}`);
            toast.success('Entry removed');
            fetchLeaderboard();
            onUpdate?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove entry');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            setBadgePreview(base64);
            setNewBadge({ ...newBadge, image: base64 });
        };
        reader.readAsDataURL(file);
    };

    const handleCreateBadge = async () => {
        if (!newBadge.name || !newBadge.image) {
            toast.error('Badge name and image are required');
            return;
        }

        try {
            await axiosInstance.post(`/leaderboard/${guild._id}/badge`, newBadge);
            toast.success('Badge created successfully');
            setNewBadge({ name: '', description: '', image: '' });
            setBadgePreview(null);
            fetchLeaderboard();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create badge');
        }
    };

    const handleAwardBadge = async (userId, badgeId) => {
        try {
            await axiosInstance.post(`/leaderboard/${guild._id}/badge/award/${userId}`, { badgeId });
            toast.success('Badge awarded');
            fetchLeaderboard();
            onUpdate?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to award badge');
        }
    };

    const handleRemoveBadge = async (userId, badgeId) => {
        try {
            await axiosInstance.delete(`/leaderboard/${guild._id}/badge/${badgeId}/user/${userId}`);
            toast.success('Badge removed');
            fetchLeaderboard();
            onUpdate?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove badge');
        }
    };

    if (!isOpen) return null;

    const sortedLeaderboard = leaderboardData?.leaderboard?.sort((a, b) => a.position - b.position) || [];
    const availableMembers = guild?.members?.filter(
        m => !sortedLeaderboard.some(entry => entry.userId?._id === m.member._id)
    ) || [];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300">
                    <h2 className="text-xl font-bold">Leaderboard Management</h2>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="tabs tabs-boxed m-4">
                    <button
                        className={`tab ${activeTab === 'leaderboard' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('leaderboard')}
                    >
                        Leaderboard
                    </button>
                    <button
                        className={`tab ${activeTab === 'badges' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('badges')}
                    >
                        Create Badges
                    </button>
                    <button
                        className={`tab ${activeTab === 'manage-badges' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('manage-badges')}
                    >
                        Award Badges
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : (
                        <>
                            {/* Leaderboard Tab */}
                            {activeTab === 'leaderboard' && (
                                <div className="space-y-6">
                                    {/* Add Entry Form */}
                                    <div className="bg-base-200 rounded-lg p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Plus size={18} />
                                            Add Member to Leaderboard
                                        </h3>
                                        <div className="flex gap-2">
                                            <select
                                                value={newEntry.userId}
                                                onChange={(e) => setNewEntry({ ...newEntry, userId: e.target.value })}
                                                className="select select-bordered flex-1"
                                            >
                                                <option value="">Select member...</option>
                                                {availableMembers.map(m => (
                                                    <option key={m.member._id} value={m.member._id}>
                                                        {m.member.fullName}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                value={newEntry.gamerTag}
                                                onChange={(e) => setNewEntry({ ...newEntry, gamerTag: e.target.value })}
                                                placeholder="Gamer Tag"
                                                className="input input-bordered flex-1"
                                            />
                                            <button onClick={handleAddEntry} className="btn btn-primary">
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    {/* Leaderboard List */}
                                    <div className="space-y-2">
                                        {sortedLeaderboard.length === 0 ? (
                                            <div className="text-center py-12 opacity-70">
                                                <Medal className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <p>No entries yet. Add members to get started!</p>
                                            </div>
                                        ) : (
                                            sortedLeaderboard.map((entry) => (
                                                <div
                                                    key={entry._id}
                                                    className="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
                                                >
                                                    <div className="font-bold text-2xl w-8 text-center">
                                                        #{entry.position}
                                                    </div>
                                                    <div className="avatar">
                                                        <div className="w-10 h-10 rounded-full">
                                                            <img
                                                                src={entry.userId?.profilePic || '/avatar.png'}
                                                                alt={entry.gamerTag}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold">{entry.gamerTag}</div>
                                                        <div className="text-xs opacity-70">{entry.userId?.fullName}</div>
                                                    </div>
                                                    {entry.badges?.length > 0 && (
                                                        <div className="flex gap-1">
                                                            {entry.badges.slice(0, 3).map((badge, idx) => (
                                                                <div key={idx} className="avatar">
                                                                    <div className="w-6 h-6 rounded">
                                                                        <img src={badge.badgeImage} alt={badge.badgeName} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleMovePosition(entry.userId._id, 'up')}
                                                            disabled={entry.position === 1}
                                                            className="btn btn-ghost btn-sm btn-circle"
                                                        >
                                                            <ChevronUp size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleMovePosition(entry.userId._id, 'down')}
                                                            disabled={entry.position === sortedLeaderboard.length}
                                                            className="btn btn-ghost btn-sm btn-circle"
                                                        >
                                                            <ChevronDown size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveEntry(entry.userId._id)}
                                                            className="btn btn-error btn-sm btn-circle"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Create Badges Tab */}
                            {activeTab === 'badges' && (
                                <div className="space-y-6">
                                    {/* Create Badge Form */}
                                    <div className="bg-base-200 rounded-lg p-6">
                                        <h3 className="font-semibold mb-4">Create New Badge</h3>

                                        <div className="space-y-4">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="avatar">
                                                    <div className="w-32 h-32 rounded-lg">
                                                        <img
                                                            src={badgePreview || 'https://via.placeholder.com/150'}
                                                            alt="Badge preview"
                                                        />
                                                    </div>
                                                </div>
                                                <label className="btn btn-sm btn-outline gap-2">
                                                    <Upload size={16} />
                                                    Upload Badge Image
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>

                                            <input
                                                type="text"
                                                value={newBadge.name}
                                                onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                                                placeholder="Badge Name"
                                                className="input input-bordered w-full"
                                            />

                                            <textarea
                                                value={newBadge.description}
                                                onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                                                placeholder="Badge Description (optional)"
                                                className="textarea textarea-bordered w-full"
                                                rows="3"
                                            />

                                            <button
                                                onClick={handleCreateBadge}
                                                className="btn btn-primary w-full gap-2"
                                            >
                                                <Save size={18} />
                                                Create Badge
                                            </button>
                                        </div>
                                    </div>

                                    {/* Existing Badges */}
                                    <div>
                                        <h3 className="font-semibold mb-3">Created Badges</h3>
                                        {leaderboardData?.badges?.length === 0 ? (
                                            <div className="text-center py-12 opacity-70">
                                                <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <p>No badges created yet</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {leaderboardData?.badges?.map((badge) => (
                                                    <div key={badge._id} className="card bg-base-200">
                                                        <div className="card-body p-4 items-center text-center">
                                                            <div className="avatar">
                                                                <div className="w-16 h-16 rounded-lg">
                                                                    <img src={badge.image} alt={badge.name} />
                                                                </div>
                                                            </div>
                                                            <h4 className="font-semibold">{badge.name}</h4>
                                                            {badge.description && (
                                                                <p className="text-xs opacity-70">{badge.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Award Badges Tab */}
                            {activeTab === 'manage-badges' && (
                                <div className="space-y-4">
                                    {sortedLeaderboard.length === 0 ? (
                                        <div className="text-center py-12 opacity-70">
                                            <p>Add members to leaderboard first</p>
                                        </div>
                                    ) : (
                                        sortedLeaderboard.map((entry) => (
                                            <div key={entry._id} className="bg-base-200 rounded-lg p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="avatar">
                                                        <div className="w-10 h-10 rounded-full">
                                                            <img
                                                                src={entry.userId?.profilePic || '/avatar.png'}
                                                                alt={entry.gamerTag}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{entry.gamerTag}</div>
                                                        <div className="text-xs opacity-70">#{entry.position}</div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {leaderboardData?.badges?.map((badge) => {
                                                        const hasbadge = entry.badges?.some(
                                                            b => b.badgeId.toString() === badge._id.toString()
                                                        );

                                                        return (
                                                            <button
                                                                key={badge._id}
                                                                onClick={() => {
                                                                    if (hasBadge) {
                                                                        handleRemoveBadge(entry.userId._id, badge._id);
                                                                    } else {
                                                                        handleAwardBadge(entry.userId._id, badge._id);
                                                                    }
                                                                }}
                                                                className={`btn btn-sm gap-2 ${hasbadge ? 'btn-success' : 'btn-outline'
                                                                    }`}
                                                            >
                                                                <div className="avatar">
                                                                    <div className="w-4 h-4 rounded">
                                                                        <img src={badge.image} alt={badge.name} />
                                                                    </div>
                                                                </div>
                                                                {badge.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardManagementModal;