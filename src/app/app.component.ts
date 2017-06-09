import { Component} from '@angular/core';
import { LoginPage } from '../pages/login/login';
import { MenuController, Platform, Events } from 'ionic-angular'; 
import { Data } from '../providers/data';
import { Values } from '../providers/values';
import { Connectivity } from '../providers/connectivity';
//  Native
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

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


