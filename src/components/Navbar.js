/**
 * Top navigation bar — reusable across all protected pages.
 * Props:
 *   user     — { firstName, lastName } from stored auth profile
 *   onLogout — callback to clear auth and redirect
 */
export default function Navbar({ user, onLogout }) {
  // Derive initials for the avatar
  const initials = user
    ? `${(user.firstName?.[0] ?? "").toUpperCase()}${(user.lastName?.[0] ?? "").toUpperCase()}`
    : "";

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <img
          src="/logo.png"
          alt="Nexgensis Logo"
          className="h-7 w-auto object-contain shrink-0"
        />
        <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
          Nexgensis Dashboard
        </span>
      </div>

      {/* User info + logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {user && (
          <div className="flex items-center gap-2.5">
            {/* Initials avatar */}
            <div
              className="w-8.5 h-8.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 select-none border border-indigo-200"
              title={`${user.firstName} ${user.lastName}`}
            >
              {initials}
            </div>
            <span className="text-sm text-slate-600 hidden sm:inline font-medium">
              <span className="font-semibold text-slate-900">
                {user.firstName} {user.lastName}
              </span>
            </span>
          </div>
        )}
        <div className="h-5 w-px bg-slate-200 hidden sm:block" />
        <button
          id="logout-btn"
          onClick={onLogout}
          className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg px-2.5 py-1.5 hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
