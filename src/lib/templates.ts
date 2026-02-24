export interface SpaceTemplate {
    id: string;
    name: string;
    icon: string;
    description: string;
    starterItems: { type: 'text' | 'code'; content: string; language?: string }[];
}

export const TEMPLATES: SpaceTemplate[] = [
    {
        id: 'meeting-notes',
        name: 'Meeting Notes',
        icon: '📝',
        description: 'Quick capture for meeting takeaways',
        starterItems: [
            { type: 'text', content: '# Meeting Notes\n\n**Date:** \n**Attendees:** \n\n## Agenda\n- \n\n## Action Items\n- [ ] \n\n## Notes\n' },
        ],
    },
    {
        id: 'code-snippets',
        name: 'Code Snippets',
        icon: '💻',
        description: 'Collect and share code snippets',
        starterItems: [
            { type: 'text', content: '# Code Snippets\n\nPaste your code snippets here. They will be auto-detected and syntax-highlighted.' },
            { type: 'code', content: '// Example: paste your code here\nconsole.log("Hello, PasteSpace!");', language: 'javascript' },
        ],
    },
    {
        id: 'file-share',
        name: 'File Share',
        icon: '📁',
        description: 'Quick file drop zone for sharing',
        starterItems: [
            { type: 'text', content: '# File Share\n\nDrag & drop files here to share them with anyone who has the link. Files are stored securely in the cloud.' },
        ],
    },
    {
        id: 'link-collection',
        name: 'Link Collection',
        icon: '🔗',
        description: 'Curate and share useful links',
        starterItems: [
            { type: 'text', content: '# Link Collection\n\nPaste URLs here to build a shareable list of links. Each URL will be auto-detected and displayed with a favicon.' },
        ],
    },
    {
        id: 'brainstorm',
        name: 'Brainstorm',
        icon: '💡',
        description: 'Collaborative idea board',
        starterItems: [
            { type: 'text', content: '# Brainstorm Board\n\n🎯 **Goal:** \n\n## Ideas\n- \n\n## Priorities\n1. \n2. \n3. ' },
        ],
    },
];
