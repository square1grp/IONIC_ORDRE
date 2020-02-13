import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Values } from '../values.service';
import { Data } from '../data.service';

@Component({
    selector: 'page-designers',
    templateUrl: './designers.page.html',
    styleUrls: ['./designers.page.scss'],
})
export class DesignersPage implements OnInit {
    params: any;

    constructor(
      private router: Router,
      private data: Data,
      public values: Values,
      public loadingCtrl: LoadingController
    ) { }

    ngOnInit() { }

    ionViewWillEnter() {
        this.values.designers = null;
        this.data.getTheseDesigners();
    }

    ionViewDidEnter() {
        this.values.isDesignersPage = true;
    }

    ionViewDidLeave() {
        this.values.isDesignersPage = false;
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

                this.values.products = null;
                this.data.getProduct(this.data.currentCollectionID, this.values.device_token, this.values.user_profile.user_token, 0).then(data => {
                    if (this.values.products.length < 9) {
                        this.values.onescreen_total_imgages_num = this.values.products.length * 2;
                    }
                    else {
                        this.values.onescreen_total_imgages_num = 18;
                    }
                    this.router.navigate(['/collection']);
                }).catch(function (err) {
                    console.log(err);
                });
            }).catch(function (err) {
                return false;
            });
        });
    }
}
