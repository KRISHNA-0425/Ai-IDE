/**
 * Format a date string or timestamp into a short human-readable relative time
 * e.g., "14m ago", "2h ago", "1d ago"
 */
export const formatTimeAgo = (dateInput) => {
    if (!dateInput) return "Just now";
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Recently";

    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(months / 12);
    return `${years}y ago`;
};

/**
 * Generate a deterministic color for the project dot based on its name
 */
export const getStatusDotColor = (name = "") => {
    const colors = [
        "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]",
        "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
        "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]",
        "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
        "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]",
        "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]"
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

