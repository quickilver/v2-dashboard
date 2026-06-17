import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { ListingColumn } from '../../models/listing.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '60px' },
        { key: 'name', title: 'Название', sortable: true },
        { key: 'category', title: 'Категория', sortable: true },
        { key: 'price', title: 'Цена', sortable: true },
        { key: 'stock', title: 'Количество', sortable: true },
        { key: 'status', title: 'Статус', sortable: true },
    ]);

    products = signal([
        {
            id: 1,
            name: 'iPhone 17 Pro Max 128Gb',
            category: 'Сотовые телефоны',
            price: '78 000',
            stock: 150,
            status: 'В наличии',
        },
        {
            id: 2,
            name: 'iPhone 17 Pro Max 128Gb',
            category: 'Сотовые телефоны',
            price: '78 000',
            stock: 150,
            status: 'В наличии',
        },
        {
            id: 3,
            name: 'iPhone 17 Pro Max 128Gb',
            category: 'Сотовые телефоны',
            price: '78 000',
            stock: 150,
            status: 'В наличии',
        },
        {
            id: 4,
            name: 'iPhone 17 Pro Max 128Gb',
            category: 'Сотовые телефоны',
            price: '78 000',
            stock: 150,
            status: 'В наличии',
        },
        {
            id: 5,
            name: 'iPhone 17 Pro Max 128Gb',
            category: 'Сотовые телефоны',
            price: '78 000',
            stock: 150,
            status: 'В наличии',
        },
        {
            id: 6,
            name: 'iPhone 17 Pro Max 128Gb',
            category: 'Сотовые телефоны',
            price: '78 000',
            stock: 150,
            status: 'В наличии',
        },
        {
            id: 7,
            name: 'iPhone 17 Pro Max 128Gb',
            category: 'Сотовые телефоны',
            price: '78 000',
            stock: 150,
            status: 'В наличии',
        },
    ]);

    onRowClick(product: any): void {
        console.log('Row clicked:', product);
    }

    onSearch(query: string): void {
        console.log('Search:', query);
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        console.log('Sort:', sort);
    }

    onPageChange(page: number): void {
        console.log('Page:', page);
    }

    onAddClick(): void {
        console.log('Add product');
    }
}
