import { Component, ViewChild, NgZone } from '@angular/core';
import { AlertController, App } from 'ionic-angular';
import { SettingsPage } from '../settings/settings';
import { CartPage } from '../cart/cart';
import { OrdersPage } from '../orders/orders';
import { DesignersPage } from '../designers/designers';
import { CollectionPage } from '../collection/collection';
import { LoginPage } from '../login/login';
import { CachePage } from '../cache/cache';
import { Values } from '../../providers/values';
import { CartProvider } from '../../providers/cart';
import { Data } from '../../providers/data';

//import { SyncPage } from '../sync/sync';
import { Nav, NavController, MenuController } from 'ionic-angular';

@Component({
    selector: 'page-header',
    templateUrl: 'header.html'
})
export class OrdreHeader {

    @ViewChild(Nav) nav: Nav;

    ordreHeader = OrdreHeader

    settingsPage: any = SettingsPage;
    cartPage: any = CartPage;
    ordersPage: any = OrdersPage;
    designersPage: any = DesignersPage;
    collectionPage: any = CollectionPage;
    loginPage: any = LoginPage;
    cachePage: any = CachePage;

    constructor(private zone: NgZone, private app: App, public menu: MenuController, public navCtrl: NavController, public values: Values, public cartProvider: CartProvider, private alertCtrl: AlertController, public data: Data) { }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ordreHeader');
    }

    openPage(page): void {
        //this.navCtrl.setRoot(page);
        this.values.isDesignersPage = false;
        this.navCtrl.push(page);
    }

    openHomePage(page): void {
        this.data.presentLoadingSpinerSec().then(() => {
            this.values.onescreen_total_imgages_num = 3;
            this.values.onescreen_image_index = 0;
            console.log("onescreen_total_imgages_num : " + this.values.onescreen_total_imgages_num);
            console.log("onescreen_image_index : " + this.values.onescreen_image_index);
            this.navCtrl.setRoot(page);
        });
    }

    openCachePage(page): void {
        this.values.isDesignersPage = false;
        //this.navCtrl.setRoot(page);
        //this.navCtrl.setRoot(page);
        this.navCtrl.push(page);
    }

    goPage(page): void {
        this.zone.run(() => {
            this.navCtrl.setRoot(DesignersPage);
        });
        //this.app.getRootNav().setRoot(DesignersPage);
        //this.navCtrl.popToRoot().then(() => {
        //this.navCtrl.remove(1);
        //})
    }


    exitMasquarade() {
        let alert = this.alertCtrl.create({
            title: 'Are you sure?',
            subTitle: 'Unsaved Orders will be lost.',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Logout',
                    handler: () => {
                        this.values.user_profile.seller_account_id = this.values.user_profile.masquerade_id;
                        this.values.user_profile.business_display_name = this.values.user_profile.masquerade_name;
                        if (this.values.user_profile.hasOwnProperty("masquerade_region_id")) {
                            this.values.user_profile.user_region_id = this.values.user_profile.masquerade_region_id;
                            this.values.user_profile.masquerade_region_id = 0;
                            this.data.getDesignerCurrency(this.values.user_profile.user_region_id, 0);
                        }
                        this.values.user_profile.masquerade_id = 0;
                        this.values.user_profile.masquerade_name = '';
                        // empty the cart
                        this.cartProvider.emptyOrder();
                        this.navCtrl.push(SettingsPage);
                    }
                }
            ]
        });
        alert.present();
    }

    logOut() {
        this.values.isDesignersPage = false;
        let alert = this.alertCtrl.create({
            title: 'Are you sure?',
            subTitle: 'Unsaved Orders will be lost.',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Logout',
                    handler: () => {

                        this.cartProvider.emptyOrder();
                        this.values.user_profile = "";
                        this.data.removeUser('user_profile').then(data => {
                            this.navCtrl.push(LoginPage);
                        });
                    }
                }
            ]
        });
        alert.present();
    }

    openCollectionPage(page): void {
        this.values.isDesignersPage = false;
        //this.navCtrl.setRoot(page);
        this.navCtrl.push(page, { designer: this.values.designer });
    }
}
