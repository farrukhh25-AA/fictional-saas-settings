import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Blocks, ChevronDown, PlugZap, Settings, UserRound, UsersRound } from 'lucide-react';
import { clsx } from 'clsx';

const sections = [
  {
    label: 'Profile',
    description: 'Personal and workspace details',
    path: '/settings/profile',
    icon: UserRound,
  },
  {
    label: 'Team',
    description: 'Members, roles, and invites',
    path: '/settings/team',
    icon: UsersRound,
  },
  {
    label: 'Integrations',
    description: 'Connected tools and syncs',
    path: '/settings/integrations',
    icon: PlugZap,
  },
];

export function SettingsLayout() {
  const location = useLocation();
  const current = sections.find((section) => section.path === location.pathname) ?? sections[0];

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#172033]">
      <header className="border-b border-[#e4e9ef]/90 bg-[#fafaf8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f2644b] text-white shadow-sm shadow-[#f2644b]/25">
              <Blocks className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#172033]">Yarra Works</p>
              <p className="text-xs text-[#64748b]">Team knowledge OS</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 rounded-full border border-[#f7b4a8] bg-[#fff1ee] px-4 py-2 text-sm font-medium text-[#c94d38] sm:flex">
            <Settings className="h-4 w-4" />
            Settings
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-[#e4e9ef] bg-white p-2 shadow-sm shadow-slate-950/[0.06]">
            <button
              className="flex w-full items-center justify-between gap-3 rounded-md bg-[#fff1ee] px-3 py-3 text-left lg:hidden"
              type="button"
            >
              <span>
                <span className="block text-sm font-semibold">{current.label}</span>
                <span className="block text-xs text-[#64748b]">{current.description}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-[#c94d38]" />
            </button>

            <nav className="mt-2 grid gap-1 lg:mt-0">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <NavLink
                    key={section.path}
                    to={section.path}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-start gap-3 rounded-md px-3 py-3 transition',
                        isActive
                          ? 'bg-[#fff1ee] text-[#c94d38] ring-1 ring-[#f7b4a8]'
                          : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#c94d38]',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={clsx(
                            'mt-0.5 h-4 w-4 shrink-0',
                            isActive ? 'text-[#f2644b]' : 'text-[#94a3b8]',
                          )}
                        />
                        <span>
                          <span className="block text-sm font-semibold">{section.label}</span>
                          <span
                            className={clsx(
                              'block text-xs',
                              isActive ? 'text-[#c86f5f]' : 'text-[#64748b]',
                            )}
                          >
                            {section.description}
                          </span>
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
