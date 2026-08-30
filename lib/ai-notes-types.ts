export interface AiNotesSection {
  heading: string;
  color: string;
  bullets: string[];
}

export interface AiNotesResponse {
  title: string;
  sections: AiNotesSection[];
  tip?: string;
}
