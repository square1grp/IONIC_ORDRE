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
  }

  ngAfterViewChecked(){
  }
 
  designerCollections(designer){
    let loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
        spinner: 'crescent',
        content: "<div id='loading' class='loading_container'><div class='loading_spinner'></div></div>"}
    );
    loading.present().then(() => {
      this.values.designer = designer;
      this.data.getDesignerCurrency(this.values.user_profile.user_region_id,0);
      this.data.getThisCollections(this.values.designer.seller_account_id,this.values.device_token,this.values.user_profile.user_token).then((data) => {   
        //check collection is downloaded if we're offline
        if(!this.values.online){
          if(this.values.collections[0].offline!='Downloaded'){
            loading.dismiss().catch((err) => {console.log('Problem with spinner:'+err)});
            this.data.offlineManager();
            return false;
          }
        };
        console.log('Online:'+this.values.online)

        this.values.products = null;
        this.data.getProduct(this.data.currentCollectionID,this.values.device_token,this.values.user_profile.user_token,0,0).then(data => {
          this.data.consolelog('Set products from download after init')
          this.data.consolelog('Got product JSON:'+this.data.currentCollectionID)
          console.log('Loading init items');
          setTimeout(() => {
                loading.dismissAll();
          }, 1600);
          this.navCtrl.push(CollectionPage, { designer: designer, mode:'' });
        }).catch(function(err){
            console.log(err);
            loading.dismissAll();
        });
      }).catch(function(err){
            loading.dismiss().catch((error) => {console.log('Problem with spinner:'+error)});
            return false;
        });
    });
  }

  getTheseDesigners(){
      this.data.getDesigners(this.values.device_token,this.values.user_profile.user_token,0).then((response) => {
        //this.data.consolelog('Designers:'+JSON.stringify(response));
        console.log('About to render');
        this.values.designers = response //.designers[0];
      }).catch(function(err){
            console.log(err);
      });
  }
}
