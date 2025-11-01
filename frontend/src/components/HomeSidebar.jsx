import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Users, MessageCircle, Users2, Tv, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomeSidebar = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("streams");

  const handleClick = (page) => {
    setActiveItem(page);
    onNavigate(page);
    setIsOpen(false);
  };

  const menuItems = [
    { id: "streams", icon: Tv, label: "Streams", gradient: "from-red-500 to-pink-500" },
    { id: "guilds", icon: Users, label: "Guilds", gradient: "from-purple-500 to-indigo-500" },
    { id: "friends", icon: Users2, label: "Friends", gradient: "from-blue-500 to-cyan-500" },
  ];

  const quickActions = [
    { label: "All Guilds", icon: Users, action: () => navigate("/guilds"), gradient: "from-emerald-500 to-teal-500" },
    { label: "Messenger", icon: MessageCircle, action: () => navigate("/messenger"), gradient: "from-violet-500 to-purple-500" },
  ];

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-base-100/95 backdrop-blur-md shadow-lg z-20 flex justify-between items-center p-3 border-b border-base-300">
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-ghost btn-sm gap-2 hover:bg-base-200"
        >
          <Menu size={24} />
          <span className="font-semibold">Menu</span>
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary w-5 h-5" />
          <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            PlayVerse
          </h2>
        </div>
        <div className="w-16" /> {/* Spacer for centering */}
      </div>

      {/* Sidebar for Desktop */}
      <div className="hidden lg:flex flex-col justify-between w-60 h-full bg-gradient-to-b from-base-100 to-base-200 shadow-2xl border-r border-base-300 p-4 fixed top-0 left-0 z-30">
        {/* Logo Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-50" />
              <div className="relative bg-gradient-to-br from-primary to-secondary p-3 rounded-xl">
                <Sparkles className="text-primary-content w-6 h-6" />
              </div>
            </div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              PlayVerse
            </h2>
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive
                      ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg scale-105'
                      : 'hover:bg-base-300 text-base-content hover:scale-102'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-semibold">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 rounded-full bg-white"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-base-content/60 px-4 mb-2">QUICK ACTIONS</p>
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={action.action}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-300 transition-all duration-200 hover:scale-102 group"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${action.gradient} group-hover:scale-110 transition-transform`}>
                  <Icon size={16} className="text-white" />
                </div>
                <span className="font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Sidebar with Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
            />

            {/* Sliding Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed z-40 top-0 left-0 h-full w-72 bg-gradient-to-b from-base-100 to-base-200 shadow-2xl flex flex-col justify-between p-4"
            >
              {/* Header */}
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-50" />
                      <div className="relative bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
                        <Sparkles className="text-primary-content w-5 h-5" />
                      </div>
                    </div>
                    <h2 className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      PlayVerse
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="btn btn-ghost btn-sm btn-circle hover:rotate-90 transition-transform duration-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleClick(item.id)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                          ${isActive
                            ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg scale-105'
                            : 'hover:bg-base-300'
                          }
                        `}
                      >
                        <Icon size={20} />
                        <span className="font-semibold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-base-content/60 px-4 mb-2">QUICK ACTIONS</p>
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        action.action();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-300 transition-all group"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${action.gradient} group-hover:scale-110 transition-transform`}>
                        <Icon size={16} className="text-white" />
                      </div>
                      <span className="font-medium">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </>
  );
};

export default HomeSidebar;