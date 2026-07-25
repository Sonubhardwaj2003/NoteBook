import { useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import NoteForm from "./components/NoteForm";
import NotesGrid from "./components/NotesGrid";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTheme } from "./hooks/useTheme";
import noteLogo from "./assets/note-logo.png";

function App() {
  const [notes, setNotes] = useLocalStorage("notebook-notes", []);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [theme, toggleTheme] = useTheme();

  const editingNote = notes.find((n) => n.id === editingId) ?? null;

  const handleSave = (formValues) => {
    if (editingId) {
      setNotes(
        notes.map((n) => (n.id === editingId ? { ...n, ...formValues } : n)),
      );
      setEditingId(null);
    } else {
      setNotes([
        ...notes,
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          pinned: false,
          ...formValues,
        },
      ]);
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      setNotes((current) => current.filter((n) => n.id !== id));
      setDeletingId(null);
      if (editingId === id) setEditingId(null);
    }, 250);
  };

  const handleTogglePin = (id) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.details.toLowerCase().includes(query),
    );
  }, [notes, search]);

  return (
    <div className="dot-grid flex min-h-screen flex-col bg-app-bg">
      <Navbar
        noteCount={notes.length}
        search={search}
        onSearchChange={setSearch}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1">
        {/* Part 1: write-note panel + decorative image, side by side on large screens */}
        {/* <section className="flex flex-col items-center gap-10 px-4 py-10 sm:px-8 lg:flex-row lg:items-start lg:justify-center lg:px-16">
          <div className="w-full max-w-lg">
            <NoteForm
              onSave={handleSave}
              editingNote={editingNote}
              onCancelEdit={() => setEditingId(null)}
            />
          </div>

          <img
            src={noteLogo}
            alt="Hand writing in a spiral notebook"
            className="hidden h-56 w-56 shrink-0 rounded-full border-4 border-card object-cover shadow-2xl lg:block"
          />
        </section> */}

        <section className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Image */}
          <div className="order-1 flex w-full justify-center lg:order-2 lg:w-1/2">
            {/* <img
              src={noteLogo}
              alt="Notebook"
              className="h-48 w-48 rounded-full border-4 border-card object-cover shadow-2xl sm:h-64 sm:w-64 md:h-72 md:w-72 lg:h-95 lg:w-95 xl:h-112.5 xl:w-112.5"
            /> */}
            <img
              src={noteLogo}
              alt="Notebook"
              className="floating-image h-48 w-48 rounded-full border-4 border-card object-cover shadow-2xl sm:h-64 sm:w-64 md:h-72 md:w-72 lg:h-95 lg:w-95 xl:h-112.5 xl:w-112.5"
            />
          </div>

          {/* Form */}
          <div className="order-2 w-full lg:order-1 lg:w-1/2">
            <NoteForm
              onSave={handleSave}
              editingNote={editingNote}
              onCancelEdit={() => setEditingId(null)}
            />
          </div>
        </section>

        {/* Part 2: the notes board, full width on every screen size */}
        <section className="px-4 pb-16 sm:px-8 lg:px-16">
          <h2 className="mb-5 font-display text-xs uppercase tracking-[0.14em] text-muted">
            Pinned board
          </h2>
          <NotesGrid
            notes={visibleNotes}
            deletingId={deletingId}
            isSearching={Boolean(search.trim())}
            onEdit={(note) => setEditingId(note.id)}
            onDelete={handleDelete}
            onTogglePin={handleTogglePin}
          />
        </section>
      </main>

      <footer className="border-t border-thread/40 py-4 text-center text-sm text-muted">
        © {new Date().getFullYear()} Notebook. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
