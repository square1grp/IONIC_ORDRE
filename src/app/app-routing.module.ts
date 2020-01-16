import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'home', loadChildren: './home/home.module#HomePageModule' },
    { path: 'cache', loadChildren: './cache/cache.module#CachePageModule' },
    { path: 'cart', loadChildren: './cart/cart.module#CartPageModule' },
    { path: 'collection', loadChildren: './collection/collection.module#CollectionPageModule' },
    { path: 'designers', loadChildren: './designers/designers.module#DesignersPageModule' },
    { path: 'item', loadChildren: './item/item.module#ItemPageModule' },
    { path: 'linesheet', loadChildren: './linesheet/linesheet.module#LinesheetPageModule' },
    { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
    { path: 'orderitem', loadChildren: './orderitem/orderitem.module#OrderitemPageModule' },
    { path: 'orders', loadChildren: './orders/orders.module#OrdersPageModule' },
    { path: 'settings', loadChildren: './settings/settings.module#SettingsPageModule' },
    { path: 'view360', loadChildren: './view360/view360.module#View360PageModule' },
    { path: 'viewloader', loadChildren: './viewloader/viewloader.module#ViewloaderPageModule' },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
