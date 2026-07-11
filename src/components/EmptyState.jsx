export default function EmptyState({ isSearching }) {
  return (
    <div className="rounded-lg border border-dashed border-thread/60 px-6 py-16 text-center text-muted">
      <span className="mb-2 block text-3xl" aria-hidden="true">
        {isSearching ? "🔍" : "📌"}
      </span>
      <p className="font-display text-base text-ink">
        {isSearching ? "No notes match your search" : "Your board is empty"}
      </p>
      <p className="mt-1 text-sm">
        {isSearching
          ? "Try a different keyword."
          : "Add your first note above to pin it here."}
      </p>
    </div>
  );
}
