import { THEMES } from "../constants/indes"
import { useThemeStore } from "../store/useThemeStore"
import { Send } from "lucide-react"

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
]

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore()

  return (
    <div className="min-h-screen container mx-auto px-4 pt-24 max-w-5xl animate-fade-in">
      <div className="space-y-10">

        {/* Theme Section */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-base-content">🎨 Theme</h2>
          <p className="text-sm text-base-content/70">
            Choose a theme for your chat interface
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 pt-2">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`
                  group relative p-2 rounded-xl border 
                  transition-all duration-200 ease-in-out
                  ${theme === t
                    ? "border-primary bg-base-200 shadow-md"
                    : "border-transparent hover:border-base-300 hover:bg-base-200/50"}
                `}
              >
                <div className="relative w-full h-8 rounded overflow-hidden" data-theme={t}>
                  <div className="absolute inset-0 grid grid-cols-4 gap-1 p-1">
                    <div className="rounded bg-primary" />
                    <div className="rounded bg-secondary" />
                    <div className="rounded bg-accent" />
                    <div className="rounded bg-neutral" />
                  </div>
                </div>
                <span className="text-[11px] mt-1 font-medium text-center truncate block">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-base-content">💬 Preview</h3>
          <div className="rounded-xl border border-base-300 bg-base-100 shadow-xl overflow-hidden">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-base-300 bg-base-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
                  J
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Nirakar Bhattarai</h4>
                  <p className="text-xs text-base-content/70">Online</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-4 space-y-3 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
              {PREVIEW_MESSAGES.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`
                      max-w-[80%] p-3 rounded-xl shadow
                      ${message.isSent ? "bg-primary text-primary-content" : "bg-base-200"}
                    `}
                  >
                    <p className="text-sm">{message.content}</p>
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
            <div className="p-4 border-t border-base-300 bg-base-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1 text-sm h-10"
                  placeholder="Type a message..."
                  value="This is a preview"
                  readOnly
                />
                <button className="btn btn-primary h-10 min-h-0">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SettingsPage
