
import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, MenuController } from '@ionic/angular';
import { CartProvider } from '../../cart.service';
import { Values } from '../../values.service';
import { Data } from '../../data.service';

//import { SyncPage } from '../sync/sync';

@Component({
  selector: 'page-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

   ordreHeader = HeaderComponent

    constructor(private zone: NgZone, public menu: MenuController, public navCtrl: NavController, public values: Values, public cartProvider: CartProvider, private alertCtrl: AlertController, public data: Data, private router: Router) { }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ordreHeader');
    }

    openPage(page): void {
        //this.navCtrl.setRoot(page);
        this.values.isDesignersPage = false;
        this.values.isCollectionPage = false;
        this.router.navigate(['/' + page]);
    }

    openHomePage(page): void {
        this.values.isCollectionPage = false;
        this.data.presentLoadingSpinerSec().then(() => {
            this.values.onescreen_total_imgages_num = 3;
            this.values.onescreen_image_index = 0;
            console.log("onescreen_total_imgages_num : " + this.values.onescreen_total_imgages_num);
            console.log("onescreen_image_index : " + this.values.onescreen_image_index);
            this.router.navigate(['/' + page]);
        });
    }

    openCachePage(page): void {
        this.values.isDesignersPage = false;
        this.values.isCollectionPage = false;
        this.router.navigate(['/' + page]);
    }

    goPage(page): void {
        this.zone.run(() => {
          this.router.navigate(['/designers']);
        });
    }


    async exitMasquarade() {
        let alert = await this.alertCtrl.create({
            header: 'Are you sure?',
            subHeader: 'Unsaved Orders will be lost.',
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
                        this.values.isCollectionPage = false;
                        this.router.navigate(['/settings']);
                    }
                }
            ]
        });
        await alert.present();
    }

    async logOut() {
        this.values.isDesignersPage = false;
        this.values.isCollectionPage = false;
        let alert = await this.alertCtrl.create({
            header: 'Are you sure?',
            subHeader: 'Unsaved Orders will be lost.',
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
                        this.values.isDesignerLogin = false;
                        this.values.user_profile = "";
                        this.data.removeUser('user_profile').then(data => {
                          this.router.navigate(['/login']);
                        });
                    }
                }
            ]
        });
        await alert.present();
    }

    openCollectionPage(page): void {
        this.values.isDesignersPage = false;
        this.data.presentLoadingSpinerSec().then(() => {
            this.values.onescreen_total_imgages_num = 3;
            this.values.onescreen_image_index = 0;
            this.router.navigate(['/' + page, { designer: this.values.designer }]);
        });
    }
}
