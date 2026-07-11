import ThemeToggle from "./ThemeToggle";

export default function Navbar({ noteCount, search, onSearchChange, theme, onToggleTheme }) {
  return (
    <nav className="flex flex-wrap items-center gap-4 border-b border-thread/40 bg-surface px-4 py-4 backdrop-blur sm:px-8 lg:px-16">
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-2xl text-rust" aria-hidden="true">
          ✎
        </span>
        <h1 className="font-display text-xl font-bold tracking-wide">
          Notebook
        </h1>
      </div>

      <div className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1 sm:max-w-md">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search your notes…"
          aria-label="Search notes"
          className="w-full rounded-md border border-thread/60 bg-app-bg/40 px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:border-rust"
        />
      </div>

      <div className="ml-auto flex items-center gap-4 order-2 sm:order-3">
        <span className="font-display whitespace-nowrap text-sm text-muted">
          {noteCount} {noteCount === 1 ? "note" : "notes"}
        </span>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </nav>
  );
}
