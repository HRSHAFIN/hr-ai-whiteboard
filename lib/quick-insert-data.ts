export interface NoteTemplate {
  id: "sticky" | "glass" | "task";
  label: string;
  description: string;
  swatchClass: string;
  backgroundColor: string;
  strokeColor: string;
  fontSize: number;
  width: number;
  height: number;
  text: string;
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "sticky",
    label: "Sticky Note",
    description: "Warm idea card",
    swatchClass: "bg-amber-200",
    backgroundColor: "#fef3c7",
    strokeColor: "#f59e0b",
    fontSize: 18,
    width: 220,
    height: 160,
    text: "New idea",
  },
  {
    id: "glass",
    label: "Glass Note",
    description: "Polished meeting note",
    swatchClass: "bg-blue-100",
    backgroundColor: "#eff6ff",
    strokeColor: "#3b82f6",
    fontSize: 16,
    width: 260,
    height: 180,
    text: "Meeting notes",
  },
  {
    id: "task",
    label: "Task Card",
    description: "Structured checklist tile",
    swatchClass: "bg-emerald-100",
    backgroundColor: "#ecfdf5",
    strokeColor: "#22c55e",
    fontSize: 16,
    width: 240,
    height: 200,
    text: "☐ Task one\n☐ Task two\n☐ Task three",
  },
];

export const EMOJI_LIST: string[] = [
  "😀", "😂", "😍", "🤔", "😎", "😅", "😢", "😡", "🥳", "👍",
  "👎", "👏", "🙏", "💪", "🔥", "✨", "🎉", "💡", "⭐", "❤️",
  "✅", "❌", "⚠️", "❓", "❗", "🚀", "🎯", "📌", "📝", "📊",
  "📅", "⏰", "💰", "📈", "📉", "🔒", "🔑", "🏆", "🎁", "☕",
];

export const ICON_LIST: string[] = [
  "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "ArrowUpRight", "RefreshCw",
  "CircleCheck", "CircleX", "CircleAlert", "Star", "Heart", "Flag",
  "Briefcase", "TrendingUp", "TrendingDown", "DollarSign", "Target", "PieChart",
  "BarChart3", "Users", "Building2", "Laptop", "Smartphone", "Server",
  "Database", "Cloud", "Wifi", "Code", "Terminal", "Cpu",
  "Mail", "MessageSquare", "Phone", "Bell", "Send", "FileText",
  "Folder", "Paperclip", "Link", "Bookmark", "Settings", "Search",
  "Filter", "Calendar", "Clock", "MapPin", "Home", "ShoppingCart",
  "Gift", "Lightbulb", "Rocket", "Zap", "Shield", "Lock",
  "Key", "Trash2", "Plus", "Check", "X", "Info",
];
