import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController, AlertController } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { Values } from '../../providers/values';
import { Data } from '../../providers/data';
import { ViewloaderPage } from '../viewloader/viewloader'

@Component({
  selector: 'page-cache',
  templateUrl: 'cache.html'
})


  //  mode
  //  0 = no cache
  //  1 = just try and cache
  //  2 = delete then cache
  //  3 = just delete


export class CachePage {

  downloadedCollections: any;
  uiState:any; 
  viewloaderPage = ViewloaderPage; 

  constructor(public popoverController:PopoverController, public navCtrl: NavController, public navParams: NavParams, private values:Values, private storage:Storage, private data:Data, private alertCtrl: AlertController) {}

  ngOnInit(){
    this.uiState ='downloaded';
    //this.data.presentLoadingCustom();
    this.data.getDownloads().then(() =>{
      this.data.getLog();
      //this.data.loading.dismiss().catch((err) => {console.log('Problem with spinner:'+err)});
    });         
  }

  uiChange(newstate){
    this.uiState = newstate;
  }  

  toggleForceCache(){
    this.values.user_profile.forcecache=!this.values.user_profile.forcecache;
    console.log('Force Cache:'+this.values.user_profile.forcecache);
  }

  clearCache(){
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
            //this.data.presentLoadingCustom();         
            this.storage.clear().then(() =>{
              //resave user profile
              this.data.saveUser(this.values.user_profile);         
              this.data.addDownlog('Remove All','',0,'',0); 
              this.data.getDownloads().then(() =>{
                //this.data.loading.dismiss()
                //this.data.loading.dismiss().catch((err) => {console.log('Problem with spinner:'+err)});
                //this.data.getLog();
              }); 
            })                            
          }
        }
      ]
    });
    alert.present();      
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CachePage');
  }

  downloadManager(collection_id,designer_id,designer,collection,mode){
     if(mode!=3){ 
      if(!this.values.online){
        this.data.offlineManager();
        return false;
      };  
     }
      //let record_id = 'collections_'+designer_id;
      console.log('Getting collections for designer:'+designer_id)
      this.data.getCollections(designer_id,this.values.device_token,this.values.user_profile.user_token,0).then(response => {
        console.log('Got collections for designer')
        this.values.collections = response;
        if(mode!=3){
          if(this.values.user_profile.forcecache){
            mode=5
          }
          else
          {
            mode=4
          } 
        }
        let popover = this.popoverController.create(this.viewloaderPage,{collection_id:collection_id,designer_id:designer_id,mode:mode, source:'cache'});
        popover.present();
        this.data.cacheCollection(collection_id,designer_id,designer,collection,mode);    
     });            
  }

  openPage(page): void {
    this.navCtrl.push(page);
  }

  popView(){
    this.navCtrl.pop();
  }


}
