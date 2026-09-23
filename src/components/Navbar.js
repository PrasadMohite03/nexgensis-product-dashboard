/**
 * Top navigation bar — reusable across all protected pages.
 * Props:
 *   user     — { firstName, lastName } from stored auth profile
 *   onLogout — callback to clear auth and redirect
 */
export default function Navbar({ user, onLogout }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
            />
          </svg>
        </div>
        <span className="font-semibold text-gray-900 text-sm hidden sm:inline">
          Nexgensis Dashboard
        </span>
      </div>

      {/* User info + logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {user && (
          <span className="text-sm text-gray-600">
            <span className="hidden sm:inline">Welcome, </span>
            <span className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </span>
          </span>
        )}
        <button
          id="logout-btn"
          onClick={onLogout}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
