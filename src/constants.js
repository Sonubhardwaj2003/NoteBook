// Central tag palette. Each note carries one tag id; colors are referenced
// via CSS variables defined in index.css so the palette stays in one place.
export const TAGS = [
  { id: "idea", label: "Idea", color: "var(--color-tag-idea)" },
  { id: "work", label: "Work", color: "var(--color-tag-work)" },
  { id: "personal", label: "Personal", color: "var(--color-tag-personal)" },
  { id: "urgent", label: "Urgent", color: "var(--color-tag-urgent)" },
];

export const getTag = (id) => TAGS.find((t) => t.id === id) ?? TAGS[0];
