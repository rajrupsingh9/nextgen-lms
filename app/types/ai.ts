export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface LectureSummary {
  lectureId: string;
  topic: string;
  markdownContent: string;
  generatedAt: number;
}
