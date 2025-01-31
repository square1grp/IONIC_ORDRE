import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Values } from '../values.service';
import { Data } from '../data.service';
import { CartProvider } from '../cart.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import * as Constants from '../constants';

/*
  Generated class for the Cart page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation. 
*/

@Component({
    selector: 'page-cart',
    templateUrl: './cart.page.html',
    styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {

    cart: any;
    cartItems: any;
    submitResponse: any;
    submitting: boolean;
    door_address_visibility: boolean = false;
    country: string;
    size_add_event: any;

    @ViewChild("linesheetScroolUp") scrollContent: any;
    @ViewChild('focusInput') forcusInput: any;

    constructor(private zone: NgZone, public navCtrl: NavController, private router: Router, public toastCtrl: ToastController, public cartProvider: CartProvider,
        public values: Values, public data: Data, private alertCtrl: AlertController, public keyboard: Keyboard) {

    }

    ngOnInit() {
        this.submitting = false;
        this.addSizes();
    }

    addSizes() {
        this.values.cart.request.order[0].sales_order_parts.forEach((orderPart, part_index) => {
            let designer;
            this.values.designers.forEach(element => {
                if (element.seller_account_id === orderPart.seller_account_id) {
                    designer = element;
                }
            });

            if (this.values.designer === undefined) {
                this.values.designers.forEach(element => {
                    if (element.title === this.values.cart.request.order[0].sales_order_parts[0].designer_title) {
                        designer = element;
                    }
                });
                if (this.values.designer === undefined) return;
            }

            this.data.getDesignerCurrency(this.values.user_profile.user_region_id, orderPart.seller_account_id);
            orderPart.currency_code = designer.buyer_code;
            orderPart.currency_symbol = designer.buyer_symbol;

            //  get all collections for this designer
            this.data.getThisCollections(orderPart.seller_account_id, this.values.device_token, this.values.user_profile.user_token, false).then((collections: any) => {

                //  check each product in each collections
                collections.forEach((collection, cindex) => {
                    this.data.getProduct(collection.collection_id, this.values.device_token, this.values.user_profile.user_token, 0, false).then(data => {
                        collection.products = data;
                        collection.products.forEach((product, pindex) => {
                            product.variants.forEach((variant, vindex) => {
                                let abort = false;
                                let CurrentTotal = 0;
                                let CurrentTotal_rrp = 0;
                                let length = this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines.length;
                                for (let sindex = 0;
                                    sindex < length && !abort; sindex++) {
                                    if (this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].variant_id == variant.variant_id) {
                                        abort = true;
                                        this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].size = [];
                                        let newSizes = this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].size;

                                        if (isNaN(CurrentTotal)) { CurrentTotal = 0 }
                                        variant.sizes.forEach((size) => {
                                            let NewSizeID = newSizes.push({
                                                'sku': size.sku,
                                                'variant_id': size.variant_id,
                                                'title': size.size_title,
                                                'variant_size_id': size.variant_size_id,
                                                'qty': 0
                                            });
                                            NewSizeID = NewSizeID - 1;

                                            let orderQTY = this.cartProvider.getSizeQty(size.sku, orderPart.seller_account_id)
                                            let price = parseInt(this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].price);
                                            let price_rrp = parseInt(this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].price_rrp);
                                            if (isNaN(orderQTY)) { orderQTY = 0 }
                                            if (orderQTY > 0 && price > 0) {
                                                CurrentTotal = CurrentTotal + (orderQTY * price);
                                            }
                                            if (orderQTY > 0 && price_rrp > 0) {
                                                CurrentTotal_rrp = CurrentTotal_rrp + (orderQTY * price_rrp);
                                            }
                                            this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].variant_total = CurrentTotal;
                                            this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].variant_total_rrp = CurrentTotal_rrp;
                                            if (orderQTY == 0) {
                                                newSizes[NewSizeID].qty = '';
                                            }
                                            else {
                                                newSizes[NewSizeID].qty = orderQTY;
                                            }
                                        });
                                    }
                                }
                            });
                        });
                    });
                });
            });
        });
    }

    addToCart(product_title, colour, material, swatch, image, designer_title, variant_id, sku, price, price_rrp, event, designer_id,
        size, size_id, type, product_id) {

        if (this.values.user_profile.seller_account_id != 0) {
            return false;
        }
        let qty = event.target.value;
        this.cartProvider.addToCart(product_title, colour, material, swatch, image, designer_title, designer_id, product_id, variant_id,
            size, size_id, type, qty, price, price_rrp, sku);

        this.setItemQty();
    }

    addToCartWithPlus(product_title, colour, material, swatch, image, designer_title, variant_id, sku, price, price_rrp, event, designer_id,
        size, size_id, type, product_id) {
    
        if (this.values.user_profile.seller_account_id != 0) {
            return false;
        }

        let qty = event.target.parentElement.children[1].value;
        if (qty != "" && qty >= 50) return false;
        if (qty == "") {
            event.target.parentElement.children[1].value = 1;
            qty = 1;
        }
        else {
            qty ++;
            event.target.parentElement.children[1].value = qty;
        }
        this.cartProvider.addToCart(product_title, colour, material, swatch, image, designer_title, designer_id, product_id, variant_id,
            size, size_id, type, qty, price, price_rrp, sku);

        this.setItemQty();
    }

    addToCartWithMinus(product_title, colour, material, swatch, image, designer_title, variant_id, sku, price, price_rrp, event, designer_id,
        size, size_id, type, product_id) {
    
        if (this.values.user_profile.seller_account_id != 0) {
            return false;
        }

        let qty = event.target.parentElement.children[1].value;
        if (qty == "") return false;
        if (qty == 1) {
            event.target.parentElement.children[1].value = "";
            qty = "";
        }
        else {
            qty --;
            event.target.parentElement.children[1].value = qty;
        }
        this.cartProvider.addToCart(product_title, colour, material, swatch, image, designer_title, designer_id, product_id, variant_id,
            size, size_id, type, qty, price, price_rrp, sku);

        this.setItemQty();
    }


    onPressWithPlus() {

        if (this.values.user_profile.seller_account_id != 0) {
            return false;
        }
        if(!this.size_add_event) return false;
        let qty = this.size_add_event.target.parentElement.children[1].value;
        if (qty != "" && qty >= 50) return false;
        if (qty == "") {
            this.size_add_event.target.parentElement.children[1].value = 1;
            qty = 1;
        }
        else {
            qty ++;
            this.size_add_event.target.parentElement.children[1].value = qty;
        }
    }

    onPressWithMinus() {
    
        if (this.values.user_profile.seller_account_id != 0) {
            return false;
        }
        if(!this.size_add_event) return false;
        let qty = this.size_add_event.target.parentElement.children[1].value;
        if (qty == "") return false;
        if (qty == 1) {
            this.size_add_event.target.parentElement.children[1].value = "";
            qty = "";
        }
        else {
            qty --;
            this.size_add_event.target.parentElement.children[1].value = qty;
        }
    }

    pressed(event) {
        this.size_add_event = event;
    }
    released(product_title, colour, material, swatch, image, designer_title, variant_id, sku, price, price_rrp, event, designer_id, size, size_id, type, product_id) {
        if (this.size_add_event != undefined) {
            let qty = this.size_add_event.target.parentElement.children[1].value;
            this.cartProvider.addToCart(product_title, colour, material, swatch, image, designer_title, designer_id, product_id, variant_id,
                size, size_id, type, qty, price, price_rrp, sku);
    
            this.setItemQty(); 
            this.size_add_event = undefined;
        }
    }

    addSpecial(event, variant_id, part_id) {

        if (this.values.user_profile.seller_account_id != 0) { return false; }
        let message = event.target.value;
        this.values.cart.request.order[0].sales_order_parts[part_id].sales_order_lines.forEach((line, i) => {
            if (this.values.cart.request.order[0].sales_order_parts[part_id].sales_order_lines[i].variant_id == variant_id) {
                this.values.cart.request.order[0].sales_order_parts[part_id].sales_order_lines[i].special_request = message;
            }
        });
    }

    addPurchaseOrder(event, part_id) {
        if (this.values.user_profile.seller_account_id != 0) { return false; }
        let message = event.target.value;
        this.values.cart.request.order[0].sales_order_parts[part_id].purchase_order = message;
    }

    clearItem(order_part, product_id, keepit, variant_id) {
        this.zone.run(() => {
            this.data.activityLogPost(Constants.LOG_REMOVE_FROM_RANGINGROOM, this.values.cart.request.order[0].sales_order_parts[order_part].seller_account_id, '', product_id, variant_id);
            this.cartProvider.clearItem(order_part, product_id, keepit, variant_id);
            this.setItemQty();
        });
    }

    async clearItemWithConform(order_part, product_id, keepit, variant_id) {
        let qty_abort = false;
        for (let j = 0, len = this.values.cart.request.order[0].sales_order_parts[order_part].sales_order_lines.length; j < len && !qty_abort; j++) {
            let line = this.values.cart.request.order[0].sales_order_parts[order_part].sales_order_lines[j];
            //if (!line.hasOwnProperty('size') && line.variant_id == variant_id && line.quantity > 0) {
            if (line.variant_id == variant_id && line.quantity > 0) {
                qty_abort = true;
            }
        }
        if (qty_abort) {
            let alert = await this.alertCtrl.create({
                header: 'Are you sure you want to remove this item?',
                subHeader: 'This will remove the quantities for this item in your selection',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                            console.log('Cancel clicked');
                        }
                    },
                    {
                        text: 'Confirm',
                        handler: () => {     
                            this.clearItem(order_part, product_id, keepit, variant_id);
                            if (this.values.cart.request.order[0].sales_order_parts[order_part] && this.values.cart.request.order[0].sales_order_parts[order_part].total_line_items > 0) {
                                this.values.cart.request.order[0].total_line_items --;
                                this.values.cart.request.order[0].sales_order_parts[order_part].total_line_items --;
                            }
                        }
                    }
                ]
            });
            await alert.present();
        }
        else {
            this.clearItem(order_part, product_id, keepit, variant_id)
        }
    }

    clearDesigner(order_part) {
        this.data.activityLogPost(Constants.LOG_REMOVE_FROM_RANGINGROOM, this.values.cart.request.order[0].sales_order_parts[order_part].seller_account_id, 'all', 'all', 'all');
        this.cartProvider.clearItem(order_part, 0, 0, 0);
    }

    async clearOrder() {
        let confirm = await this.alertCtrl.create({
            header: 'Confirm Clear Order',
            subHeader: 'Are you sure?',
            buttons: [
                {
                    text: 'Cancel',
                    handler: () => {
                        console.log('Clear Order are canceled');
                    }
                },
                {
                    text: 'OK',
                    handler: () => {
                        this.cartProvider.emptyOrder();
                        this.data.activityLogPost(Constants.LOG_REMOVE_FROM_RANGINGROOM, 'all', 'all', 'all', 'all');
                        // if (this.values.user_profile.seller_account_id > 0 || this.values.user_profile.masquerade_id > 0) {
                        //     this.navCtrl.setRoot(CollectionPage, { designer: this.values.designer });
                        // }
                        // else {
                        //     this.navCtrl.setRoot(DesignersPage);
                        // }
                        this.navCtrl.pop();
                    }
                }
            ]
        });
        await confirm.present();
    }

    setItemQty() {
        //  set QTY field for product variant size from cart
        this.values.cart.request.order[0].sales_order_parts.forEach((order_part, z) => {
            order_part.sales_order_lines.forEach((item, y) => {
                item.variant_total = 0;
                item.variant_total_rrp = 0;
                if (item.size) {
                    item.size.forEach((thisSize) => {
                        var orderQTY = this.cartProvider.getSizeQty(thisSize.sku, order_part.seller_account_id);

                        item.variant_total = item.variant_total + (orderQTY * item.price);
                        item.variant_total_rrp = item.variant_total_rrp + (orderQTY * item.price_rrp);
                        if (orderQTY == 0) {
                            thisSize.qty = '';
                        }
                        else {
                            thisSize.qty = orderQTY;
                        }
                    });
                }
            });
        });
    }

    checkZeroQTY() {
        //  set QTY field for product variant size from cart
        this.values.cart.request.order[0].sales_order_parts.forEach((order_part, z) => {
            order_part.sales_order_lines.forEach((item, y) => {
                if (item.qty == 0) {
                    return true;
                }
            });
        });
        return false;
    }

    saveOrder(mode, ui) {
        this.forcusInput.setFocus();
        this.keyboard.hide();
        if (this.submitting == true) { return false; }
        //check we're online
        if (!this.values.online) {
            this.data.offlineManager();
            return false;
        };
        this.submitting = true;
        //  submit to API
        this.cartProvider.submitCart(mode).then((response) => {
            this.submitResponse = response;
            this.values.cart.request.order[0].order_id = this.submitResponse.result.order_id;
            //apply part order ids
            this.values.cart.request.order[0].sales_order_parts.forEach((order_part, z) => {
                if (mode == 'draft') order_part.status = 'SERVER_DRAFT';
                order_part.order_id = this.submitResponse.result.sales_order_parts[z].order_part_id;
                delete this.values.cart.request.order[0].sales_order_parts[z]._id;
            });
            //  local save
            if (mode == 'draft') {
                this.submitting = false;
                this.saveDraft(mode, ui);
            }
            else {
                this.saveRequested();
                this.cartProvider.emptyOrder();
                this.submitting = false;
                this.router.navigate(['/orders', { uistate: mode }]);
                this.data.activityLogPost(Constants.LOG_ORDER_REQUESTED, '', '', '', '');
            }
        });
    }

    async saveRequested() {
        let hasZero = this.checkZeroQTY();
        if (hasZero) {
            let alert = await this.alertCtrl.create({
                header: 'Please note:',
                subHeader: "You are submitting an Order that contains no Qty for some Products.",
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
                            this.doSave();
                        }
                    }
                ]
            });
            await alert.present();
        }
        else {
            this.doSave();
        }
    }

    async doSave() {
        this.values.cart.request.order[0].sales_order_parts.forEach((order_part, z) => {
            order_part.date = new Date();
            order_part.door =  this.values.cart.request.order[0].door;
            this.data.saveOrder(order_part).then(data => {
            });
        });
        this.submitting = false;
        let alert = await this.alertCtrl.create({
            header: 'Order requested.',
            subHeader: "Tap ‘view’ to review submitted orders.",
            buttons: ['Dismiss']
        });
        await alert.present();
    }

    async saveDraft(mode, ui) {
        this.forcusInput.setFocus();
        this.keyboard.hide();

        if (this.submitting == true) return false;
        this.submitting = true;

        this.values.cart.request.order[0].sales_order_parts.forEach((order_part, z) => {
            order_part.date = new Date();
            order_part.door =  this.values.cart.request.order[0].door;
            if (ui == 'copy') order_part.status = 'COPY';
            if (ui == 'draft') order_part.status = 'LOCAL_DRAFT';
            this.data.saveDraftOrder(order_part).then(data => {
            })
        });

        this.data.getAllDraftOrders(this.values.user_profile.buyer_id, this.values.user_profile.masquerade_id);

        if (ui == 'draft') {
            let alert = await this.alertCtrl.create({
                header: 'Order saved as draft',
                subHeader: 'You can restore a saved draft at any time.',
                buttons: ['Dismiss']
            });
            await alert.present();
            this.data.activityLogPost(Constants.LOG_ORDER_DRAFT_SAVED, '', '', '', '');
        }
        else if (ui == 'server') {
            let alert = await this.alertCtrl.create({
              header: 'Draft Order sent to the server',
              subHeader: 'Tap ‘view’ to review draft.',
              buttons: ['Dismiss']
            });
            await alert.present();
        } 
        else {
            let alert = await this.alertCtrl.create({
              header: 'A Copy has been created',
              subHeader: 'You can restore a saved copy at any time.',
              buttons: ['Dismiss']
            });
            await alert.present();
        }
        if (ui == 'copy') {
            this.submitting = false;
            return false;
        } 
        this.cartProvider.emptyOrder();
        this.submitting = false;
        this.router.navigate(['/orders', { uistate: mode }]);
    }

    handleCart(results) {
        this.cart = results;
    }

    scrollToTop() {
        this.scrollContent.scrollToTop();
    }

    popView() {
        this.navCtrl.pop();
    }

    doorAddressToogle() {
        if (this.door_address_visibility == true) {
            this.door_address_visibility = false;
        } else {
            this.door_address_visibility = true;
        }
    }
    
}
