import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserMinus, Crown, Shield, Video, User, Search } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import { useGuildStore } from '../store/useGuildStore';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const ManageMembersModal = ({ isOpen, onClose, guild, isViceGM = false }) => {
    const { getGuildByName } = useGuildStore();
    const { authUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState('members');
    const [searchQuery, setSearchQuery] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState({});

    useEffect(() => {
        if (isOpen && activeTab === 'invite') {
            fetchUsers();
        }
    }, [isOpen, activeTab]);

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/message/users');
            setAllUsers(response.data);
        } catch (error) {
            toast.error('Failed to fetch users');
            console.log(error);
            
        }
    };

    const handleAssignRole = async (memberId, role) => {
        if (memberId === authUser._id) {
            toast.error("Cannot change your own role");
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.put(`/guild/assignrole/${guild._id}/${memberId}`, { role });
            toast.success('Role updated successfully');
            await getGuildByName(guild.guildName);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign role');
        } finally {
            setLoading(false);
        }
    };

    const handleKickMember = async (memberId) => {
        if (memberId === authUser._id) {
            toast.error("Cannot kick yourself");
            return;
        }

        if (!window.confirm('Are you sure you want to kick this member?')) {
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.delete(`/guild/kick/${guild._id}/${memberId}`);
            toast.success('Member kicked successfully');
            await getGuildByName(guild.guildName);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to kick member');
        } finally {
            setLoading(false);
        }
    };

    const handleInviteMembers = async () => {
        const selectedUsers = allUsers.filter(user =>
            document.getElementById(`user-${user._id}`)?.checked
        );

        if (selectedUsers.length === 0) {
            toast.error('Please select at least one user');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.put(`/guild/addmembers/${guild._id}`, {
                userIds: selectedUsers.map(u => u._id)
            });
            toast.success(`${selectedUsers.length} member(s) invited successfully`);
            await getGuildByName(guild.guildName);
            setActiveTab('members');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to invite members');
        } finally {
            setLoading(false);
        }
    };

    const getRoleIcon = (role) => {
        const icons = {
            'GuildMaster': Crown,
            'Vice-GuildMaster': Shield,
            'Streamer': Video,
            'GuildMember': User
        };
        return icons[role] || User;
    };

    const getRoleColor = (role) => {
        const colors = {
            'GuildMaster': 'text-warning',
            'Vice-GuildMaster': 'text-info',
            'Streamer': 'text-secondary',
            'GuildMember': 'text-base-content'
        };
        return colors[role] || 'text-base-content';
    };

    const filteredMembers = guild?.members?.filter(member =>
        member.member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.member.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const availableUsers = allUsers.filter(user =>
        !guild?.members?.some(m => m.member._id === user._id)
    ).filter(user =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300">
                    <h2 className="text-xl font-bold">Manage Members</h2>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="tabs tabs-boxed m-4">
                    <button
                        className={`tab ${activeTab === 'members' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('members')}
                    >
                        Members ({guild?.members?.length || 0})
                    </button>
                    {!isViceGM && (
                        <button
                            className={`tab ${activeTab === 'invite' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('invite')}
                        >
                            <UserPlus size={16} className="mr-1" />
                            Invite
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="px-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input input-bordered w-full pl-10"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'members' ? (
                        <div className="space-y-2">
                            {filteredMembers.map((member) => {
                                const RoleIcon = getRoleIcon(member.role);
                                const isCurrentUser = member.member._id === authUser._id;
                                const canModify = !isViceGM && !isCurrentUser && member.role !== 'GuildMaster';

                                return (
                                    <div
                                        key={member.member._id}
                                        className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="avatar">
                                                <div className="w-10 h-10 rounded-full">
                                                    <img
                                                        src={member.member.profilePic || '/avatar.png'}
                                                        alt={member.member.fullName}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold truncate">
                                                    {member.member.fullName}
                                                    {isCurrentUser && <span className="text-xs ml-2 opacity-70">(You)</span>}
                                                </div>
                                                <div className="text-xs opacity-70 truncate">{member.member.email}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {canModify ? (
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleAssignRole(member.member._id, e.target.value)}
                                                    disabled={loading}
                                                    className="select select-sm select-bordered"
                                                >
                                                    <option value="GuildMember">Member</option>
                                                    <option value="Streamer">Streamer</option>
                                                    <option value="Vice-GuildMaster">Vice GM</option>
                                                    {!isViceGM && <option value="GuildMaster">Guild Master</option>}
                                                </select>
                                            ) : (
                                                <div className={`flex items-center gap-1 ${getRoleColor(member.role)}`}>
                                                    <RoleIcon size={16} />
                                                    <span className="text-sm font-semibold">
                                                        {member.role.replace('Guild', '').replace('-', ' ')}
                                                    </span>
                                                </div>
                                            )}

                                            {canModify && (
                                                <button
                                                    onClick={() => handleKickMember(member.member._id)}
                                                    disabled={loading}
                                                    className="btn btn-error btn-sm btn-circle"
                                                    title="Kick member"
                                                >
                                                    <UserMinus size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredMembers.length === 0 && (
                                <div className="text-center py-12 opacity-70">
                                    <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No members found</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {availableUsers.map((user) => (
                                <label
                                    key={user._id}
                                    className="flex items-center gap-3 p-3 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 transition"
                                >
                                    <input
                                        type="checkbox"
                                        id={`user-${user._id}`}
                                        className="checkbox checkbox-primary"
                                    />
                                    <div className="avatar">
                                        <div className="w-10 h-10 rounded-full">
                                            <img
                                                src={user.profilePic || '/avatar.png'}
                                                alt={user.fullName}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold truncate">{user.fullName}</div>
                                        <div className="text-xs opacity-70 truncate">{user.email}</div>
                                    </div>
                                </label>
                            ))}

                            {availableUsers.length === 0 && (
                                <div className="text-center py-12 opacity-70">
                                    <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>
                                        {allUsers.length === 0
                                            ? 'Loading users...'
                                            : 'No users available to invite'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {activeTab === 'invite' && availableUsers.length > 0 && (
                    <div className="p-4 border-t border-base-300">
                        <button
                            onClick={handleInviteMembers}
                            disabled={loading}
                            className="btn btn-primary w-full gap-2"
                        >
                            <UserPlus size={18} />
                            {loading ? 'Inviting...' : 'Invite Selected Members'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageMembersModal;