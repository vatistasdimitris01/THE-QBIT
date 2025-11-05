export interface Annotation {
  term: string;
  explanation?: string;
  importance: number;
  crossLinkStoryTitle?: string; // Links to another story's title
}

export interface Media {
  type: 'image' | 'youtube';
  src?: string; // For images
  videoId?: string; // For YouTube videos
}

export interface Story {
  id: string | number;
  category: string;
  title: string;
  summary: string;
  importance: number;
  annotations?: Annotation[];
  media?: Media; // Media object for the story
}

export interface StorySource {
  title: string;
  uri: string;
}

export interface BriefingContent {
  greeting: string;
  intro: string;
  dailySummary: string;
  stories: Story[];
  outro: string;
}

export interface Briefing {
  content: BriefingContent;
  sources: StorySource[];
}