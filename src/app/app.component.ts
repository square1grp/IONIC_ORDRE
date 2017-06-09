import { CachePage } from './../pages/cache/cache';
import { Component} from '@angular/core';
import { LoginPage } from '../pages/login/login';
import { MenuController, Platform, Events } from 'ionic-angular'; 
import { Data } from '../providers/data';
import { Values } from '../providers/values';
import { Connectivity } from '../providers/connectivity';
//  Native
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { ViewloaderPage } from '../pages/viewloader/viewloader';
import { ItemPage } from '../pages/item/item';
import { LinesheetPage } from '../pages/linesheet/linesheet';
import { OrderitemPage } from '../pages/orderitem/orderitem';
import { OrdersPage } from '../pages/orders/orders';
import { SettingsPage } from '../pages/settings/settings';
import { CollectionPage } from '../pages/collection/collection';
import { DesignersPage } from '../pages/designers/designers';
import { OrdreHeader } from '../pages/header/header';
import { CartPage } from '../pages/cart/cart';
import { ViewOrderPage } from '../pages/vieworder/vieworder';
import { View360Page } from '../pages/view360/view360';
import { BrowserModule } from '@angular/platform-browser';
import { InAppBrowser } from '@ionic-native/in-app-browser';


@Component({
  templateUrl: 'app.html',
  providers: [Data]
})
export class MyApp {

  rootPage: any = LoginPage;

  constructor(private statusBar: StatusBar, private splashScreen: SplashScreen, public platform: Platform, public menu: MenuController, public dataService: Data, public events: Events, public connectivity: Connectivity, public values: Values) {
    platform.ready().then(() => {
      // StatusBar.styleDefault();
      console.log('Platform ready')
      this.splashScreen.hide();
      this.statusBar.hide();
      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString('#000000');
      //ScreenOrientation.lockOrientation('landscape') --- throws an error 
    });
  }

}


