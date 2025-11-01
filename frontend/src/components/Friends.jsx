import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, UserMinus, Search, UserCheck, Clock, 
  X, Check, Mail, MessageCircle, Trash2, Send 
} from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Friends = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('friends'); // friends, pending, search
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
    fetchSentRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/friend-request/friends');
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axiosInstance.get('/friend-request/getpending-request');
      setPendingRequests(response.data.pendingReqs || []);
    } catch (error) {
      if (error.response?.status !== 400) {
        console.error('Error fetching pending requests:', error);
      }
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await axiosInstance.get('/friend-request/sent-requests');
      setSentRequests(response.data.sentRequests || []);
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setSearching(true);
    try {
      const response = await axiosInstance.get(`/friend-request/search?query=${searchQuery}`);
      setSearchResults(response.data.users || []);
    } catch (error) {
      toast.error('Search failed');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (targetId) => {
    try {
      await axiosInstance.post(`/friend-request/send-request/${targetId}`);
      toast.success('Friend request sent!');
      
      // Update UI - remove from search results or mark as sent
      setSearchResults(prev => 
        prev.map(user => 
          user._id === targetId 
            ? { ...user, requestSent: true }
            : user
        )
      );
      
      fetchSentRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axiosInstance.put('/friend-request/accept-request', { reqId: requestId });
      toast.success('Friend request accepted!');
      fetchFriends();
      fetchPendingRequests();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axiosInstance.delete(`/friend-request/delete-request/${requestId}`);
      toast.success('Friend request rejected');
      fetchPendingRequests();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleCancelRequest = async (targetId, requestId) => {
    try {
      await axiosInstance.delete(`/friend-request/cancel-request/${targetId}/${requestId}`);
      toast.success('Request cancelled');
      fetchSentRequests();
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/friend-request/remove-friend/${friendId}`);
      toast.success('Friend removed');
      fetchFriends();
    } catch (error) {
      toast.error('Failed to remove friend');
    }
  };

  const handleMessage = (friendId) => {
    navigate('/messenger');
    // You can add logic to auto-select this friend in messenger
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="w-8 h-8 text-primary" />
                Friends
              </h1>
              <p className="text-sm opacity-70 mt-1">
                Manage your friends and connections
              </p>
            </div>
            <div className="stats shadow">
              <div className="stat place-items-center">
                <div className="stat-title">Friends</div>
                <div className="stat-value text-primary">{friends.length}</div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Pending</div>
                <div className="stat-value text-secondary">{pendingRequests.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="tabs tabs-boxed bg-base-100 p-1 shadow-md">
          <button
            className={`tab gap-2 ${activeTab === 'friends' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <Users size={18} />
            Friends ({friends.length})
          </button>
          <button
            className={`tab gap-2 ${activeTab === 'pending' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <Clock size={18} />
            Requests ({pendingRequests.length})
          </button>
          <button
            className={`tab gap-2 ${activeTab === 'search' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <UserPlus size={18} />
            Add Friends
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div>
              {loading ? (
                <div className="flex justify-center py-20">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-20 bg-base-100 rounded-lg shadow-md">
                  <Users className="w-20 h-20 mx-auto mb-4 opacity-30" />
                  <h3 className="text-2xl font-bold mb-2">No Friends Yet</h3>
                  <p className="text-sm opacity-70 mb-6">
                    Start adding friends to connect with others!
                  </p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="btn btn-primary gap-2"
                  >
                    <UserPlus size={18} />
                    Add Friends
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all"
                    >
                      <div className="card-body">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img
                                  src={friend.profilePic || '/avatar.png'}
                                  alt={friend.fullName}
                                />
                              </div>
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{friend.fullName}</h3>
                              <p className="text-sm opacity-70 flex items-center gap-1">
                                <Mail size={12} />
                                {friend.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="card-actions justify-end mt-4">
                          <button
                            onClick={() => handleMessage(friend._id)}
                            className="btn btn-primary btn-sm gap-2"
                          >
                            <MessageCircle size={16} />
                            Message
                          </button>
                          <button
                            onClick={() => handleRemoveFriend(friend._id)}
                            className="btn btn-error btn-sm btn-outline gap-2"
                          >
                            <UserMinus size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pending Requests Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {/* Received Requests */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <UserCheck size={20} />
                  Received Requests
                </h2>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12 bg-base-100 rounded-lg">
                    <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="opacity-70">No pending requests</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingRequests.map((request) => (
                      <div
                        key={request._id}
                        className="card bg-base-100 shadow-md"
                      >
                        <div className="card-body">
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-12 h-12 rounded-full">
                                <img
                                  src={request.requestSender?.profilePic || '/avatar.png'}
                                  alt={request.requestSender?.fullName}
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">
                                {request.requestSender?.fullName}
                              </h3>
                              <p className="text-xs opacity-70">
                                {request.requestSender?.email}
                              </p>
                            </div>
                          </div>
                          <div className="card-actions justify-end mt-3">
                            <button
                              onClick={() => handleAcceptRequest(request._id)}
                              className="btn btn-success btn-sm gap-2"
                            >
                              <Check size={16} />
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request._id)}
                              className="btn btn-error btn-sm gap-2"
                            >
                              <X size={16} />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Send size={20} />
                  Sent Requests
                </h2>
                {sentRequests.length === 0 ? (
                  <div className="text-center py-12 bg-base-100 rounded-lg">
                    <Send className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="opacity-70">No sent requests</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sentRequests.map((request) => (
                      <div
                        key={request._id}
                        className="card bg-base-100 shadow-md"
                      >
                        <div className="card-body">
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-12 h-12 rounded-full">
                                <img
                                  src={request.requestRecipient?.profilePic || '/avatar.png'}
                                  alt={request.requestRecipient?.fullName}
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">
                                {request.requestRecipient?.fullName}
                              </h3>
                              <p className="text-xs opacity-70">
                                {request.requestRecipient?.email}
                              </p>
                              <span className="badge badge-warning badge-sm mt-1">
                                Pending
                              </span>
                            </div>
                          </div>
                          <div className="card-actions justify-end mt-3">
                            <button
                              onClick={() => handleCancelRequest(
                                request.requestRecipient._id,
                                request._id
                              )}
                              className="btn btn-ghost btn-sm gap-2"
                            >
                              <X size={16} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div>
              <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                  <h2 className="card-title">Find Friends</h2>
                  <p className="text-sm opacity-70 mb-4">
                    Search by name or email to find and add friends
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="input input-bordered w-full pl-10"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      disabled={searching || !searchQuery.trim()}
                      className="btn btn-primary gap-2"
                    >
                      <Search size={18} />
                      {searching ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Results - Only show after search is clicked */}
              {searchResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">
                    Search Results ({searchResults.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((user) => {
                      const isSelf = user._id === authUser._id;
                      const isFriend = friends.some(f => f._id === user._id);
                      const hasPendingRequest = pendingRequests.some(
                        r => r.requestSender._id === user._id
                      );
                      const hasSentRequest = sentRequests.some(
                        r => r.requestRecipient._id === user._id
                      ) || user.requestSent;

                      return (
                        <div
                          key={user._id}
                          className="card bg-base-100 shadow-md hover:shadow-lg transition"
                        >
                          <div className="card-body">
                            <div className="flex items-center gap-3">
                              <div className="avatar">
                                <div className="w-14 h-14 rounded-full">
                                  <img
                                    src={user.profilePic || '/avatar.png'}
                                    alt={user.fullName}
                                  />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold truncate">
                                  {user.fullName}
                                  {isSelf && <span className="text-xs ml-2 opacity-70">(You)</span>}
                                </h3>
                                <p className="text-xs opacity-70 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <div className="card-actions justify-end mt-3">
                              {isSelf ? (
                                <button className="btn btn-ghost btn-sm" disabled>
                                  That's You!
                                </button>
                              ) : isFriend ? (
                                <button className="btn btn-success btn-sm" disabled>
                                  <UserCheck size={16} />
                                  Friends
                                </button>
                              ) : hasPendingRequest ? (
                                <button className="btn btn-info btn-sm" disabled>
                                  <Clock size={16} />
                                  Respond in Requests
                                </button>
                              ) : hasSentRequest ? (
                                <button className="btn btn-warning btn-sm" disabled>
                                  <Clock size={16} />
                                  Request Sent
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSendRequest(user._id)}
                                  className="btn btn-primary btn-sm gap-2"
                                >
                                  <UserPlus size={16} />
                                  Add Friend
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;