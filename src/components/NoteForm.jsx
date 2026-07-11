import { useEffect, useState } from "react";
import { TAGS } from "../constants";

const EMPTY = { title: "", details: "", tag: TAGS[0].id };
const MAX_TITLE = 60;
const MAX_DETAILS = 400;

export default function NoteForm({ onSave, editingNote, onCancelEdit }) {
  const [form, setForm] = useState(EMPTY);

  // When a note is selected for editing, load its values into the form.
  useEffect(() => {
    if (editingNote) {
      setForm({
        title: editingNote.title,
        details: editingNote.details,
        tag: editingNote.tag,
      });
    } else {
      setForm(EMPTY);
    }
  }, [editingNote]);

  const isEditing = Boolean(editingNote);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.details.trim()) return;

    onSave({
      ...form,
      title: form.title.trim(),
      details: form.details.trim(),
    });

    setForm(EMPTY);
  };

  return (
    <form
      className="flex w-full flex-col gap-4 rounded border-t-[6px] border-rust bg-card px-6 py-6 text-paper-ink shadow-xl sm:px-7"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">
          {isEditing ? "Edit note" : "New note"}
        </h2>
        {isEditing && (
          <button
            type="button"
            className="text-sm text-rust-dark underline"
            onClick={onCancelEdit}
          >
            Cancel
          </button>
        )}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="font-display text-xs uppercase tracking-wider text-paper-ink/70">
          Heading
        </span>
        <input
          type="text"
          value={form.title}
          maxLength={MAX_TITLE}
          placeholder="What's this note about?"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded border border-thread bg-[#fffdf8] px-3 py-2.5 text-sm text-paper-ink placeholder:text-paper-muted focus:border-rust"
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-display text-xs uppercase tracking-wider text-paper-ink/70">
          Details
        </span>
        <textarea
          value={form.details}
          maxLength={MAX_DETAILS}
          placeholder="Write the details here…"
          onChange={(e) => setForm({ ...form, details: e.target.value })}
          className="min-h-32.5 resize-y rounded border border-thread bg-[#fffdf8] px-3 py-2.5 text-sm text-paper-ink placeholder:text-paper-muted focus:border-rust"
          required
        />
        <span className="self-end text-xs text-paper-ink/50">
          {form.details.length}/{MAX_DETAILS}
        </span>
      </label>

      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className="font-display text-xs uppercase tracking-wider text-paper-ink/70">
          Tag
        </legend>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <label
              key={tag.id}
              className="tag-chip relative flex cursor-pointer items-center gap-1.5 rounded-full border border-thread bg-[#fffdf8] px-3 py-1.5 text-xs text-paper-ink"
            >
              <input
                type="radio"
                name="tag"
                value={tag.id}
                checked={form.tag === tag.id}
                onChange={() => setForm({ ...form, tag: tag.id })}
              />
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: tag.color }}
                aria-hidden="true"
              />
              {tag.label}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        className="mt-1 rounded bg-rust py-3 font-display text-sm font-bold tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-rust-dark active:translate-y-0"
      >
        {isEditing ? "Save changes" : "Add note"}
      </button>
    </form>
  );
}
