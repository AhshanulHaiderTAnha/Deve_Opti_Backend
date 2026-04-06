import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Quill
    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      placeholder: placeholder,
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link', 'clean'],
        ],
      },
    });

    quillRef.current = quill;

    // Initial value
    if (value) {
      quill.root.innerHTML = value;
    }

    // Handle text changes
    quill.on('text-change', () => {
      if (isUpdatingRef.current) return;
      
      const html = quill.root.innerHTML;
      // Filter out empty p tags if necessary
      const finalHtml = html === '<p><br></p>' ? '' : html;
      onChange(finalHtml);
    });

    return () => {
      // Cleanup
      if (containerRef.current) {
        const toolbar = containerRef.current.previousSibling;
        if (toolbar && toolbar.classList && toolbar.classList.contains('ql-toolbar')) {
          toolbar.remove();
        }
      }
      quillRef.current = null;
    };
  }, []); // Run once on mount

  // Sync value from props to editor
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      isUpdatingRef.current = true;
      quillRef.current.root.innerHTML = value || '';
      isUpdatingRef.current = false;
    }
  }, [value]);

  return (
    <div className="rich-text-editor">
      <div ref={containerRef} />
      <style dangerouslySetInnerHTML={{ __html: `
        .rich-text-editor .ql-toolbar.ql-snow {
          border: none !important;
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 12px 20px !important;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
        }
        .rich-text-editor .ql-container.ql-snow {
          border: none !important;
          min-height: 250px;
          font-size: 0.875rem;
          font-family: inherit;
          border-bottom-left-radius: 1rem;
          border-bottom-right-radius: 1rem;
          background: #f8fafc;
        }
        .rich-text-editor .ql-editor {
          padding: 20px !important;
          min-height: 250px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #cbd5e1 !important;
          font-style: normal !important;
          left: 20px !important;
          font-weight: 500;
        }
      `}} />
    </div>
  );
};

export default RichTextEditor;
