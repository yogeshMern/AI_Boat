import { Sparkles, Briefcase, Heart, BookOpen } from "lucide-react";

const botConfigs = {
  default: {
    icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    name: "General Assistant",
    color: "from-purple-400 to-blue-400",
  },
  "career-coach": {
    icon: <Briefcase className="w-4 h-4 text-blue-400" />,
    name: "Career Coach",
    color: "from-blue-400 to-cyan-400",
  },
  "mental-health": {
    icon: <Heart className="w-4 h-4 text-red-400" />,
    name: "Mental Health Support",
    color: "from-red-400 to-pink-400",
  },
  "study-buddy": {
    icon: <BookOpen className="w-4 h-4 text-green-400" />,
    name: "Study Buddy",
    color: "from-green-400 to-emerald-400",
  },
};

export default botConfigs;
