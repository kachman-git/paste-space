'use client';

import React, { useEffect, useRef } from 'react';
import { Item } from '@/lib/types';
import { CopyButton } from '@/components/ui/CopyButton';
import { DeleteButton } from '@/components/ui/DeleteButton';
import hljs from 'highlight.js/lib/core';

import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('css', css);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('java', java);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('markdown', markdown);

interface CodeItemProps {
    item: Item;
    onDelete?: () => void;
}

export function CodeItem({ item, onDelete }: CodeItemProps) {
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current && item.content) {
            if (item.language && hljs.getLanguage(item.language)) {
                codeRef.current.innerHTML = hljs.highlight(item.content, { language: item.language }).value;
            } else {
                codeRef.current.innerHTML = hljs.highlightAuto(item.content).value;
            }
        }
    }, [item.content, item.language]);

    return (
        <div className="group relative theme-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--border-card)' }}>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <span className="text-xs theme-faint font-medium uppercase">{item.language || 'CODE'}</span>
                </div>
                <div className="flex items-center gap-1">
                    <CopyButton text={item.content || ''} size="sm" />
                    {onDelete && <DeleteButton onDelete={onDelete} />}
                </div>
            </div>
            <div className="p-4 overflow-x-auto">
                <pre className="text-sm leading-relaxed">
                    <code ref={codeRef} className="theme-text-secondary font-mono">{item.content}</code>
                </pre>
            </div>
            <div className="px-4 pb-3 text-xs theme-faint">
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    );
}
