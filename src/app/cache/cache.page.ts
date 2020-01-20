
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, PopoverController, AlertController } from '@ionic/angular';

import { Storage } from '@ionic/storage';
import { Values } from '../../providers/values';
import { Data } from '../../providers/data';
import { ViewloaderPage } from '../viewloader/viewloader'

@Component({
    selector: 'page-cache',
    templateUrl: './cache.page.html',
    styleUrls: ['./cache.page.scss'],
})


//  mode
//  0 = no cache
//  1 = just try and cache
//  2 = delete then cache
//  3 = just delete


export class CachePage {

    downloadedCollections: any;
    uiState: any;
    viewloaderPage = ViewloaderPage;

    constructor(public popoverController: PopoverController, public navCtrl: NavController, public navParams: NavParams, public values: Values, private storage: Storage, public data: Data, private alertCtrl: AlertController) { }

    ngOnInit() {
        this.uiState = 'downloaded';
        //this.data.presentLoadingCustom();
        this.data.getDownloads().then(() => {
            this.data.getLog();

            this.data.addIsOpenedProp();
        });
        this.data.consoleLog('this.data.draftOrders', this.data.draftOrders);
        this.data.consoleLog('this.data.requestedOrders', this.data.requestedOrders);
    }

    uiChange(newstate) {
        this.uiState = newstate;
    }

    toggleForceCache() {
        this.values.user_profile.forcecache = !this.values.user_profile.forcecache;
        console.log('Force Cache:' + this.values.user_profile.forcecache);
    }

    clearCache() {
        console.log('Clear Cache Clicked');
        let alert = this.alertCtrl.create({
            title: 'Are you sure?',
            subTitle: 'This will clear all downloaded images and data.',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Proceed',
                    handler: () => {
                        //clear all images and data (not orders or drafts)
                        this.storage.clear().then(() => {
                            //resave user profile
                            this.data.saveUser(this.values.user_profile);
                            this.data.addDownlog('Remove All', '', 0, '', 0);
                            this.data.getDownloads().then(() => {
                            });
                        })
                    }
                }
            ]
        });
        alert.present();
    }

    ionViewDidLoad() {
    }

    downloadManager(collection_id, designer_id, designer, collection, mode) {
        if (mode != 3) {
            if (!this.values.online) {
                this.data.offlineManager();
                return false;
            };
        }
        console.log('Getting collections for designer:' + designer_id)
        this.data.getCollections(designer_id, this.values.device_token, this.values.user_profile.user_token, 0).then(response => {
            this.values.collections = response;
            if (mode != 3) {
                if (this.values.user_profile.forcecache) {
                    mode = 5;
                }
                else {
                    mode = 4;
                }
            }
            let popover = this.popoverController.create(this.viewloaderPage, {
                collection_id: collection_id, designer_id: designer_id,
                mode: mode, source: 'cache'
            });
            popover.present();
            if (this.values.designer == undefined) {
                if ((designer_id > 0) && (this.values.designers)) {
                    let abort = false;
                    for (let i = 0, len = this.values.designers.length; i < len && !abort; i++) {
                        if (this.values.designers[i].seller_account_id == designer_id) {
                            this.values.designer = this.values.designers[i];
                            abort = true;
                        }
                    }
                }
            }
            this.data.cacheCollection(collection_id, designer_id, designer, collection, mode).then(() => {
                // this.storage.get('download_log').then((response) => {
                //     if (response != null) {
                //         let ulog = response.data;
                //         this.data.consoleLog('ulog', ulog);
                //         for (let i = 0, len = ulog.length; i < len; i++) {
                //             if (ulog[i].collection_id == this.data.selectedCollection.collection_id) {
                //                 //set collection status
                //                 this.data.selectedCollection.offline = ulog[i].action;
                //             }
                //         }
                //     }
                // });
            });
        });
    }

    openPage(page): void {
        this.navCtrl.push(page);
    }

    popView() {
        this.navCtrl.pop();
    }

}
