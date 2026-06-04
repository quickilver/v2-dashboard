export interface Category {
  id: number;
  guid: string;
  title: string;
  parent_id: number | null;
  display: boolean;
  created_at: string;
  updated_at: string;
}
