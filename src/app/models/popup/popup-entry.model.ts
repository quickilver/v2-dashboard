export interface PopupEntry {
    id: number;
    title: string;
    component: any;
    inputs: Record<string, unknown>;
    dialogClass: string;
}
