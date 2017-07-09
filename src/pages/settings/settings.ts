import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Values } from '../../providers/values';
import { Data } from '../../providers/data';
import { CollectionPage } from '../collection/collection';

/*
  Generated class for the Settings page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})

export class SettingsPage {

  retailer: any;
  thisBuyer_id: any = 0;
  retailers: any = [];
  searchResultRetailers: any = [];
  retailer_id: any = 0;
  collectionPage = CollectionPage;
  retailersLoading: any;
  buyers: any = [];// [{'first_name':'Select Retailer','last_name':'','buyer_id':0}];

  constructor(public navCtrl: NavController, public navParams: NavParams, public data: Data, private values: Values) {
    //
  }

  ngOnInit(){
    this.retailersLoading = true;
    this.getThisRetailers().then(data => {
      this.retailersLoading = false;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  getThisRetailers(){
    return new Promise((resolve, reject) => {
      this.data.getRetailers(this.values.device_token,this.values.user_profile.user_token).then(response => { 
        this.retailers = response;
        resolve(true);
        // console.log('====== Retailers =======');
        // console.log(this.retailers);
        // console.log('========================');
      });
    });
  }
  searchRetailers(event) {
    this.searchResultRetailers = this.retailers;
    this.retailer_id = 0;
    this.buyers = [];
    this.thisBuyer_id = 0;
    let searchString = event.target.value;
    if(searchString && searchString.trim() != "") {
      this.searchResultRetailers = this.searchResultRetailers.filter((retailer) => {
          return (retailer.business_name.toLowerCase().indexOf(searchString.toLowerCase()) > -1);
      });
    }
    else {
      this.searchResultRetailers = [];
    }
  }
  setBuyers(){
    //  get the retailer from Retailers
      //this.retailer_id = retailer_id
      //console.log('Get buyers for:'+this.retailer_id)
      this.thisBuyer_id = 0;
      let abort = false;
      for (let i = 0, len = this.searchResultRetailers.length; i < len && !abort; i++) { 
        if(this.searchResultRetailers[i].retailer_id == this.retailer_id){
          abort = true;
          this.buyers = this.searchResultRetailers[i].buyers
        }
      }
      console.log('Buyers:' + JSON.stringify(this.buyers));
    //  set buyers
    //this.buyers = [{'first_name':'John','last_name':'Smith','buyer_id':0}];
  }

  startMasquerade(){

    let account_id = this.values.user_profile.seller_account_id
    this.values.user_profile.masquarade_id = account_id;
    this.values.user_profile.seller_account_id = 0;
    this.values.user_profile.buyer_id = this.thisBuyer_id;

    this.retailer = this.getRetailer(this.retailer_id)
    let account_name = this.values.user_profile.business_display_name
    this.values.user_profile.business_display_name = this.retailer.business_name
    this.values.user_profile.masqaurade_name = account_name
    console.log('Masquarade ID:'+this.values.user_profile.masquarade_id+' Buyer ID:'+this.values.user_profile.buyer_id)
    this.navCtrl.push(CollectionPage, { designer: this.values.designer });
  }

  getRetailer(retailer_id){
    let abort=false;
    for (let i = 0, len = this.retailers.length; i < len && !abort; i++) { 
      if(this.retailers[i].retailer_id == retailer_id){
        abort = true;
        return this.retailers[i]
      }
    }  
  }

  getBuyer(buyer_id){
    let abort=false;
    for (let i = 0, len = this.buyers.length; i < len && !abort; i++) { 
      if(this.buyers[i].buyer_id == buyer_id){
        abort = true;
        return this.buyers[i]
      }
    } 
  }

  /*
  getThisBuyers(retailer_id){
    this.data.getBuyers(retailer_id, this.values.device_token,this.values.user_profile.user_token).subscribe(response => {     
      this.buyers = response.result;
      console.log('Buyers:' + JSON.stringify(this.buyers));
    });
  }
  */

  popView(){
    this.navCtrl.pop();
  }
}
