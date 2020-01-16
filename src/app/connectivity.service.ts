import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';


@Injectable({
    providedIn: 'root'
})
export class Connectivity {

    onDevice: boolean;

    constructor(public platform: Platform, private network: Network) {
        this.onDevice = this.platform.is('cordova');
        console.log("device state");
        console.log(this.onDevice);
        console.log(this.network.type);
    }

    isOnline(): boolean {
        if (this.onDevice && this.network.type)
        {
            return this.network.type !== 'none';
        } else {
            return navigator.onLine;
        }
    }

    isOffline(): boolean {
        if (this.onDevice && this.network.type)
        {
            return this.network.type === 'none';
        } else {
            return !navigator.onLine;
        }
    }

    watchOnline(): any {
        return this.network.onConnect();
    }

    watchOffline(): any {
        return this.network.onDisconnect();
    }

}