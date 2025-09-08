import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Menu, X, Users, MessageCircle, Users2, Tv } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomeSidebar = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = (page) => {
    onNavigate(page);
    setIsOpen(false); // close sidebar after click
  };

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-base-100 shadow-md z-20 flex justify-between items-center p-3">
        <button onClick={() => setIsOpen(true)} className="btn btn-ghost btn-sm">
          <Menu size={24} />
        </button>
        <h2 className="font-bold text-lg">Playverse</h2>
        <div />
      </div>

      {/* Sidebar for Desktop */}
      <div className="hidden lg:flex flex-col justify-between w-60 h-full bg-base-100 shadow-xl p-4 fixed top-0 left-0">
        <div>
          <h2 className="text-xl font-bold mb-6">Playverse</h2>
          <ul className="menu space-y-2">
            <li>
              <button onClick={() => handleClick("streams")} className="flex gap-2">
                <Tv size={20} /> Streams
              </button>
            </li>
            <li>
              <button onClick={() => handleClick("guilds")} className="flex gap-2">
                <Users size={20} /> Guilds
              </button>
            </li>
            <li>
              <button onClick={() => handleClick("friends")} className="flex gap-2">
                <Users2 size={20} /> Friends
              </button>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-0">
          <button onClick={() => navigate("/guilds")} className="flex gap-2 items-center btn btn-ghost mt-4">
            <Users size={20} /> All Guilds
          </button>
          <button onClick={() => navigate("/messenger")} className="flex gap-2 items-center btn btn-ghost mt-4">
            <MessageCircle size={20} /> Messenger
          </button>
        </div>
      </div>

      {/* Sidebar for Mobile */}
      {isOpen && (
        <>
          {/* Background overlay */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          />

          {/* Sliding Sidebar */}
          <motion.div
            initial={{ x: -250 }}
            animate={{ x: isOpen ? 0 : -250 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed z-30 top-0 left-0 h-full w-60 bg-base-100 shadow-xl p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Playverse</h2>
                <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-sm lg:hidden">
                  <X size={20} />
                </button>
              </div>

              <ul className="menu space-y-2">
                <li>
                  <button onClick={() => handleClick("streams")} className="flex gap-2">
                    <Tv size={20} /> Streams
                  </button>
                </li>
                <li>
                  <button onClick={() => handleClick("guilds")} className="flex gap-2">
                    <Users size={20} /> Guilds
                  </button>
                </li>
                <li>
                  <button onClick={() => handleClick("friends")} className="flex gap-2">
                    <Users2 size={20} /> Friends
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <button onClick={() => navigate("/guilds")} className="flex gap-2 items-center btn btn-ghost mt-4">
                <Users size={20} /> All Guilds
              </button>
              <button onClick={() => navigate("/messenger")} className="flex gap-2 items-center btn btn-ghost mt-4">
                <MessageCircle size={20} /> Messenger
              </button>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
};

export default HomeSidebar;
