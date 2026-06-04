export interface NavigationItem {
    title: string;
    route: string;
    children?: NavigationItem[];
}