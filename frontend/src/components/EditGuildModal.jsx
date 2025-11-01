import React, { useState, useEffect } from 'react';
import { X, Upload, Save, Trash2 } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import { useGuildStore } from '../store/useGuildStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const EditGuildModal = ({ isOpen, onClose, guild }) => {
    const navigate = useNavigate();
    const { getGuildByName, deleteGuild } = useGuildStore();

    const [formData, setFormData] = useState({
        guildName: '',
        guildIcon: '',
        guildType: 'public'
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (guild) {
            setFormData({
                guildName: guild.guildName || '',
                guildIcon: guild.guildIcon || '',
                guildType: guild.guildType || 'public'
            });
            setPreview(guild.guildIcon || null);
        }
    }, [guild]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            setPreview(base64);
            setFormData({ ...formData, guildIcon: base64 });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.guildName.trim()) {
            toast.error('Guild name is required');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.put(`/guild/update/${guild._id}`, {
                guildName: formData.guildName,
                guildIcon: formData.guildIcon,
                guildType: formData.guildType
            });

            toast.success('Guild updated successfully!');

            // Refresh guild data
            await getGuildByName(formData.guildName);

            // If name changed, navigate to new URL
            if (formData.guildName !== guild.guildName) {
                navigate(`/${formData.guildName}`);
            }

            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update guild');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGuild = async () => {
        setLoading(true);
        try {
            await deleteGuild(guild._id);
            toast.success('Guild deleted successfully');
            navigate('/');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete guild');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300">
                    <h2 className="text-xl font-bold">Edit Guild</h2>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Guild Icon */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Guild Icon</span>
                        </label>
                        <div className="flex flex-col items-center gap-4">
                            <div className="avatar">
                                <div className="w-32 h-32 rounded-lg">
                                    <img
                                        src={preview || 'https://via.placeholder.com/150'}
                                        alt="Guild icon preview"
                                    />
                                </div>
                            </div>
                            <label className="btn btn-sm btn-outline gap-2">
                                <Upload size={16} />
                                Upload Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-xs opacity-70 text-center">
                                Max size: 5MB. Recommended: 512x512px
                            </p>
                        </div>
                    </div>

                    {/* Guild Name */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Guild Name</span>
                        </label>
                        <input
                            type="text"
                            value={formData.guildName}
                            onChange={(e) => setFormData({ ...formData, guildName: e.target.value })}
                            placeholder="Enter guild name"
                            className="input input-bordered w-full"
                            required
                        />
                    </div>

                    {/* Guild Type */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Guild Type</span>
                        </label>
                        <select
                            value={formData.guildType}
                            onChange={(e) => setFormData({ ...formData, guildType: e.target.value })}
                            className="select select-bordered w-full"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <label className="label">
                            <span className="label-text-alt">
                                {formData.guildType === 'public'
                                    ? 'Anyone can join this guild'
                                    : 'Only invited members can join'}
                            </span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary flex-1 gap-2"
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {/* Danger Zone */}
                <div className="p-4 border-t border-base-300">
                    <div className="alert alert-error">
                        <div className="flex-1">
                            <h3 className="font-bold">Danger Zone</h3>
                            <p className="text-sm">Deleting the guild is permanent and cannot be undone.</p>
                        </div>
                    </div>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="btn btn-error btn-outline w-full mt-3 gap-2"
                            disabled={loading}
                        >
                            <Trash2 size={18} />
                            Delete Guild
                        </button>
                    ) : (
                        <div className="mt-3 space-y-2">
                            <p className="text-sm font-semibold text-center">
                                Are you sure? This action cannot be undone!
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDeleteGuild}
                                    disabled={loading}
                                    className="btn btn-error flex-1"
                                >
                                    {loading ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="btn btn-ghost flex-1"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditGuildModal;