import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { CollectionPage } from '../collection/collection';
import { Values } from '../../providers/values';
import { Data } from '../../providers/data';

@Component({
  selector: 'page-designers',
  templateUrl: 'designers.html'
})
export class DesignersPage {
  collectionPage = CollectionPage;
  params: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private data: Data, public values: Values, public loadingCtrl: LoadingController) {
  }

  ngOnInit(){
    console.log('Init');
    this.values.designers = null;
    this.getTheseDesigners();
    this.values.isDesignersPage = true;
  }

  ngAfterViewChecked(){
  }
 
  designerCollections(designer){
      this.data.presentLoadingSpiner();
      this.values.designer = designer;
      this.data.getDesignerCurrency(this.values.user_profile.user_region_id,0);
      this.data.getThisCollections(this.values.designer.seller_account_id,this.values.device_token,this.values.user_profile.user_token).then((data) => {   
        //check collection is downloaded if we're offline
        if(!this.values.online){
          if(this.values.collections[0].offline!='Downloaded'){
            this.data.offlineManager();
            return false;
          }
        };
        console.log('Online:'+this.values.online)

        this.values.products = null;
        this.data.getProduct(this.data.currentCollectionID,this.values.device_token,this.values.user_profile.user_token,0,0).then(data => {
          this.data.consolelog('Set products from download after init')
          this.data.consolelog('Got product JSON:'+this.data.currentCollectionID)
          
          this.values.isDesignersPage = false;
          this.navCtrl.push(CollectionPage, { designer: designer, mode:'' });
        }).catch(function(err){
            console.log(err);
        });
      }).catch(function(err){
          return false;
      });
  }

  getTheseDesigners(){
      let force = false;
      if(this.values.isDesignersPage == true) {
          force = true;
          this.data.presentLoadingSpiner();
      }
      this.data.getDesigners(this.values.device_token, this.values.user_profile.user_token, force).then((response) => {
        //this.data.consolelog('Designers:'+JSON.stringify(response));
        console.log('About to render');
        this.values.designers = response //.designers[0];
        console.log("//-----this.values.designers-----//");
        console.log(this.values.designers);
        this.data.dismissLoadingSpiner();
      }).catch(function(err){
            console.log(err);
      });
  }
}
