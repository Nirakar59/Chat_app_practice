import React, { useState } from 'react';
import { Megaphone, Pin, Trash2, Plus, X } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const Announcements = ({ announcements, guildId, canManage, onUpdate }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        isPinned: false
    });

    const handleCreate = async () => {
        if (!newAnnouncement.title || !newAnnouncement.content) {
            toast.error('Title and content are required');
            return;
        }

        try {
            await axiosInstance.post(`/leaderboard/${guildId}/announcement`, newAnnouncement);
            toast.success('Announcement created');
            setNewAnnouncement({ title: '', content: '', isPinned: false });
            setShowCreateModal(false);
            onUpdate?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create announcement');
        }
    };

    const handleDelete = async (announcementId) => {
        if (!window.confirm('Delete this announcement?')) return;

        try {
            await axiosInstance.delete(`/leaderboard/${guildId}/announcement/${announcementId}`);
            toast.success('Announcement deleted');
            onUpdate?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete announcement');
        }
    };

    const handleTogglePin = async (announcementId) => {
        try {
            await axiosInstance.put(`/leaderboard/${guildId}/announcement/${announcementId}/pin`);
            toast.success('Pin status updated');
            onUpdate?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update pin status');
        }
    };

    const sortedAnnouncements = [...(announcements || [])]
        .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-info/10 rounded-lg">
                        <Megaphone className="w-6 h-6 text-info" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Announcements</h2>
                        <p className="text-sm text-base-content/60">Important updates from guild leadership</p>
                    </div>
                </div>
                {canManage && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary btn-sm gap-2"
                    >
                        <Plus size={16} />
                        New Announcement
                    </button>
                )}
            </div>

            {sortedAnnouncements.length === 0 ? (
                <div className="text-center py-12 bg-base-100 rounded-lg opacity-70">
                    <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No announcements yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedAnnouncements.map((announcement) => (
                        <div
                            key={announcement._id}
                            className={`card bg-base-100 shadow-md ${announcement.isPinned ? 'ring-2 ring-warning' : ''
                                }`}
                        >
                            <div className="card-body p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {announcement.isPinned && (
                                                <div className="badge badge-warning badge-sm gap-1">
                                                    <Pin size={12} />
                                                    Pinned
                                                </div>
                                            )}
                                            <h3 className="font-bold text-lg">{announcement.title}</h3>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap mb-3">{announcement.content}</p>
                                        <div className="flex items-center gap-3 text-xs opacity-70">
                                            <div className="flex items-center gap-2">
                                                <div className="avatar">
                                                    <div className="w-5 h-5 rounded-full">
                                                        <img
                                                            src={announcement.createdBy?.profilePic || '/avatar.png'}
                                                            alt={announcement.createdBy?.fullName}
                                                        />
                                                    </div>
                                                </div>
                                                <span>{announcement.createdBy?.fullName}</span>
                                            </div>
                                            <span>•</span>
                                            <span>
                                                {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    {canManage && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleTogglePin(announcement._id)}
                                                className={`btn btn-ghost btn-sm btn-circle ${announcement.isPinned ? 'text-warning' : ''
                                                    }`}
                                                title={announcement.isPinned ? 'Unpin' : 'Pin'}
                                            >
                                                <Pin size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(announcement._id)}
                                                className="btn btn-ghost btn-sm btn-circle text-error"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Announcement Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 rounded-lg max-w-lg w-full">
                        <div className="flex items-center justify-between p-4 border-b border-base-300">
                            <h3 className="text-xl font-bold">Create Announcement</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Title</span>
                                </label>
                                <input
                                    type="text"
                                    value={newAnnouncement.title}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                    placeholder="Announcement title"
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Content</span>
                                </label>
                                <textarea
                                    value={newAnnouncement.content}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                    placeholder="Announcement content..."
                                    className="textarea textarea-bordered w-full"
                                    rows="5"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-2">
                                    <input
                                        type="checkbox"
                                        checked={newAnnouncement.isPinned}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isPinned: e.target.checked })}
                                        className="checkbox checkbox-primary"
                                    />
                                    <span className="label-text">Pin this announcement</span>
                                </label>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={handleCreate} className="btn btn-primary flex-1">
                                    Create Announcement
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn btn-ghost"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcements;