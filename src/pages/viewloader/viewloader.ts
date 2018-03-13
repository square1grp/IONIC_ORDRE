import { Component } from '@angular/core';
import { Insomnia } from '@ionic-native/insomnia'
import { Storage } from '@ionic/storage';
import { Values } from '../../providers/values';
import { ViewController, NavParams } from 'ionic-angular';
import { Data } from '../../providers/data';

@Component({
    templateUrl: 'viewloader.html'
})

export class ViewloaderPage {
    
    collection_id : number;
    designer_id   : number;
    mode          : number;
    source        : any;
    
    constructor(public values: Values, public storage: Storage, public viewCtrl: ViewController, public data: Data, public navParams: NavParams, private insomnia: Insomnia) { }

    ngOnInit() {

        this.collection_id = this.navParams.get("collection_id")
        this.designer_id = this.navParams.get("designer_id")
        this.mode = this.navParams.get('mode');
        this.source = this.navParams.get('source');
        if(this.mode==4){this.mode=1}; 
        if(this.mode==5){this.mode=2};  
    }

    close() {
        let status='';
        if(this.mode==3){
            status = 'Removed';
        }
        else
        {
            status = 'Downloaded';
        }   
        this.setCollectionStatus(status,this.collection_id).then(() => {
            if(this.source=='collection'){
              //reload collection
            }
            this.storage.get('download_log').then((response) => {
                if (response != null) {
                    let ulog = response.data;
                    for (let i = 0, len = ulog.length; i < len; i++) {
                        for (let j = 0, len = this.values.collections.length; j < len; j++) {
                            if (ulog[i].collection_id == this.values.collections[j].collection_id) {
                                //set collection status
                                this.values.collections[j].offline = ulog[i].action;
                            }
                        }
                    }
                }
            });
            //this.data.addIsOpenedProp();
            this.viewCtrl.dismiss().then(() => {
                // console.log("loaderViewe_Dismissed!!");
                // setTimeout(() => {
                //     console.log("call_dismissSpiner");
                //     this.data.dismissLoadingSpiner();
                // }, 500);
                this.insomnia.allowSleepAgain().then(
                    () => console.log("allowSleepAgain success"),
                    () => console.log("allowSleepAgain error")
                );
                this.data.addIsOpenedProp();
            }).catch((err) => {
                console.log('Problem with spinner:'+err);
            });
        })
      /*
      let abort = false;
      for (let i = 0, len =  this.values.collections.length; i < len && !abort; i++) {    
        if(this.values.collections[i].collection_id==this.collection_id){
          abort=true;
          if(this.mode==3){
            this.values.collections[i].offline = 'Removed';
          }
          else
          {
            this.values.collections[i].offline = 'Downloaded';
          }
          this.values.collections[i].download_date = new Date();        
          this.data.storeCollections('collections_'+this.designer_id,this.values.collections)//.then((data) => {
            // console.log('Product download complete... pretty much!') 
            this.viewCtrl.dismiss(); 
            this.data.getDownloads();
          //});
        } 
      } 
      */     
    }

    abort() {
        this.values.cancel = true;
        this.setCollectionStatus('',this.collection_id).then(() => {
            this.viewCtrl.dismiss().then(() => {
                // console.log("loaderViewe_Dismissed!!");
                // setTimeout(() => {
                //     console.log("call_dismissSpiner");
                //     this.data.dismissLoadingSpiner();
                // }, 500);
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

    setCollectionStatus(status,collection_id) {
        return new Promise((resolve, reject) => {
            // if (collection_id == this.data.selectedCollection.collection_id) {
            //     this.data.selectedCollection.offline = status;
            // }
            let abort = false;
            for (let i = 0, len =  this.values.collections.length; i < len && !abort; i++) {    
                if (this.values.collections[i].collection_id == this.collection_id) {
                    abort = true;
                    this.values.collections[i].offline = status;
                    this.values.collections[i].download_date = new Date();        
                    this.data.storeCollections('collections_' + this.designer_id,this.values.collections)//.then((data) => {
                        // console.log('Product download complete... pretty much!') 
                        resolve(status);
                        this.data.getDownloads();
                        this.data.getLog();
                    //});
                } 
            } 
        });    
    }


}