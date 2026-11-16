/*
 * Shadow Realm: The Lost Kingdom
 * Project-level AI acknowledgment: OpenAI ChatGPT and Codex supported
 * implementation, refinement and learning. The developer supplied game
 * ideas, requirements and design direction; no exact authorship split is claimed.
 */
export const levelNames = ['Enchanted Forest', 'Forgotten Castle', 'Crystal Caverns', 'Shadow Fortress'];
export function nextUnlockedLevel(completed, unlocked) {
    return Math.max(unlocked, Math.min(4, completed + 1));
}
