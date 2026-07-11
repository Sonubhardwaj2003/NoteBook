import { getTag } from "../constants";

export default function NoteCard({ note, isDeleting, onEdit, onDelete, onTogglePin }) {
  const tag = getTag(note.tag);
  const date = new Date(note.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <article
      className={`note-card relative flex min-h-37.5 flex-col gap-2.5 rounded-sm bg-card px-4 pb-4 pt-6 text-paper-ink shadow-lg transition-shadow duration-200 ${
        note.pinned ? "outline-1 outline-rust" : ""
      } ${isDeleting ? "note-card--deleting" : ""}`}
    >
      <button
        type="button"
        className="absolute -top-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-black/25 shadow"
        style={{
          backgroundColor: tag.color,
          boxShadow: note.pinned ? `0 0 0 3px ${tag.color}40` : undefined,
        }}
        onClick={() => onTogglePin(note.id)}
        aria-pressed={note.pinned}
        aria-label={note.pinned ? "Unpin note" : "Pin note"}
        title={note.pinned ? "Unpin note" : "Pin note"}
      />

      <header className="flex items-center justify-between">
        <span
          className="font-display text-[0.68rem] font-bold uppercase tracking-wide"
          style={{ color: tag.color }}
        >
          {tag.label}
        </span>
        <time className="text-xs text-paper-ink/60" dateTime={note.createdAt}>
          {date}
        </time>
      </header>

      <h3 className="wrap-break-word font-display text-base leading-snug">
        {note.title}
      </h3>
      <p className="flex-1 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-paper-ink/80">
        {note.details}
      </p>

      <footer className="flex gap-4 border-t border-dashed border-thread pt-2">
        <button
          type="button"
          className="text-xs text-paper-ink/70 underline"
          onClick={() => onEdit(note)}
        >
          Edit
        </button>
        <button
          type="button"
          className="text-xs text-rust-dark underline"
          onClick={() => onDelete(note.id)}
        >
          Delete
        </button>
      </footer>
    </article>
  );
}
