import React from 'react';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

const HallOfFame = ({ leaderboard }) => {
    // Get top 3 members sorted by position
    const topThree = leaderboard
        ?.filter(entry => entry.position <= 3)
        ?.sort((a, b) => a.position - b.position) || [];

    if (topThree.length === 0) {
        return null;
    }

    const getPositionIcon = (position) => {
        switch (position) {
            case 1: return <Crown className="w-8 h-8 text-warning" />;
            case 2: return <Medal className="w-7 h-7 text-base-content/70" />;
            case 3: return <Award className="w-6 h-6 text-warning/60" />;
            default: return null;
        }
    };

    const getPositionClass = (position) => {
        switch (position) {
            case 1: return 'col-span-2 row-span-2 scale-110 z-10';
            case 2: return 'col-span-1';
            case 3: return 'col-span-1';
            default: return '';
        }
    };

    const getPositionGradient = (position) => {
        switch (position) {
            case 1: return 'from-warning/20 via-warning/10 to-transparent';
            case 2: return 'from-base-content/10 via-base-content/5 to-transparent';
            case 3: return 'from-warning/10 via-warning/5 to-transparent';
            default: return '';
        }
    };

    return (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-warning/10 rounded-lg">
                    <Trophy className="w-6 h-6 text-warning" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Hall of Fame</h2>
                    <p className="text-sm text-base-content/60">Top performers in the guild</p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 items-end">
                {/* 2nd Place */}
                {topThree[1] && (
                    <div className={`${getPositionClass(2)} transform hover:scale-105 transition-all`}>
                        <div className={`bg-gradient-to-br ${getPositionGradient(2)} bg-base-100 rounded-2xl p-6 shadow-xl border-2 border-base-300 h-full`}>
                            <div className="flex flex-col items-center space-y-4">
                                {/* Position Badge */}
                                <div className="relative">
                                    <div className="absolute -top-3 -right-3 bg-base-100 rounded-full p-2 shadow-lg border-2 border-base-300">
                                        {getPositionIcon(2)}
                                    </div>
                                    <div className="avatar">
                                        <div className="w-20 h-20 rounded-full ring-4 ring-base-content/20 ring-offset-base-100 ring-offset-2">
                                            <img
                                                src={topThree[1].userId?.profilePic || '/avatar.png'}
                                                alt={topThree[1].gamerTag}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="text-center">
                                    <div className="font-bold text-lg">{topThree[1].gamerTag}</div>
                                    <div className="text-xs opacity-70">{topThree[1].userId?.fullName}</div>
                                    <div className="badge badge-sm mt-2">2nd Place</div>
                                </div>

                                {/* Badges Preview */}
                                {topThree[1].badges?.length > 0 && (
                                    <div className="flex gap-1 flex-wrap justify-center">
                                        {topThree[1].badges.slice(0, 3).map((badge, idx) => (
                                            <div key={idx} className="avatar">
                                                <div className="w-6 h-6 rounded">
                                                    <img src={badge.badgeImage} alt={badge.badgeName} />
                                                </div>
                                            </div>
                                        ))}
                                        {topThree[1].badges.length > 3 && (
                                            <div className="text-xs opacity-70">+{topThree[1].badges.length - 3}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 1st Place - Center and Larger */}
                {topThree[0] && (
                    <div className={`${getPositionClass(1)} transform hover:scale-105 transition-all`}>
                        <div className={`bg-gradient-to-br ${getPositionGradient(1)} bg-base-100 rounded-2xl p-8 shadow-2xl border-2 border-warning/30 h-full relative overflow-hidden`}>
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-warning/5 to-transparent animate-shimmer" />

                            <div className="flex flex-col items-center space-y-4 relative z-10">
                                {/* Crown */}
                                <div className="relative">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
                                        <Crown className="w-12 h-12 text-warning drop-shadow-lg" />
                                    </div>
                                    <div className="avatar mt-4">
                                        <div className="w-28 h-28 rounded-full ring-4 ring-warning ring-offset-base-100 ring-offset-4 shadow-xl">
                                            <img
                                                src={topThree[0].userId?.profilePic || '/avatar.png'}
                                                alt={topThree[0].gamerTag}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="text-center">
                                    <div className="font-black text-2xl bg-gradient-to-r from-warning via-warning/80 to-warning bg-clip-text text-transparent">
                                        {topThree[0].gamerTag}
                                    </div>
                                    <div className="text-sm opacity-70">{topThree[0].userId?.fullName}</div>
                                    <div className="badge badge-warning badge-lg mt-3 shadow-lg">
                                        🏆 Champion
                                    </div>
                                </div>

                                {/* Badges Preview */}
                                {topThree[0].badges?.length > 0 && (
                                    <div className="flex gap-2 flex-wrap justify-center">
                                        {topThree[0].badges.slice(0, 4).map((badge, idx) => (
                                            <div key={idx} className="avatar">
                                                <div className="w-8 h-8 rounded ring-2 ring-warning/30">
                                                    <img src={badge.badgeImage} alt={badge.badgeName} />
                                                </div>
                                            </div>
                                        ))}
                                        {topThree[0].badges.length > 4 && (
                                            <div className="text-sm opacity-70">+{topThree[0].badges.length - 4}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                    <div className={`${getPositionClass(3)} transform hover:scale-105 transition-all`}>
                        <div className={`bg-gradient-to-br ${getPositionGradient(3)} bg-base-100 rounded-2xl p-6 shadow-xl border-2 border-base-300 h-full`}>
                            <div className="flex flex-col items-center space-y-4">
                                {/* Position Badge */}
                                <div className="relative">
                                    <div className="absolute -top-3 -right-3 bg-base-100 rounded-full p-2 shadow-lg border-2 border-base-300">
                                        {getPositionIcon(3)}
                                    </div>
                                    <div className="avatar">
                                        <div className="w-20 h-20 rounded-full ring-4 ring-base-content/20 ring-offset-base-100 ring-offset-2">
                                            <img
                                                src={topThree[2].userId?.profilePic || '/avatar.png'}
                                                alt={topThree[2].gamerTag}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="text-center">
                                    <div className="font-bold text-lg">{topThree[2].gamerTag}</div>
                                    <div className="text-xs opacity-70">{topThree[2].userId?.fullName}</div>
                                    <div className="badge badge-sm mt-2">3rd Place</div>
                                </div>

                                {/* Badges Preview */}
                                {topThree[2].badges?.length > 0 && (
                                    <div className="flex gap-1 flex-wrap justify-center">
                                        {topThree[2].badges.slice(0, 3).map((badge, idx) => (
                                            <div key={idx} className="avatar">
                                                <div className="w-6 h-6 rounded">
                                                    <img src={badge.badgeImage} alt={badge.badgeName} />
                                                </div>
                                            </div>
                                        ))}
                                        {topThree[2].badges.length > 3 && (
                                            <div className="text-xs opacity-70">+{topThree[2].badges.length - 3}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }
            `}</style>
        </div>
    );
};

export default HallOfFame;