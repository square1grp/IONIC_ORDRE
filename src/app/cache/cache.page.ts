
import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Router, ActivatedRoute } from '@angular/router';
import { Values } from '../values.service';
import { Data } from '../data.service';
import { ViewloaderComponent } from '../shared/viewloader/viewloader.component';

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

    constructor(
        public popoverController: PopoverController,
        public navCtrl: NavController,
        private router: Router,
        public values: Values,
        private storage: Storage,
        public data: Data,
        private alertCtrl: AlertController
    ) { }

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

    async clearCache() {
        console.log('Clear Cache Clicked');
        let alert = await this.alertCtrl.create({
            header: 'Are you sure?',
            subHeader: 'This will clear all downloaded images and data.',
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
        await alert.present();
    }

    downloadManager(collection_id, designer_id, designer, collection, mode) {
        if (mode != 3) {
            if (!this.values.online) {
                this.data.offlineManager();
                return false;
            };
        }
        console.log('Getting collections for designer:' + designer_id)
        this.data.getCollections(designer_id, this.values.device_token, this.values.user_profile.user_token).then(async response => {
            this.values.collections = response;
            if (mode != 3) {
                if (this.values.user_profile.forcecache) {
                    mode = 5;
                }
                else {
                    mode = 4;
                }
            }
            let popover = await this.popoverController.create({
                component: ViewloaderComponent,
                componentProps: {
                  collection_id: collection_id,
                  designer_id: designer_id,
                  mode: mode,
                  source: 'cache'
                },
            });
            await popover.present();
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

    popView() {
        this.navCtrl.pop();
    }

}
