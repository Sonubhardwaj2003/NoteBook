import NoteCard from "./NoteCard";
import EmptyState from "./EmptyState";

export default function NotesGrid({
  notes,
  deletingId,
  isSearching,
  onEdit,
  onDelete,
  onTogglePin,
}) {
  if (notes.length === 0) {
    return <EmptyState isSearching={isSearching} />;
  }

  const sorted = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="notes-grid grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sorted.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          isDeleting={deletingId === note.id}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
        />
      ))}
    </div>
  );
}
