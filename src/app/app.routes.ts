import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { HomepageComponent } from './pages/homepage/homepage';
import { ProductsListingComponent } from './components/modules/products/products-listing/products-listing';
import { StoreListingComponent } from './components/modules/stores/store-listing/store-listing';
import { PricesListingComponent } from './components/modules/prices/prices-listing/prices-listing';
import { CategoriesListingComponent } from './components/modules/categories/categories-listing/categories-listing';
import { AttributesListingComponent } from './components/modules/attributes/attributes-listing/attributes-listing';
import { UsersListingComponent } from './components/modules/users/users-listing/users-listing';
import { SettingsListingComponent } from './components/modules/settings/settings-listing/settings-listing';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', component: HomepageComponent },
    { path: 'catalog', component: ProductsListingComponent },
    { path: 'catalog/categories', component: CategoriesListingComponent },
    { path: 'catalog/products', component: ProductsListingComponent },
    { path: 'catalog/stores', component: StoreListingComponent },
    { path: 'catalog/prices', component: PricesListingComponent },
    { path: 'catalog/attributes', component: AttributesListingComponent },
    { path: 'users', component: UsersListingComponent },
    { path: 'settings', component: SettingsListingComponent },
];
