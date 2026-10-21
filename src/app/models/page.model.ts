export interface PageModel {
    id: number;
    title: string;
    alias: string;
    h1: string | null;
    content: string | null;
    seo_title: string | null;
    seo_description: string | null;
    seo_keywords: string | null;
    display: boolean;
    created_at: string;
    updated_at: string;
}