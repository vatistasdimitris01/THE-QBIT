// Fix: Add missing Story and Annotation interfaces to resolve import error in StoryCard.tsx.
export interface Annotation {
  term: string;
  explanation?: string; // Explanation is now optional
  importance: number; // Importance score (e.g., 1-3)
}

export interface Story {
  id: string | number;
  category: string;
  title: string;
  summary: string;
  importance: number;
  annotations?: Annotation[];
}

export interface StorySource {
  title: string;
  uri: string;
}

export interface BriefingContent {
  greeting: string;
  intro: string;
  timestamp: string;
  stories: Story[];
  outro: string;
  weather?: {
    description: string;
    temperature: string;
  };
  localTime?: string;
}

export interface Briefing {
  content: BriefingContent;
  sources: StorySource[];
}