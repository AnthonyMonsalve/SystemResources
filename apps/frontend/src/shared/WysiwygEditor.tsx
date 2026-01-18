import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TiptapLink from "@tiptap/extension-link";

export function WysiwygEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapLink.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto"],
      }),
    ],
    content: value || "",
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: "min-h-[120px] focus:outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || "", false);
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  const toggleLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const nextUrl = window.prompt("URL del enlace", previousUrl ?? "");
    if (nextUrl === null) return;
    if (!nextUrl) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: nextUrl }).run();
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 px-3 py-2">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${
            editor?.isActive("bold")
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 text-slate-700"
          }`}
          disabled={readOnly}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${
            editor?.isActive("italic")
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 text-slate-700"
          }`}
          disabled={readOnly}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${
            editor?.isActive("underline")
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 text-slate-700"
          }`}
          disabled={readOnly}
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${
            editor?.isActive("bulletList")
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 text-slate-700"
          }`}
          disabled={readOnly}
        >
          Lista
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${
            editor?.isActive("orderedList")
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 text-slate-700"
          }`}
          disabled={readOnly}
        >
          1.2.3
        </button>
        <button
          type="button"
          onClick={toggleLink}
          className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${
            editor?.isActive("link")
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 text-slate-700"
          }`}
          disabled={readOnly}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().unsetLink().run()}
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 transition"
          disabled={readOnly}
        >
          Quitar link
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[120px] px-3 py-2 text-sm text-slate-700 focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:pl-5"
      />
      {!value && placeholder ? (
        <p className="px-3 pb-2 text-xs text-slate-400">{placeholder}</p>
      ) : null}
    </div>
  );
}
