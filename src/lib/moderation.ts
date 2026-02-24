/**
 * Basic content moderation — word blocklist filter.
 */

const BLOCKED_WORDS = [
    // Add actual blocked words as needed
    'spam_test_word',
];

const BLOCKED_PATTERNS = [
    /(\b\w+\b)(\s+\1){5,}/i, // Excessive word repetition (6+ times)
];

interface ModerationResult {
    clean: boolean;
    flagged: string[];
}

/**
 * Check text content against the blocklist.
 */
export function checkContent(text: string): ModerationResult {
    const flagged: string[] = [];
    const lower = text.toLowerCase();

    for (const word of BLOCKED_WORDS) {
        if (lower.includes(word.toLowerCase())) {
            flagged.push(word);
        }
    }

    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(text)) {
            flagged.push('excessive repetition');
        }
    }

    return {
        clean: flagged.length === 0,
        flagged,
    };
}
