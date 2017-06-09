import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
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

  constructor(public navCtrl: NavController, public navParams: NavParams, private data: Data, private values: Values) {

    //
  }

  ngOnInit(){
    console.log('Init');
    this.values.designers = null;
    //this.data.consolelog('ionViewDidLoad DesignersPage');
    this.getTheseDesigners(); 
  }

  ngAfterViewChecked(){
    //console.log('View Checked');
  }
 
  designerCollections(designer){
    this.data.presentLoadingCustom();
    this.values.designer = designer;
    this.data.getDesignerCurrency(this.values.user_profile.user_region_id,0);
    this.data.getThisCollections(this.values.designer.seller_account_id,this.values.device_token,this.values.user_profile.user_token).then((data) => {   
      
      //check collection is downloaded if we're offline
      if(!this.values.online){
        if(this.values.collections[0].offline!='Downloaded'){
          this.data.offlineManager();
          this.data.loading.dismiss().catch((err) => {console.log('Problem with spinner:'+err)});
          return false;
        }
      };      
      console.log('Online:'+this.values.online)

      this.values.products = null;
      this.data.getProduct(this.data.currentCollectionID,this.values.device_token,this.values.user_profile.user_token,0,0).then(data => {
        this.data.consolelog('Set products from download after init')
        this.data.consolelog('Got product JSON:'+this.data.currentCollectionID)
        console.log('Loading init items');
        this.navCtrl.push(CollectionPage, { designer: designer, mode:'' });
      }).catch(function(err){
          console.log(err);
      });       
      
      
    });  
  }

  getTheseDesigners(){
    
    this.data.getDesigners(this.values.device_token,this.values.user_profile.user_token,0).then((response) => {
      //this.data.consolelog('Designers:'+JSON.stringify(response));
      console.log('About to render');
      this.values.designers = response //.designers[0];
    });
  }
}
