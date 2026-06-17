export interface NavigationItem {
    title: string;
    route: string;
    icon?: string;
    children?: NavigationItem[];
}
