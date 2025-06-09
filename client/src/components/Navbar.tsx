import { Link } from "wouter";

export function Navbar() {
  return (
    <nav className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="container h-full mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/">
            <a className="text-xl font-bold text-arena-green">CodeArena</a>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/problems">
              <a className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">Problems</a>
            </Link>
            <Link href="/contests">
              <a className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">Contests</a>
            </Link>
            <Link href="/courses">
              <a className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">Courses</a>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 