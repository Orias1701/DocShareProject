// src/components/rte/RichTextEditor.jsx
import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import Underline from "@tiptap/extension-underline";

// Tạo instance lowlight (highlight code)
const lowlight = createLowlight(common);

function Icon({ children }) {
  return <span className="text-sm font-semibold">{children}</span>;
}

function Btn({ active, onClick, title, children, disabled }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={`px-2 py-1 rounded-md border border-white/10 text-sm hover:bg-white/10 disabled:opacity-50 ${
        active ? "bg-white/10" : "bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * props:
 *  - value: HTML string ban đầu / từ cha (two-way)
 *  - onChange(html): callback mỗi khi nội dung đổi
 */
export default function RichTextEditor({ value, onChange }) {
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // dùng CodeBlockLowlight thay thế
        bold: true,
        italic: true,
        code: true,
      }),
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ allowBase64: true }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "ProseMirror prose prose-invert text-left max-w-none min-h-[320px] p-4 rounded-xl bg-[#0D1117] border border-white/10 focus:outline-none",
      },
      // giữ hành vi mặc định; nếu bạn có lib khác clear marks, có thể handleKeyDown ở đây
    },
  });

  // 🔁 Đồng bộ NGƯỢC: nếu prop `value` từ cha thay đổi (ví dụ setEditorHtml từ nơi khác),
  // cập nhật lại nội dung editor (tránh vòng lặp bằng cách so sánh trước).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "";
    if (incoming !== current) {
      editor.commands.setContent(incoming, false); // false = không push vào history
    }
  }, [value, editor]);

  // ===== Toolbar actions =====
  const addLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link")?.href || "";
    const url = window.prompt("Nhập URL:", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    if (!editor) return;
    const method = window.confirm("OK = nhập URL ảnh, Cancel = chọn file ảnh");
    if (method) {
      const url = window.prompt("Nhập URL ảnh:");
      if (url) editor.chain().focus().setImage({ src: url }).run();
    } else {
      fileInputRef.current?.click();
    }
  };

  const onPickImageFile = (e) => {
    if (!editor) return;
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result }).run();
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  if (!editor) return null;

  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!canUndo}>
          <Icon>↶</Icon>
        </Btn>
        <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!canRedo}>
          <Icon>↷</Icon>
        </Btn>

        <span className="mx-1 w-px h-6 bg-white/10" />

        <Btn
          title="H1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Icon>H1</Icon>
        </Btn>
        <Btn
          title="H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Icon>H2</Icon>
        </Btn>
        <Btn
          title="H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Icon>H3</Icon>
        </Btn>

        <Btn
          title="Đậm"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Icon>B</Icon>
        </Btn>
        <Btn
          title="Nghiêng"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Icon>I</Icon>
        </Btn>
        <Btn
          title="Gạch chân"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Icon>U</Icon>
        </Btn>

        <Btn
          title="Code inline"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Icon>{"</>"}</Icon>
        </Btn>
        <Btn
          title="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Icon>{"{ }"}</Icon>
        </Btn>

        <Btn
          title="Danh sách •"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <Icon>• List</Icon>
        </Btn>
        <Btn
          title="Danh sách 1."
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <Icon>1. List</Icon>
        </Btn>

        <Btn title="Link" onClick={addLink}>
          <Icon>Link</Icon>
        </Btn>
        <Btn title="Ảnh" onClick={addImage}>
          <Icon>🖼</Icon>
        </Btn>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onPickImageFile}
          className="hidden"
        />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
