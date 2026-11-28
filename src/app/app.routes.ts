import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { HomepageComponent } from './pages/homepage/homepage';
import { ParserPageComponent } from './pages/parser/parser';
import { CatalogPageComponent } from './pages/catalog/catalog';
import { PurchasingPageComponent } from './pages/purchasing/purchasing';
import { ContentPageComponent } from './pages/content/content';
import { ReportsPageComponent } from './pages/reports/reports';
import { OrderReportsComponent } from './components/modules/reports/order-reports/order-reports';
import { ReceiveReportsComponent } from './components/modules/reports/receive-reports/receive-reports';
import { ProductsListingComponent } from './components/modules/products/products-listing/products-listing';
import { StoreListingComponent } from './components/modules/stores/store-listing/store-listing';
import { PricesListingComponent } from './components/modules/prices/prices-listing/prices-listing';
import { CategoriesListingComponent } from './components/modules/categories/categories-listing/categories-listing';
import { AttributesListingComponent } from './components/modules/attributes/attributes-listing/attributes-listing';
import { UsersListingComponent } from './components/modules/users/users-listing/users-listing';
import { SettingsListingComponent } from './components/modules/settings/settings-listing/settings-listing';
import { PagesListingComponent } from './components/modules/pages/pages-listing/pages-listing';
import { LogListingComponent } from './components/modules/logs/log-listing/log-listing';
import { PaymentsListingComponent } from './components/modules/payments/payments-listing/payments-listing';
import { DeliveriesListingComponent } from './components/modules/deliveries/deliveries-listing/deliveries-listing';
import { StatusesListingComponent } from './components/modules/statuses/statuses-listing/statuses-listing';
import { SuppliersListingComponent } from './components/modules/suppliers/suppliers-listing/suppliers-listing';
import { ReceivesListingComponent } from './components/modules/receives/receives-listing/receives-listing';
import { BackupListingComponent } from './components/modules/backups/backup-listing/backup-listing';
import { AccountsListingComponent } from './components/modules/accounts/accounts-listing/accounts-listing';
import { OrdersListingComponent } from './components/modules/orders/orders-listing/orders-listing';
import { TasksBoardComponent } from './components/modules/tasks/tasks-board/tasks-board';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, title: 'Вход' },
    { path: '', component: HomepageComponent, title: 'Главная' },
    { path: 'catalog', component: CatalogPageComponent, title: 'Каталог' },
    { path: 'catalog/categories', component: CategoriesListingComponent, title: 'Категории' },
    { path: 'catalog/products', component: ProductsListingComponent, title: 'Товары' },
    { path: 'catalog/stores', component: StoreListingComponent, title: 'Склады' },
    { path: 'catalog/prices', component: PricesListingComponent, title: 'Цены' },
    { path: 'catalog/attributes', component: AttributesListingComponent, title: 'Характеристики' },
    { path: 'purchasing', component: PurchasingPageComponent, title: 'Закупка' },
    { path: 'content', component: ContentPageComponent, title: 'Контент' },
    { path: 'reports', component: ReportsPageComponent, title: 'Отчёты' },
    { path: 'reports/orders', component: OrderReportsComponent, title: 'Отчёт по продажам' },
    {
        path: 'reports/receives',
        component: ReceiveReportsComponent,
        title: 'Отчёт по поступлениям',
    },
    { path: 'team/users', component: UsersListingComponent, title: 'Менеджеры' },
    { path: 'team/tasks', component: TasksBoardComponent, title: 'Задачи' },
    { path: 'receives', component: ReceivesListingComponent, title: 'Поступления' },
    { path: 'settings', component: SettingsListingComponent, title: 'Настройки' },
    { path: 'suppliers', component: SuppliersListingComponent, title: 'Контрагенты' },
    { path: 'content/pages', component: PagesListingComponent, title: 'Страницы' },
    { path: 'orders/statuses', component: StatusesListingComponent, title: 'Статусы' },
    { path: 'orders/payments', component: PaymentsListingComponent, title: 'Способы оплаты' },
    { path: 'orders/deliveries', component: DeliveriesListingComponent, title: 'Способы доставки' },
    { path: 'parser', component: ParserPageComponent, title: 'Парсер' },
    { path: 'logs', component: LogListingComponent, title: 'Журнал' },
    { path: 'backups', component: BackupListingComponent, title: 'Резервные копии' },
    { path: 'accounts', component: AccountsListingComponent, title: 'Клиенты' },
    { path: 'orders', component: OrdersListingComponent, title: 'Заказы' },
];
