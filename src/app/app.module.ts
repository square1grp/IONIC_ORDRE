import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { File } from '@ionic-native/file/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ViewloaderComponent } from './shared/viewloader/viewloader.component';

@NgModule({
    declarations: [
        AppComponent,
        ViewloaderComponent
    ],
    entryComponents: [
        ViewloaderComponent

    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        AppRoutingModule,
        HttpClientModule,
    ],
    providers: [
        StatusBar,
        SplashScreen,
        File,
        HTTP,
        Network,
        Insomnia,
        Keyboard,
        InAppBrowser,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
