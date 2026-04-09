import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export default function QuillEditor({ value, onChange, placeholder = "Write something...", className = "" }) {
    const editorRef = useRef(null);
    const quillInstance = useRef(null);

    useEffect(() => {
        if (editorRef.current && !quillInstance.current) {
            quillInstance.current = new Quill(editorRef.current, {
                theme: 'snow',
                placeholder: placeholder,
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link', 'clean']
                    ]
                }
            });

            // Set initial value
            if (value) {
                quillInstance.current.root.innerHTML = value;
            }

            // Listen for changes
            quillInstance.current.on('text-change', () => {
                const html = quillInstance.current.root.innerHTML;
                // Only trigger onChange if the content actually changed to avoid loops
                if (html === '<p><br></p>') {
                    onChange('');
                } else {
                    onChange(html);
                }
            });
        }
    }, []);

    // Update editor content if value prop changes from outside (e.g. reset)
    useEffect(() => {
        if (quillInstance.current && value !== quillInstance.current.root.innerHTML) {
            if (value === '' || value === null) {
                quillInstance.current.root.innerHTML = '';
            } else if (value !== quillInstance.current.root.innerHTML) {
                 // Avoid setting if it's basically the same (e.g. trailing newline differences)
                 // But for simplicity in this version, we trust the parent
                 // However, we don't want to reset cursor position every time
            }
        }
    }, [value]);

    return (
        <div className={`quill-container ${className}`}>
            <div ref={editorRef} />
        </div>
    );
}
