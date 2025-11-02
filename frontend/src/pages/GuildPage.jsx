import React, { useEffect, useState } from 'react';
import { useGuildStore } from '../store/useGuildStore';
import { useNavigate, useParams } from 'react-router';
import {
  User,
  Eye,
  MessageCircle,
  Settings,
  Users,
  Crown,
  Shield,
  Video,
  Trophy
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import EditGuildModal from '../components/EditGuildModal';
import ManageMembersModal from '../components/ManageMembersModal';
import LeaderboardManagementModal from '../components/LeaderboardManagementModal';
import HallOfFame from '../components/HallOfFame';
import Announcements from '../components/Announcements';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

const GuildPage = () => {
  const { guildName } = useParams();
  const { selectedGuild, getGuildByName } = useGuildStore();
  const { authUser, socket } = useAuthStore();
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState(null);

  const guild = selectedGuild; // ✅ Declare early

  // ✅ Define helper first
  const fetchLeaderboard = async () => {
    if (!guild?._id) return;
    try {
      const res = await axiosInstance.get(`/leaderboard/${guild._id}`);
      setLeaderboardData(res.data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  // ✅ Fetch guild data when page loads or guildName changes
  useEffect(() => {
    const fetchGuild = async () => {
      setLoading(true);
      await getGuildByName(guildName);
      setLoading(false);
    };
    fetchGuild();
  }, [getGuildByName, guildName]);

  // ✅ Determine user role in guild
  useEffect(() => {
    if (guild && authUser) {
      const member = guild.members?.find(m => m.member._id === authUser._id);
      setUserRole(member?.role || null);
    }
  }, [guild, authUser]);

  // ✅ Fetch leaderboard when guild is available
  useEffect(() => {
    if (guild?._id) {
      fetchLeaderboard();
    }
  }, [guild?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!guild) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Guild Not Found</h2>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isGuildMaster = userRole === 'GuildMaster';
  const isViceGuildMaster = userRole === 'Vice-GuildMaster';
  const isStreamer = userRole === 'Streamer';
  const canManage = isGuildMaster || isViceGuildMaster;

  // ✅ Handle actions
  const handleJoinChat = () => navigate('guildchat');

  const handleStartStream = () => {
    if (!isStreamer && !isGuildMaster) {
      toast.error('Only Streamers and GuildMaster can start streams');
      return;
    }
    navigate('/stream/start', {
      state: {
        guildId: guild._id,
        guildName: guild.guildName,
        streamType: 'Guild-Based'
      }
    });
  };

  const getRoleBadge = (role) => {
    const badges = {
      'GuildMaster': { icon: Crown, color: 'badge-warning', label: 'Guild Master' },
      'Vice-GuildMaster': { icon: Shield, color: 'badge-info', label: 'Vice GM' },
      'Streamer': { icon: Video, color: 'badge-secondary', label: 'Streamer' },
      'GuildMember': { icon: User, color: 'badge-ghost', label: 'Member' }
    };
    const badge = badges[role] || badges['GuildMember'];
    const Icon = badge.icon;
    return (
      <span className={`badge ${badge.color} gap-1`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Guild Info */}
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-20 h-20 rounded-lg">
                  <img
                    src={guild.guildIcon || 'https://via.placeholder.com/150'}
                    alt={guild.guildName}
                  />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{guild.guildName}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="badge badge-primary">{guild.guildType}</span>
                  {userRole && getRoleBadge(userRole)}
                  <span className="text-sm opacity-70">
                    {guild.members?.length || 0} members
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button onClick={handleJoinChat} className="btn btn-primary gap-2">
                <MessageCircle size={18} /> Guild Chat
              </button>

              {(isStreamer || isGuildMaster) && (
                <button
                  onClick={handleStartStream}
                  className="btn btn-secondary gap-2"
                >
                  <Video size={18} /> Start Stream
                </button>
              )}

              {canManage && (
                <button
                  onClick={() => setShowMembersModal(true)}
                  className="btn btn-ghost gap-2"
                >
                  <Users size={18} /> Manage
                </button>
              )}

              {isGuildMaster && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn btn-ghost gap-2"
                >
                  <Settings size={18} /> Edit
                </button>
              )}

              {canManage && (
                <button
                  onClick={() => setShowLeaderboardModal(true)}
                  className="btn btn-accent gap-2"
                >
                  <Trophy size={18} /> Leaderboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Streams Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Video className="w-6 h-6" /> Guild Streams
          </h2>

          {guild.streams && guild.streams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guild.streams.map((stream) => (
                <div
                  key={stream._id}
                  onClick={() => navigate(`/stream/${stream._id}`)}
                  className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition"
                >
                  <figure className="aspect-video bg-black relative">
                    <img
                      src={stream.thumbnailUrl || 'https://via.placeholder.com/400x200?text=Live+Stream'}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 badge badge-error gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                    <div className="absolute top-2 right-2 badge badge-ghost gap-1">
                      <Eye size={12} /> {stream.viewerCount}
                    </div>
                  </figure>
                  <div className="card-body">
                    <h3 className="card-title">{stream.title}</h3>
                    <p className="text-sm opacity-70">
                      {stream.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="avatar">
                        <div className="w-6 h-6 rounded-full">
                          <img src={stream.hostId?.profilePic || '/avatar.png'} alt="Host" />
                        </div>
                      </div>
                      <span className="text-sm">{stream.hostId?.fullName || 'Host'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-base-100 rounded-lg">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2 opacity-70">No Active Streams</h3>
              <p className="opacity-50 mb-4">
                {isStreamer || isGuildMaster
                  ? 'Start streaming to engage with guild members!'
                  : 'No one is streaming right now. Check back later!'}
              </p>
              {(isStreamer || isGuildMaster) && (
                <button onClick={handleStartStream} className="btn btn-primary gap-2">
                  <Video size={18} /> Start Streaming
                </button>
              )}
            </div>
          )}
        </div>

        {/* Hall of Fame */}
        {leaderboardData?.leaderboard?.length > 0 && (
          <HallOfFame leaderboard={leaderboardData.leaderboard} />
        )}

        {/* Announcements */}
        <Announcements
          announcements={leaderboardData?.announcements}
          guildId={guild._id}
          canManage={canManage}
          onUpdate={fetchLeaderboard}
        />

        {/* Members Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-6 h-6" /> Guild Members ({guild.members?.length || 0})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {guild.members?.map((member) => (
              <div
                key={member.member._id}
                className="card bg-base-100 shadow-md hover:shadow-lg transition"
              >
                <div className="card-body p-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full">
                        <img
                          src={member.member.profilePic || '/avatar.png'}
                          alt={member.member.fullName}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{member.member.fullName}</h3>
                      <p className="text-xs opacity-70 truncate">{member.member.email}</p>
                    </div>
                  </div>
                  <div className="mt-2">{getRoleBadge(member.role)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isGuildMaster && (
        <>
          <EditGuildModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            guild={guild}
          />
          <ManageMembersModal
            isOpen={showMembersModal}
            onClose={() => setShowMembersModal(false)}
            guild={guild}
          />
        </>
      )}

      {canManage && !isGuildMaster && (
        <ManageMembersModal
          isOpen={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          guild={guild}
          isViceGM={true}
        />
      )}

      {canManage && (
        <LeaderboardManagementModal
          isOpen={showLeaderboardModal}
          onClose={() => setShowLeaderboardModal(false)}
          guild={guild}
          onUpdate={fetchLeaderboard}
        />
      )}
    </div>
  );
};

export default GuildPage;
