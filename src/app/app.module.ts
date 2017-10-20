import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { ViewloaderPage } from '../pages/viewloader/viewloader';
import { LoginPage } from '../pages/login/login';
import { ItemPage } from '../pages/item/item';
import { LinesheetPage } from '../pages/linesheet/linesheet';
import { OrderitemPage } from '../pages/orderitem/orderitem';
import { OrdersPage } from '../pages/orders/orders';
import { SettingsPage } from '../pages/settings/settings';
import { CachePage } from '../pages/cache/cache';
import { CollectionPage } from '../pages/collection/collection';
import { DesignersPage } from '../pages/designers/designers';
import { OrdreHeader } from '../pages/header/header';
import { CartPage } from '../pages/cart/cart';
import { ViewOrderPage } from '../pages/vieworder/vieworder';
import { View360Page } from '../pages/view360/view360';
import { Connectivity } from '../providers/connectivity';
import { BrowserModule } from '@angular/platform-browser';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Keyboard } from '@ionic-native/keyboard';

//import { Storage } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

//  Providers
import { Data } from '../providers/data';
import { CartProvider } from '../providers/cart';
import { Values } from '../providers/values';
import { OrdreImageCache } from '../providers/image-cache';
import { IonicStorageModule } from '@ionic/storage';
import { File } from '@ionic-native/file';
import { Network } from '@ionic-native/network';

@NgModule({
  declarations: [
    MyApp,
    ViewloaderPage,
    LoginPage,
    ItemPage,
    LinesheetPage,
    OrderitemPage,
    OrdersPage,
    SettingsPage,
    CachePage,
    CollectionPage,
    DesignersPage,
    OrdreHeader,
    CartPage,
    ViewOrderPage,
    View360Page,
    OrdreImageCache
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp, {
        platforms: {
          ios: {
              statusbarPadding: true
          }
        }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ViewloaderPage,
    LoginPage,
    ItemPage,
    LinesheetPage,
    OrderitemPage,
    OrdersPage,
    SettingsPage,
    CachePage,
    CollectionPage,
    DesignersPage,
    OrdreHeader,
    CartPage,
    ViewOrderPage,
    View360Page
  ],
  providers: [InAppBrowser,Keyboard, StatusBar,SplashScreen,{provide: ErrorHandler, useClass: IonicErrorHandler}, CartProvider, Connectivity, Data, Values, File, Network]
})
export class AppModule {}
