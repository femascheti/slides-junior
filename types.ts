
export interface Point {
  x: number;
  y: number;
}

export interface Line {
  points: Point[];
  color: string;
  strokeWidth: number;
}

export interface TextObject {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  isEditing?: boolean;
}

export interface Page {
  id: string;
  lines: Line[];
  texts: TextObject[];
}

export enum Tool {
    PEN = 'PEN',
    TEXT = 'TEXT',
    ERASER = 'ERASER',
}
