import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { Platform } from 'ionic-angular';

declare var Connection;

@Injectable()
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