export const levelNames = ['Enchanted Forest', 'Forgotten Castle', 'Crystal Caverns', 'Shadow Fortress'];
export function nextUnlockedLevel(completed, unlocked) {
    return Math.max(unlocked, Math.min(4, completed + 1));
}
