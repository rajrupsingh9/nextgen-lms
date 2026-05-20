export type BoardTool = "pen" | "eraser";

export interface SkiaPathData {
  id: string;
  pathString: string;
  color: string;
  strokeWidth: number;
  isEraser: boolean;
}