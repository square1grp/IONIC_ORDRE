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
    searchResultRetailers: any = [];
    retailer_id: any = 0;
    collectionPage = CollectionPage;
    retailersLoading: any;
    buyers: any = [];// [{'first_name':'Select Retailer','last_name':'','buyer_id':0}];
    typeahead: string = "";

    constructor(public navCtrl: NavController, public navParams: NavParams, public data: Data, public values: Values) {
        //
    }

    ngOnInit() {
        this.retailersLoading = true;
        this.getThisRetailers().then(data => {
            this.retailersLoading = false;
        }).catch(err => {
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad SettingsPage');
    }

    getThisRetailers() {
        return new Promise((resolve, reject) => {
            this.data.getRetailers(this.values.device_token, this.values.user_profile.user_token).then(response => {
                this.values.retailers = response;
                this.data.consoleLog("this Retailers", response);
                resolve(true);
            }).catch(err => {
                console.log(err);
                reject(false);
            });
        });
    }
    searchRetailers(event) {
        this.searchResultRetailers = this.values.retailers;
        this.retailer_id = 0;
        this.buyers = [];
        this.thisBuyer_id = 0;
        let searchString = event.target.value;
        if (searchString && searchString.trim() != "") {
            this.searchResultRetailers = this.searchResultRetailers.filter((retailer) => {
                return (retailer.business_name.toLowerCase().indexOf(searchString.toLowerCase()) > -1);
            });
            let abort = false;
            if (this.searchResultRetailers.length > 0) {
                for (let i = 0, len = this.searchResultRetailers.length; i < len && !abort; i++) {
                    if (this.searchResultRetailers[i].business_name.toLowerCase().indexOf(searchString.toLowerCase()) == 0) {
                        abort = true;
                        this.typeahead = this.searchResultRetailers[i].business_name;
                        let typeaheadTail = this.searchResultRetailers[i].business_name.substr(searchString.length);
                        this.typeahead = searchString.concat(typeaheadTail);
                    }
                    else {
                        this.typeahead = "";
                    }
                }
            }
            else {
                this.typeahead = "";
            }
        }
        else {
            this.searchResultRetailers = [];
            this.typeahead = "";
        }
    }
    setBuyers() {
        this.thisBuyer_id = 0;
        let abort = false;
        for (let i = 0, len = this.searchResultRetailers.length; i < len && !abort; i++) {
            if (this.searchResultRetailers[i].retailer_id == this.retailer_id) {
                abort = true;
                this.buyers = this.searchResultRetailers[i].buyers
            }
        }
    }

    startMasquerade() {

        let account_id = this.values.user_profile.seller_account_id
        this.values.user_profile.masquerade_id = account_id;
        this.values.user_profile.seller_account_id = 0;
        this.values.user_profile.buyer_id = this.thisBuyer_id;
        this.retailer = this.getRetailer(this.retailer_id);

        // get the region id of selected buyer
        let buyer_region_id = 0;
        let abort = false;
        for (let i = 0, len = this.buyers.length; i < len && !abort; i++) {
            if (this.buyers[i].buyer_id == this.thisBuyer_id) {
                buyer_region_id = this.buyers[i].region_id;
                abort = true;
            }
        }
        if (buyer_region_id == 0 || buyer_region_id == null) buyer_region_id = this.retailer.region_id;
        if (buyer_region_id == 0 || buyer_region_id == null) buyer_region_id = this.values.user_profile.user_region_id;
        if (buyer_region_id == 0 || buyer_region_id == null) buyer_region_id = 1;

        
        let account_name = this.values.user_profile.business_display_name;
        this.values.user_profile.business_display_name = this.retailer.business_name;
        this.values.user_profile.masquerade_name = account_name;
        this.values.user_profile.masquerade_region_id = this.values.user_profile.user_region_id;
        this.values.user_profile.user_region_id = buyer_region_id;
        this.data.consoleLog('this.values.designer', this.values.designer);
        this.data.getDesignerCurrency(buyer_region_id, 0);
        this.data.consoleLog('this.values.designer', this.values.designer);
        
        //get shipping address of the selected buyer.
        abort = false;
        for (let i = 0, len = this.values.shipping_addresses.length; i < len && !abort; i++) {
            if (this.values.shipping_addresses[i].buyer_id == this.thisBuyer_id) {
                this.values.shipping_address = this.values.shipping_addresses[i];
                abort = true;
            }
        }
        this.data.consoleLog("this.values.shipping_address", this.values.shipping_address);
        this.data.consoleLog('this.values.user_profile', this.values.user_profile);
        this.data.consoleLog('this.values.shipping_addresses', this.values.shipping_addresses);
        this.navCtrl.push(CollectionPage, { designer: this.values.designer });
    }

    getRetailer(retailer_id) {
        let abort = false;
        for (let i = 0, len = this.values.retailers.length; i < len && !abort; i++) {
            if (this.values.retailers[i].retailer_id == retailer_id) {
                abort = true;
                return this.values.retailers[i]
            }
        }
    }

    getBuyer(buyer_id) {
        let abort = false;
        for (let i = 0, len = this.buyers.length; i < len && !abort; i++) {
            if (this.buyers[i].buyer_id == buyer_id) {
                if (this.buyers[i].region_id == null) {
                    this.buyers[i].region_id = 1;
                }
                abort = true;
                console.log(this.buyers[i]);
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

    popView() {
        this.navCtrl.pop();
    }
}
