export interface Tag {
  question: string;
  answer: string;
  keywords: string[];
  category_ids: string[] | null;
  channel_ids: string[] | null;
}
