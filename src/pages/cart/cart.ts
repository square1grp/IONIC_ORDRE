import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController, Content } from 'ionic-angular';
import { CartProvider } from '../../providers/cart';
import { Values } from '../../providers/values';
import { Data } from '../../providers/data';
import { OrdersPage } from '../orders/orders';
import { DesignersPage } from '../designers/designers';
import { CollectionPage } from '../collection/collection';
import { Keyboard } from '@ionic-native/keyboard';
import * as Constants from '../../providers/constants'

/*
  Generated class for the Cart page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation. 
*/

@Component({
    selector: 'page-cart',
    templateUrl: 'cart.html',
})
export class CartPage {

    cart: any;
    cartItems: any;
    submitResponse: any;
    submitting: boolean;
    door_address_visibility: boolean = false;
    country: string;

    designersPage = DesignersPage;
    collectionPage = CollectionPage;

    @ViewChild(Content) content: Content;
    @ViewChild("linesheetScroolUp") scrollContent: Content;
    @ViewChild('focusInput') forcusInput;

    constructor(public navCtrl: NavController, public toastCtrl: ToastController, public navParams: NavParams, public cartProvider: CartProvider,
        public values: Values, public data: Data, private alertCtrl: AlertController, public keyboard: Keyboard) {

    }

    ngOnInit() {
        this.submitting = false;
        this.data.consoleLog("this.values.user_profile", this.values.user_profile);
        this.data.consoleLog("this.values.user_profile", this.values.user_profile);
        this.data.consoleLog("this.values.cart before addSizes()", this.values.cart);
        this.addSizes();
        this.data.consoleLog("this.values.cart", this.values.cart);
        this.data.consoleLog("values.cart.request.order[0].sales_order_parts", this.values.cart.request.order[0].sales_order_parts);
        this.data.consoleLog("this.values.countries", this.values.countries);
    }

    addSizes() {
        //return new Promise((resolve, reject) => {
        console.log('*** Adding Sizes ***');
        this.data.consoleLog("this.values.designers", this.values.designers);
        this.values.cart.request.order[0].sales_order_parts.forEach((orderPart, part_index) => {
            this.values.designers.forEach(element => {
                if (element.seller_account_id == orderPart.seller_account_id) {
                    this.values.designer = element;
                }
            });

            if (this.values.designer == undefined) {
                this.values.designers.forEach(element => {
                    if (element.title == this.values.cart.request.order[0].sales_order_parts[0].designer_title) {
                        this.values.designer = element;
                    }
                });
            }
            console.log('Get currency profile');
            this.data.getDesignerCurrency(this.values.user_profile.user_region_id, orderPart.seller_account_id)
            orderPart.currency_code = this.values.designer.buyer_code;
            orderPart.currency_symbol = this.values.designer.buyer_symbol;
            console.log('Got' + orderPart.currency_code + ' : ' + orderPart.currency_symbol);
            //  get all collections for this designer
            this.data.getThisCollections(orderPart.seller_account_id, this.values.device_token, this.values.user_profile.user_token).then(data => {
                //  check each product in each collections
                console.log('Checking products to map QTY selectors for:' + orderPart.seller_account_id)
                this.values.collections.forEach((collection, cindex) => {
                    this.data.getProduct(collection.collection_id, this.values.device_token, this.values.user_profile.user_token, 0, 1).then(data => {
                        console.log('Got Product Data')
                        collection.products = data;
                        //  each product
                        collection.products.forEach((product, pindex) => {
                            //  each variant
                            product.variants.forEach((variant, vindex) => {
                                // is it in cart?
                                let abort = false;
                                let CurrentTotal = 0;
                                for (let sindex = 0, len = this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines.length;
                                    sindex < len && !abort; sindex++) {
                                    if (this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].variant_id == variant.variant_id) {
                                        console.log('Found one.');
                                        //gotchya    
                                        abort = true;
                                        //build size array
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
                                            let price = parseInt(this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].price)
                                            if (isNaN(orderQTY)) { orderQTY = 0 }
                                            if (orderQTY > 0 && price > 0) {
                                                CurrentTotal = CurrentTotal + (orderQTY * price);
                                                console.log('Added:' + orderQTY + ' x ' + price);
                                            }
                                            this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].variant_total = CurrentTotal;
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
        this.data.consoleLog("Real Cart Contains", this.values.cart);
    }

    addToCart(product_title, colour, material, swatch, image, designer_title, variant_id, sku, price, event, designer_id,
        size, size_id, type, product_id) {

        if (this.values.user_profile.seller_account_id != 0) {
            console.log('this.values.user_profile.seller_account_id :' + this.values.user_profile.seller_account_id);
            return false;
        }
        let qty = event.target.value;
        console.log('add to cart:' + qty);
        this.cartProvider.addToCart(product_title, colour, material, swatch, image, designer_title, designer_id, product_id, variant_id,
            size, size_id, type, qty, price, sku);

        this.setItemQty();
    }

    addSpecial(event, variant_id, part_id) {

        if (this.values.user_profile.seller_account_id != 0) { return false; }
        let message = event.target.value;
        console.log('Variant ID:' + variant_id + ':' + message);
        this.values.cart.request.order[0].sales_order_parts[part_id].sales_order_lines.forEach((line, i) => {
            if (this.values.cart.request.order[0].sales_order_parts[part_id].sales_order_lines[i].variant_id == variant_id) {
                this.values.cart.request.order[0].sales_order_parts[part_id].sales_order_lines[i].special_request = message;
                console.log('Set request for line:' + i)
            }
        });
        console.log('===== addSpecial ========');
    }

    addPurchaseOrder(event, part_id) {
        if (this.values.user_profile.seller_account_id != 0) { return false; }
        let message = event.target.value;
        this.values.cart.request.order[0].sales_order_parts[part_id].purchase_order = message;
    }

    clearItem(order_part, product_id, keepit, variant_id) {
        console.log("========  clear Item in Current Order page ======");
        console.log('Clear line variant id:' + variant_id);
        this.cartProvider.clearItem(order_part, product_id, keepit, variant_id);
        this.setItemQty();

        this.data.activityLogPost(Constants.LOG_REMOVE_FROM_RANGINGROOM, this.values.cart.request.order[0].sales_order_parts[order_part].seller_account_id, '', product_id, variant_id);
    }

    clearDesigner(order_part) {
        this.data.consoleLog("clear designer", order_part);
        this.cartProvider.clearItem(order_part, 0, 0, 0);
        this.data.activityLogPost(Constants.LOG_REMOVE_FROM_RANGINGROOM, this.values.cart.request.order[0].sales_order_parts[order_part].seller_account_id, 'all', 'all', 'all');
    }

    clearOrder() {
        console.log("========  clear Order**** in Current Order page ======");
        //this.values.cart = Object.assign({}, this.values.emptyCart);
        //this.navCtrl.push(LoginPage);  
        let confirm = this.alertCtrl.create({
            title: 'Confirm Clear Order',
            message: 'Are you sure?',
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
                        // let toast = this.toastCtrl.create({
                        //   message: "Your Order has been cleared.",
                        //   duration: 3000,
                        //   position: 'middle'
                        // });
                        // toast.present();

                        console.log('/----Clear Order----/');
                        this.data.consoleLog("this.values.user_profile.seller_account_id", this.values.user_profile.seller_account_id);
                        this.data.consoleLog("this.values.user_profile.masquerade_id", this.values.user_profile.masquerade_id);
                        if (this.values.user_profile.seller_account_id > 0 || this.values.user_profile.masquerade_id > 0) {
                            this.navCtrl.setRoot(CollectionPage, { designer: this.values.designer });
                        }
                        else {
                            this.navCtrl.setRoot(DesignersPage);
                        }
                    }
                }
            ]
        });
        confirm.present();
    }

    setItemQty() {
        //  set QTY field for product variant size from cart
        this.values.cart.request.order[0].sales_order_parts.forEach((order_part, z) => {
            order_part.sales_order_lines.forEach((item, y) => {
                item.variant_total = 0;
                if (item.size) {
                    item.size.forEach((thisSize) => {
                        var orderQTY = this.cartProvider.getSizeQty(thisSize.sku, order_part.seller_account_id);

                        item.variant_total = item.variant_total + (orderQTY * item.price);
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
        //console.log('Real Cart post Qty Set Contains:'+JSON.stringify(this.values.cart));
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
        this.keyboard.close();
        console.log('add to cart');
        if (this.submitting == true) { return false; }
        //check we're online
        if (!this.values.online) {
            this.data.offlineManager();
            //this.data.loading.dismiss().catch((err) => {console.log('Problem with spinner:'+err)});
            return false;
        };
        this.submitting = true;
        //  submit to API
        this.cartProvider.submitCart(mode).then((response) => {
            this.submitResponse = response;
            this.data.consoleLog("this.submitResponse", this.submitResponse);
            this.values.cart.request.order[0].order_id = this.submitResponse.result.order_id;
            //console.log('Order ID:'+ this.submitResponse.result.order_id);
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
                this.navCtrl.push(OrdersPage, { uistate: mode });
                this.data.activityLogPost(Constants.LOG_ORDER_REQUESTED, '', '', '', '');
            }
        });
    }

    saveRequested() {
        console.log('Save Requested');
        let hasZero = this.checkZeroQTY();
        if (hasZero) {
            let alert = this.alertCtrl.create({
                title: 'Please note:',
                subTitle: "You are submitting an Order that contains no Qty for some Products.",
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
            alert.present();
        }
        else {
            this.doSave();
        }
    }

    doSave() {
        console.log('Save');
        this.values.cart.request.order[0].sales_order_parts.forEach((order_part, z) => {
            order_part.date = new Date();
            order_part.door =  this.values.cart.request.order[0].door;
            this.data.saveOrder(order_part).then(data => {
                console.log('Order Part ID:' + JSON.stringify(data))
            })
            //let orderPart = this.data.getDraftOrder(draft_id);
            //console.log('Retrieved:'+JSON.stringify(orderPart));
        });
        //this.data.getAllOrders(this.values.user_profile.buyer_id,this.values.user_profile.seller_account_id);  
        this.submitting = false;
        //this.cartProvider.emptyOrder();
        //this.navCtrl.setRoot(OrdersPage);
        let alert = this.alertCtrl.create({
            title: 'Order requested.',
            subTitle: "Tap ‘view’ to review submitted orders.",
            buttons: ['Dismiss']
        });
        alert.present();
    }

    saveDraft(mode, ui) {
        this.forcusInput.setFocus();
        this.keyboard.close();
        console.log('Save Draft');
        this.data.consoleLog("this.values.cart", this.values.cart);

        if (this.submitting == true) return false;
        this.submitting = true;

        this.values.cart.request.order[0].sales_order_parts.forEach((order_part, z) => {
            order_part.date = new Date();
            order_part.door =  this.values.cart.request.order[0].door;
            if (ui == 'copy') order_part.status = 'COPY';
            if (ui == 'draft') order_part.status = 'LOCAL_DRAFT';
            this.data.saveDraftOrder(order_part).then(data => {
                console.log('Order Part ID:' + JSON.stringify(data))
            })
            //let orderPart = this.data.getDraftOrder(draft_id);
            //console.log('Retrieved:'+JSON.stringify(orderPart));
        });

        this.data.getAllDraftOrders(this.values.user_profile.buyer_id, this.values.user_profile.masquerade_id);

        //this.navCtrl.setPage(OrdersPage);
        if (ui == 'draft') {
            let alert = this.alertCtrl.create({
                title: 'Order saved as draft',
                subTitle: 'You can restore a saved draft at any time.',
                buttons: ['Dismiss']
            });
            alert.present();
            this.data.activityLogPost(Constants.LOG_ORDER_DRAFT_SAVED, '', '', '', '');
        }
        else if (ui == 'server') {
            let alert = this.alertCtrl.create({
                title: 'Draft Order sent to the server',
                subTitle: 'Tap ‘view’ to review draft.',
                buttons: ['Dismiss']
            });
            alert.present();
        } 
        else {
            let alert = this.alertCtrl.create({
                title: 'A Copy has been created',
                subTitle: 'You can restore a saved copy at any time.',
                buttons: ['Dismiss']
            });
            alert.present();
        }
        if (ui == 'copy') {
            this.submitting = false;
            return false;
        } 
        this.cartProvider.emptyOrder();
        this.submitting = false;
        this.navCtrl.push(OrdersPage, { uistate: mode });
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
