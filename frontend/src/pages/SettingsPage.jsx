import { THEMES } from "../constants/indes"
import { useThemeStore } from "../store/useThemeStore"
import { Send, Palette, Check, Sparkles } from "lucide-react"

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
]

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-300 to-base-200 py-12 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-secondary to-accent p-1 rounded-3xl shadow-2xl">
          <div className="bg-base-100 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-50" />
                <div className="relative bg-gradient-to-br from-primary to-secondary p-3 rounded-xl">
                  <Sparkles className="text-primary-content w-6 h-6" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-base-content/60 mt-1">
                  Customize your experience
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Section */}
        <div className="bg-base-100 rounded-3xl p-6 sm:p-8 shadow-xl border border-base-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Theme Customization</h2>
              <p className="text-sm text-base-content/60">
                Choose a theme that suits your style
              </p>
            </div>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`
                  group relative p-3 rounded-2xl border-2 transition-all duration-300
                  hover:scale-105 hover:shadow-lg
                  ${theme === t
                    ? "border-primary bg-primary/10 shadow-lg scale-105"
                    : "border-base-300 hover:border-primary/50 bg-base-200"
                  }
                `}
              >
                {/* Theme Preview */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-2 shadow-md" data-theme={t}>
                  <div className="absolute inset-0 grid grid-cols-4 gap-1 p-1.5">
                    <div className="rounded bg-primary" />
                    <div className="rounded bg-secondary" />
                    <div className="rounded bg-accent" />
                    <div className="rounded bg-neutral" />
                  </div>
                </div>

                {/* Theme Name */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold truncate capitalize">
                    {t}
                  </span>
                  {theme === t && (
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-content" />
                    </div>
                  )}
                </div>

                {/* Active Indicator */}
                {theme === t && (
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-primary ring-offset-2 ring-offset-base-100 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-base-100 rounded-3xl p-6 sm:p-8 shadow-xl border border-base-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Send className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Live Preview</h3>
              <p className="text-sm text-base-content/60">
                See how your messages will look
              </p>
            </div>
          </div>

          {/* Chat Preview */}
          <div className="rounded-2xl border-2 border-base-300 bg-base-100 shadow-xl overflow-hidden">
            {/* Chat Header */}
            <div className="px-5 py-4 border-b-2 border-base-300 bg-gradient-to-r from-base-100 to-base-200">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold shadow-lg">
                    J
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full ring-2 ring-base-100" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">John Doe</h4>
                  <p className="text-xs text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-5 space-y-4 bg-gradient-to-b from-base-100 to-base-200 min-h-[300px]">
              {PREVIEW_MESSAGES.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isSent ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`
                      max-w-[80%] px-4 py-3 rounded-2xl shadow-lg transition-all hover:scale-102
                      ${message.isSent
                        ? "bg-gradient-to-br from-primary to-primary/80 text-primary-content rounded-br-sm"
                        : "bg-base-200 rounded-bl-sm"
                      }
                    `}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={`text-[10px] mt-1.5 ${message.isSent
                          ? "text-primary-content/70"
                          : "text-base-content/60"
                        }`}
                    >
                      12:00 PM
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t-2 border-base-300 bg-base-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1 text-sm rounded-xl focus:input-primary transition-all"
                  placeholder="Type a message..."
                  value="This is a preview"
                  readOnly
                />
                <button className="btn btn-primary rounded-xl gap-2 hover:scale-105 transition-all">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .delay-1000 {
          animation-delay: 1s;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}

export default SettingsPage