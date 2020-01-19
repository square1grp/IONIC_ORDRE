import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, Platform } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Values } from '../values.service';
import { Data } from '../data.service';
import { CartProvider } from '../cart.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
//import * as Constants from '../../providers/constants'

/*
  Generated class for the Orders page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

// Declaring cordova so we can use it for the plugin
declare var cordova: any;

@Component({
    selector: 'page-orders',
    templateUrl: './orders.page.html',
    styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {

    uiState: any;

    constructor(
      public cartProvider: CartProvider,
      public values: Values,
      public navCtrl: NavController,
      private router: Router,
      private activatedRoute: ActivatedRoute,
      public data: Data,
      private alertCtrl: AlertController,
      private platform: Platform,
      private iab: InAppBrowser
    ) {
        platform.ready().then(() => {
            // If we run this in the browser without this if statement we get an error
            if (typeof cordova !== 'undefined') {
                // Open the InAppBrowser Cordova plugin
                // const browser = cordova.InAppBrowser.open('https://ionic.io');
                // Add the event listener to the InAppBrowser instance
                //browser.addEventListener('loadstart', function(){
                //  console.log('loadstart!');
                //});
            }
        });
    }


    ngOnInit() {
        console.log('OrdersPage');
        this.data.getAllDraftOrders(this.values.user_profile.buyer_id, this.values.user_profile.masquerade_id);
        this.data.getAllOrders(this.values.user_profile.buyer_id, this.values.user_profile.masquerade_id);
        this.uiState = this.activatedRoute.snapshot.paramMap.get('uistate');
        console.log('this.uiState', this.uiState);
        if (this.uiState == 'final') { this.uiState = 'requested'; }
        if (!this.uiState) { this.uiState = 'draft'; }
    }

    uiChange(newstate) {
        this.uiState = newstate;
    }

    async removeDraft(draft_id) {
        console.log('Remove Clicked');
        let alert = await this.alertCtrl.create({
            header: 'Are you sure you want to remove this Draft Order?',
            subHeader: 'Removing this order will delete it.',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Remove',
                    handler: () => {
                        this.data.getDraftOrder(draft_id).then(data => {
                            this.data.deleteDraftOrder(data);
                            this.data.getAllDraftOrders(this.values.user_profile.buyer_id, this.values.user_profile.masquerade_id);
                            console.log('Removed order part:' + draft_id);
                        });
                    }
                }
            ]
        });
        await alert.present();
    }

    viewOrder(order_id) {
        // console.log('View Clicked');
        // this.cartProvider.emptyView();
        // console.log('View:' + order_id);
        // this.data.getOrder(order_id).then(data => {
        //     let orderPart = data;
        //     console.log('Order Part:' + JSON.stringify(orderPart));
        //     console.log('Cart:' + JSON.stringify(this.values.vieworder));
        //     this.values.vieworder.request.order[0].sales_order_parts.push(orderPart);
        //     //pull totals into order header here
        //     this.values.vieworder.request.order[0].total_qty = this.values.vieworder.request.order[0].sales_order_parts[0].total_qty;
        //     //region_currency?
        //     console.log(JSON.stringify(this.values.vieworder))
        //     this.navCtrl.push(ViewOrderPage);
        // });
    }

    webViewOrder(id) {
        const browser = this.iab.create(this.values.APIRoot + '/ordres/detail/' + id, '_blank');
        browser.show();
    }

    async restore(draft_id, mode) {
        console.log('Restore Clicked');
        let alert = await this.alertCtrl.create({
            header: 'Are you sure you wish to restore this Order?',
            subHeader: 'This will replace your Final Edit.',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Proceed',
                    handler: () => {
                        console.log('Restore:' + draft_id);
                        this.cartProvider.emptyOrder();
                        if (mode == "restore_order") {
                            this.data.getOrder(draft_id).then(data => {
                                let orderPart = data;
                                this.data.consoleLog("orderPart", orderPart);
                                this.values.cart.request.order[0].sales_order_parts.push(orderPart);
                                this.values.cart.request.order[0].door = this.values.cart.request.order[0].sales_order_parts[0].door;
                                this.values.cart.request.order[0].total_line_items = this.values.cart.request.order[0].sales_order_parts[0].total_line_items;
                                this.values.cart.request.device_token = this.values.user_profile.device_token;
                                this.values.cart.request.user_token = this.values.user_profile.user_token;
                                this.values.cart.request.order[0].total_qty = this.values.cart.request.order[0].sales_order_parts[0].total_qty;
                                this.values.cart.request.order[0].user_id = this.values.user_profile.user_id;
                                this.values.cart.request.order[0].buyer_id = this.values.user_profile.buyer_id;
                                this.router.navigate(['/cart']);
                            })
                        }
                        else {
                            this.data.getDraftOrder(draft_id).then(data => {
                                let orderPart = data;
                                this.data.consoleLog("orderPart", orderPart);
                                this.values.cart.request.order[0].sales_order_parts.push(orderPart);
                                this.values.cart.request.order[0].door = this.values.cart.request.order[0].sales_order_parts[0].door;
                                this.values.cart.request.order[0].total_line_items = this.values.cart.request.order[0].sales_order_parts[0].total_line_items;
                                this.values.cart.request.device_token = this.values.user_profile.device_token;
                                this.values.cart.request.user_token = this.values.user_profile.user_token;
                                this.values.cart.request.order[0].total_qty = this.values.cart.request.order[0].sales_order_parts[0].total_qty;
                                this.values.cart.request.order[0].user_id = this.values.user_profile.user_id;
                                this.values.cart.request.order[0].buyer_id = this.values.user_profile.buyer_id;
                                if (mode == 'draft') this.data.deleteDraftOrder(data);
                                this.data.getAllDraftOrders(this.values.user_profile.buyer_id, this.values.user_profile.masquerade_id);
                                this.router.navigate(['/cart']);
                            });
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    popView() {
        this.navCtrl.pop();
    }
}
