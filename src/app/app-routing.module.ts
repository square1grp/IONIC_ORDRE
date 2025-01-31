import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'cache', loadChildren: './cache/cache.module#CachePageModule' },
    { path: 'cart', loadChildren: './cart/cart.module#CartPageModule' },
    { path: 'collection', loadChildren: './collection/collection.module#CollectionPageModule' },
    { path: 'designers', loadChildren: './designers/designers.module#DesignersPageModule' },
    { path: 'item', loadChildren: './item/item.module#ItemPageModule' },
    { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
    { path: 'orders', loadChildren: './orders/orders.module#OrdersPageModule' },
    { path: 'settings', loadChildren: './settings/settings.module#SettingsPageModule' },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
