import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ProductsListingComponent } from './components/modules/products/products-listing/products-listing';
import { StoreListingComponent } from './components/modules/stores/store-listing/store-listing';
import { PricesListingComponent } from './components/modules/prices/prices-listing/prices-listing';
import { CategoriesListingComponent } from './components/modules/categories/categories-listing/categories-listing';
import { AttributesListingComponent } from './components/modules/attributes/attributes-listing/attributes-listing';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', component: DashboardComponent },
    { path: 'catalog', component: ProductsListingComponent },
    { path: 'catalog/categories', component: CategoriesListingComponent },
    { path: 'catalog/products', component: ProductsListingComponent },
    { path: 'catalog/stores', component: StoreListingComponent },
    { path: 'catalog/prices', component: PricesListingComponent },
    { path: 'catalog/attributes', component: AttributesListingComponent },
];
