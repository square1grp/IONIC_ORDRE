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

    ngOnInit() {
        console.log('Init');
        this.values.designers = null;
        this.getTheseDesigners();
    }

    ngAfterViewChecked() {
    }

    designerCollections(designer) {
        this.data.presentLoadingSpinerSec().then(() => {
            this.values.onescreen_total_imgages_num = 3;
            this.values.onescreen_image_index = 0;

            this.values.designer = designer;

            // set designer special price_list if this designer have its own special price.
            this.values.designer_pricelist.region_id = null;
            this.values.designer_pricelist.region_index = null;
            let abort = false;
            for (var i = 0; i < this.values.associationByRetailer.length && abort == false; i++) {
                if (this.values.designer.seller_account_id == this.values.associationByRetailer[i].seller_account_id) {
                    this.values.designer_pricelist.region_id = this.values.associationByRetailer[i].region_id;
                    for (var j = 0; j < this.values.designer.region_currency.length; j++) {
                        if (this.values.designer.region_currency[j].region_id == this.values.designer_pricelist.region_id) {
                            this.values.designer_pricelist.region_index = j;
                            abort = true;
                            console.log("price_list have just set!");
                            console.log(this.values.designer_pricelist);
                        }
                    }
                }
            }

            this.data.getDesignerCurrency(this.values.user_profile.user_region_id, 0);
            this.data.getThisCollections(this.values.designer.seller_account_id, this.values.device_token, this.values.user_profile.user_token).then((data) => {
                //check collection is downloaded if we're offline
                if (!this.values.online) {
                    let current_collection_index = 0;
                    let abort = false;
                    for (let i = 0, len = this.values.collections.length; i < len && !abort; i++) {
                        if (this.values.collections[i].collection_id == this.data.currentCollectionID) {
                            current_collection_index = i;
                            abort = true;
                        }
                    }
                    if (this.values.collections[current_collection_index].offline != 'Downloaded') {
                        this.data.offlineManager();
                        return false;
                    }
                };
                console.log('Online:' + this.values.online);

                this.values.products = null;
                this.data.getProduct(this.data.currentCollectionID, this.values.device_token, this.values.user_profile.user_token, 0, 0).then(data => {
                    if (this.values.products.length < 9) {
                        this.values.onescreen_total_imgages_num = this.values.products.length * 2;
                    }
                    else {
                        this.values.onescreen_total_imgages_num = 18;
                    }
                    this.data.consoleLog('this.values.products' , this.values.products);
                    this.values.isDesignersPage = false;
                    this.navCtrl.push(CollectionPage, { designer: designer, mode: '' });
                }).catch(function (err) {
                    console.log(err);
                });
            }).catch(function (err) {
                return false;
            });
        });
    }

    getTheseDesigners() {
        let force = false;
        if (this.values.isDesignersPage == true) {
            force = true;
            this.data.getDesigners(this.values.device_token, this.values.user_profile.user_token, force).then((response) => {
                this.values.designers = response;
                console.log("this.valuse.designers---------//");
                console.log(this.values.designers);
                this.values.onescreen_total_imgages_num = this.values.designers.length;
                for (let index = 0; index < this.values.designers.length; index++) {
                    let designer_id = this.values.designers[index].seller_account_id;
                    this.values.collection_checkpoint[designer_id] = new Date('01/01/1980');
                }
            }).catch(function (err) {
                console.log(err);
            });
        }
        else {
            this.data.getDesigners(this.values.device_token, this.values.user_profile.user_token, force).then((response) => {
                this.values.designers = response;
                this.values.onescreen_total_imgages_num = this.values.designers.length;
                this.values.isDesignersPage = true;
            }).catch(function (err) {
                console.log(err);
            });
        }
    }
}
