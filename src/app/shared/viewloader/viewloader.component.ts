import { Component, OnInit } from '@angular/core';
import { Insomnia } from '@ionic-native/insomnia/ngx'
import { Storage } from '@ionic/storage';
import { PopoverController, NavParams, Events } from '@ionic/angular';
import { Values } from '../../values.service';
import { Data } from '../../data.service';

@Component({
  selector: 'app-viewloader',
  templateUrl: './viewloader.component.html',
  styleUrls: ['./viewloader.component.scss'],
})

export class ViewloaderComponent {
    
    collection_id : number;
    designer_id   : number;
    mode          : number;
    source        : any;
    
    constructor(
        public values: Values, 
        public storage: Storage, 
        public viewCtrl: PopoverController, 
        public data: Data, 
        public events: Events, 
        public navParams: NavParams, 
        private insomnia: Insomnia
    ) { 
        this.collection_id = this.navParams.get("collection_id")
        this.designer_id = this.navParams.get("designer_id")
        this.mode = this.navParams.get('mode');
        this.source = this.navParams.get('source');
        if(this.mode==4){this.mode=1}; 
        if(this.mode==5){this.mode=2};  

        this.events.subscribe("set-collection-state", (collection_id) => {
            if (this.values.cancel == false) {
                let status = 'Downloaded';
                this.setCollectionStatus(status, collection_id).then(() => {
                });
            }
            else {
                this.setCollectionStatus('', collection_id).then(() => {
                });
            }
        })
    }

    close() {
        if (this.collection_id != 0) {
            let status = '';
            if(this.mode == 3){
                status = 'Removed';
            }
            else
            {
                status = 'Downloaded';
            }   
            this.setCollectionStatus(status, this.collection_id).then(() => {
                this.viewCtrl.dismiss().then(() => {
                    this.events.unsubscribe("set-collection-state");
                    this.insomnia.allowSleepAgain().then(
                        () => console.log("allowSleepAgain success"),
                        () => console.log("allowSleepAgain error")
                    );
                    this.data.addIsOpenedProp();
                }).catch((err) => {
                    console.log('Problem with spinner:'+err);
                });
            })
        }
        else {
            this.viewCtrl.dismiss().then(() => {
                this.events.unsubscribe("set-collection-state");
                this.insomnia.allowSleepAgain().then(
                    () => console.log("allowSleepAgain success"),
                    () => console.log("allowSleepAgain error")
                );
                this.data.addIsOpenedProp();
            }).catch((err) => {
                console.log('Problem with spinner:'+err);
            });
        }
    }

    abort() {
        if (this.collection_id != 0) {
            this.values.cancel = true;
            this.setCollectionStatus('',this.collection_id).then(() => {
                this.viewCtrl.dismiss().then(() => {
                    this.events.unsubscribe("set-collection-state");
                    this.insomnia.allowSleepAgain().then(
                        () => console.log("allowSleepAgain success"),
                        () => console.log("allowSleepAgain error")
                    );
                    this.data.addIsOpenedProp();
                }).catch((err) => {
                    console.log('Problem with spinner:' + err);
                });
            });
        }
        else {
            this.viewCtrl.dismiss().then(() => {
                setTimeout(() => {
                    this.events.unsubscribe("set-collection-state");
                }, 2000);
                this.insomnia.allowSleepAgain().then(
                    () => console.log("allowSleepAgain success"),
                    () => console.log("allowSleepAgain error")
                );
                this.data.addIsOpenedProp();
            }).catch((err) => {
                console.log('Problem with spinner:' + err);
            });
        }
    }

    setCollectionStatus(status, collection_id) {
        return new Promise((resolve, reject) => {
            let abort = false;
            for (let i = 0, len =  this.values.collections.length; i < len && !abort; i++) {    
                if (this.values.collections[i].collection_id == collection_id) {
                    abort = true;
                    this.values.collections[i].offline = status;
                    this.values.collections[i].download_date = new Date().toISOString();        
                    this.data.storeCollections('collections_' + this.designer_id, this.values.collections);
                    resolve(status);
                    this.data.getDownloads();
                    this.data.getLog();
                } 
            } 
        });    
    }

}