import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { PageService } from '../../../../services/page.service';
import { PageIndexParams } from '../../../../models/params/page-index.params';
import { PageModel } from '../../../../models/page.model';
import { PagesIndexResponse } from '../../../../models/responses/pages/pages-index.response';
import { MetaModel } from '../../../../models/meta.model';
import { ConfirmService } from '../../../../services/confirm.service';
import { NotificationService } from '../../../../services/notification.service';
import { PopupService } from '../../../../services/popup.service';
import { PagesEditorComponent } from './../pages-editor/pages-editor';

@Component({
    selector: 'app-pages-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './pages-listing.html',
    styleUrl: './pages-listing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagesListingComponent implements OnInit {
    private readonly pageService = inject(PageService);
    private readonly confirmService = inject(ConfirmService);
    private readonly notificationService = inject(NotificationService);
    private readonly popupService = inject(PopupService);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '100px' },
        { key: 'title', title: 'Название', sortable: true },
        { key: 'alias', title: 'Алиас', sortable: true },
        { key: 'display', title: 'Отображение', type: 'boolean', sortable: true },
    ]);

    pages = signal<PageModel[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    private currentSearch: string = '';
    private currentSort: string = '';
    private currentDirection: 'asc' | 'desc' = 'asc';

    ngOnInit(): void {
        this.loadPages();
    }

    async loadPages(): Promise<void> {
        this.loading.set(true);
        try {
            const params: PageIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                query: this.currentSearch,
                sort: this.currentSort,
                direction: this.currentDirection,
            };

            const response: PagesIndexResponse = await this.pageService.index(params);
            this.pages.set(response.data);
            this.meta.set(response.meta);
        } catch (error) {
            this.notificationService.error('Ошибка при загрузке страниц');
        } finally {
            this.loading.set(false);
        }
    }

    async onCreate(): Promise<void> {
        await this.popupService.open('Создание страницы', PagesEditorComponent);
        this.loadPages();
    }

    onRowClick(page: PageModel): void {
        this.onEdit(page);
    }

    async onEdit(page: PageModel): Promise<void> {
        await this.popupService.open('Редактирование страницы', PagesEditorComponent, {
            id: page.id,
        });
        this.loadPages();
    }

    async onDelete(page: PageModel): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Удаление страницы',
            `Вы уверены, что хотите удалить страницу "${page.title}"?`,
            'Удалить',
            'Отмена',
        );

        if (confirmed) {
            try {
                await this.pageService.delete(page.id);
                this.notificationService.success('Страница успешно удалена');
                this.loadPages();
            } catch (error) {
                this.notificationService.error('Ошибка при удалении страницы');
            }
        }
    }

    onSearch(query: string): void {
        this.currentSearch = query;
        this.page.set(1);
        this.loadPages();
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.currentSort = sort.key;
        this.currentDirection = sort.direction;
        this.page.set(1);
        this.loadPages();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadPages();
    }
}
