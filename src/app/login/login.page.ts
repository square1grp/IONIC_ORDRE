import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Values } from '../values.service';
import { Data } from '../data.service';
import { CartProvider } from '../cart.service';

@Component({
  selector: 'page-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
    loginForm: any;
    response: any;
    designer: any;
    errorMessage: any;
    loggingin: any;

    constructor(
        private router: Router,
        public navCtrl: NavController,
        public formBuilder: FormBuilder,
        public data: Data,
        public values: Values,
        public cartProvider: CartProvider,
        private alertCtrl: AlertController,
        public loadingCtrl: LoadingController
    ) {
        this.loginForm = formBuilder.group({
            user_email: [''],
            user_password: ['']
        });
        this.errorMessage = '';
    }

    ngOnInit() {
        this.data.initDB().then(async (data) => {
            if (this.values.APIRoot == "https://ordre.kineticmedia.com.au") {
                let alert = await this.alertCtrl.create({
                    header: 'WARNING: You are running on the TEST database.',
                    subHeader: 'Orders will not be processed.',
                    buttons: [
                        {
                            text: 'Accept',
                            handler: () => {
                            }
                        }
                    ]
                });
                await alert.present();
                if (this.values.hasOwnProperty('user_profile')) {
                    if (this.values.user_profile.user_id > 0) {
                        console.log('Returning user');
                    }
                }
            };
        });
    }

    ionViewWillEnter() {
        if (this.loginForm) {
            this.loginForm.controls.user_email.setValue('');
            this.loginForm.controls.user_password.setValue('');
        }
    }

    offlineManager() {
    }

    submitLogin(): void {
        if (!this.values.online) {
            this.data.offlineManager();
            return;
        } else {
            this.values.isHeavyLoad = true;
            this.data.presentLoadingSpinerSec().then(() => {
                this.values.onescreen_total_imgages_num = 3;
                this.values.onescreen_image_index = 0;

                let logindata = this.loginForm.value;
                this.data.login(logindata, this.values.device_token).then(async (response) => {

                    //set user profile
                    this.values.user_profile = response['body'];
                    this.values.user_profile.masquerade_id = 0;  //whenmasquarading, user id of masquerader
                    this.values.user_profile.forcecache = 0;  //don't force update images when recaching

                    if (this.values.user_profile.status === 'ok') {
                        this.logUserIn();
                    } else {
                        this.data.dismissLoadingSpiner();
                        let alert = await this.alertCtrl.create({
                            header: this.values.user_profile.title,
                            subHeader: this.values.user_profile.subTitle,
                            buttons: ['Dismiss']
                        });
                        await alert.present();
                    }
                }).catch(err => {
                    console.log(err);
                    this.data.dismissLoadingSpiner();
                });
            });
            
        }
    }

    logUserIn() {
        this.data.getCountries();
        this.data.updateOldOrders();
        this.values.device_token = this.values.user_profile.device_token;
        this.cartProvider.emptyOrder();
        this.data.initActivityLogs();
        this.values.user_profile.masquerade_id = 0;
        delete this.values.user_profile._rev;
        this.data.saveUser(this.values.user_profile);

        if (this.values.user_profile.seller_account_id) {
            this.values.isDesignerLogin = true;
            this.data.getDRAssociationWithDParam(this.values.user_profile.seller_account_id, this.values.user_profile.device_token, this.values.user_profile.user_token).then(data => {
                this.values.associationByDesigner = data;
            }).catch(err => {
                console.log(err);
            });
            // get shipping addresses from server
            this.data.getShippings(this.values.user_profile.device_token, this.values.user_profile.user_token, "ALL").then((response) => {
                this.values.shipping_addresses = response;
            });

            // get retailers from server
            this.data.getRetailers(this.values.device_token, this.values.user_profile.user_token).then(response => {
                this.values.retailers = response;
            }).catch(err => {
                console.log(err);
            });

            //  get the designer object from the list of designers
            //  so get all designers
            //  iterate through to find this one
            this.data.getDesigners(this.values.device_token, this.values.user_profile.user_token, 0).then((response) => {
                this.values.designers = response;
                this.values.onescreen_total_imgages_num = this.values.designers.length;
                let abort = false;
                for (let i = 0, len = this.values.designers.length; i < len && !abort; i++) {
                    if (this.values.designers[i].seller_account_id == this.values.user_profile.seller_account_id) {
                        this.values.designer = this.values.designers[i];
                        abort = true;
                    }
                }
                this.data.getDesignerCurrency(this.values.user_profile.user_region_id, 0);

                //  get first collection for designer / check collection is downloaded if offline

                this.data.getThisCollections(this.values.designer.seller_account_id, this.values.device_token, this.values.user_profile.user_token).then((data) => {

                    //check collection is downloaded if we're offline
                    if (!this.values.online) {
                        if (this.values.collections[0].offline != 'Downloaded') {
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
                        this.navCtrl.navigateRoot('/collection');
                    }).catch(function (err) {
                        console.log(err);
                    });
                })
            });
        }
        else {
            this.values.isDesignerLogin = false;
            this.data.getDRAssociationWithRParam(this.values.user_profile.retailer_id, this.values.user_profile.device_token, this.values.user_profile.user_token).then(data => {
                this.values.associationByRetailer = data;
            }).catch(err => {
                console.log(err);
            });;
            this.data.getShippings(this.values.user_profile.device_token, this.values.user_profile.user_token, this.values.user_profile.buyer_id).then((response) => {
                this.values.shipping_address = response[0];
            });
            this.navCtrl.navigateRoot('/designers');
        }
    }
}
