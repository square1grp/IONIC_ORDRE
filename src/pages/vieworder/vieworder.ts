import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { CartProvider } from '../../providers/cart';
import { Values } from '../../providers/values';
import { Data } from '../../providers/data';
import { DesignersPage } from '../designers/designers';
import { CollectionPage } from '../collection/collection';

@Component({
    selector: 'page-vieworder',
    templateUrl: 'vieworder.html',
})

export class ViewOrderPage {

    vieworder: any;
    viewcartItems: any;
    submitResponse: any;
    designersPage = DesignersPage;
    collectionPage = CollectionPage;

    constructor(public navCtrl: NavController, public navParams: NavParams, public cartProvider: CartProvider, public values: Values, public data: Data, private alertCtrl: AlertController) {

    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ViewOrderPage');
    }

    ngOnInit() {

        //   sort cart order parts by product_id
        /*
        for (let i = 0, len = this.values.cart.request.order[0].sales_order_parts.length; i < len; i++) { 
          this.values.cart.request.order[0].sales_order_parts[i].sort((a,b) => {
            return a.product_id - b.product_id;
          });
        }
        */
        console.log('View Order:' + JSON.stringify(this.values.vieworder));
        this.addSizes().then(data => {
            this.setItemQty();
        })

    }

    addSizes() {
        return new Promise((resolve, reject) => {
            //  create a shadow cart with only a single instance of each variant in each designer
            //this.cartItems = {'sales_order_parts':[]};
            console.log('Adding Sizes');
            this.values.vieworder.request.order[0].sales_order_parts.forEach((orderPart, part_index) => {

                //  copy order part to shadow without sales order lines
                //let order_lines = orderPart.sales_order_lines;
                //console.log('Before Delete:'+JSON.stringify(this.values.cart));
                //delete orderPart.sales_order_lines;
                //console.log('After Delete:'+JSON.stringify(this.values.cart));
                //let npindex = this.cartItems.sales_order_parts.push(orderPart);
                //this.cartItems.sales_order_parts[npindex-1].sales_order_lines = [];
                //console.log('New Order Part Added:'+JSON.stringify(this.cartItems));
                //let AllProducts = ''; 

                console.log('Get currency profile');
                this.data.getDesignerCurrency(this.values.user_profile.user_region_id, orderPart.seller_account_id)
                orderPart.currency_code = this.values.designer.buyer_code;
                orderPart.currency_symbol = this.values.designer.buyer_symbol;
                console.log('Got' + orderPart.currency_code + ' : ' + orderPart.currency_symbol);

                //  get all collections for this designer
                this.data.getThisCollections(orderPart.seller_account_id, this.values.device_token, this.values.user_profile.user_token).then(data => {

                    //  check each product in each collections
                    console.log('Checking products to map QTY selectors')
                    this.values.collections.forEach((collection, cindex) => {
                        //if(cindex>1){
                        this.data.getProduct(collection.collection_id, this.values.device_token, this.values.user_profile.user_token, 0, 0).then(data => {
                            //}
                            //this.values.products = data;
                            //  each product
                            console.log('Checking for products in order part:' + part_index);
                            this.values.products.forEach((product, pindex) => {
                                //  each variant
                                product.variants.forEach((variant, vindex) => {
                                    // is it in cart?
                                    let abort = false;
                                    console.log('Checking order for products:' + variant.variant_id);
                                    for (let sindex = 0, len = this.values.vieworder.request.order[0].sales_order_parts[part_index].sales_order_lines.length; sindex < len && !abort; sindex++) {
                                        console.log('Test:' + this.values.vieworder.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].variant_id);
                                        if (this.values.vieworder.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].variant_id == variant.variant_id) {
                                            console.log('Found one.');
                                            //gotchya    
                                            abort = true;
                                            //build size array
                                            let NewTotal = 0;
                                            this.values.vieworder.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].size = [];
                                            let newSizes = this.values.vieworder.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].size
                                            console.log('Before:' + JSON.stringify(this.values.vieworder.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex]));
                                            let CurrentTotal = this.values.vieworder.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].variant_total;
                                            if (isNaN(CurrentTotal)) { CurrentTotal = 0 }
                                            variant.sizes.forEach((size) => {
                                                let NewSizeID = newSizes.push({ 'sku': size.sku, 'variant_id': size.variant_id, 'title': size.size_title, 'variant_size_id': size.variant_size_id, 'qty': 0 });
                                                console.log('After Push:' + JSON.stringify(this.values.vieworder.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex]));
                                                NewSizeID = NewSizeID - 1;
                                                //New Code
                                                let orderQTY = this.cartProvider.getViewSizeQty(size.sku, orderPart.seller_account_id)
                                                let price = parseInt(this.values.vieworder.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].price)
                                                if (isNaN(orderQTY)) { orderQTY = 0 }
                                                if (orderQTY > 0 && price > 0) {
                                                    NewTotal = CurrentTotal + (orderQTY * price)
                                                }
                                                else {
                                                    //NewTotal = 0
                                                }
                                                console.log('New Total:' + NewTotal)
                                                this.values.vieworder.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].variant_total = NewTotal
                                                if (orderQTY == 0) {
                                                    newSizes[NewSizeID].qty = '';
                                                }
                                                else {
                                                    newSizes[NewSizeID].qty = orderQTY;
                                                }
                                                //End New Code                         
                                            });
                                            console.log('Added sizes w qty:' + JSON.stringify(newSizes));
                                            console.log('to order:' + JSON.stringify(this.values.vieworder));
                                            resolve(null);
                                            //let newLine = this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex]
                                            //this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].size = newSizes;
                                            //console.log('Added sizes:'+JSON.stringify(this.values.cart.request.order[0].sales_order_parts[part_index].sales_order_lines[sindex].size));
                                            //this.cartItems.sales_order_parts[part_index].sales_order_lines.push(newLine);
                                            //console.log('New Item Added to Shadow:'+JSON.stringify(this.cartItems));
                                        }
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
        //console.log('Real Cart Contains:'+JSON.stringify(this.values.cart)); 
    }

    setItemQty() {

        console.log('Setting Item QTYs');
        //  set QTY field for product variant size from cart
        this.values.vieworder.request.order[0].sales_order_parts.forEach((order_part, z) => {
            console.log('Setting QTYs in PART:' + z);
            order_part.sales_order_lines.forEach((item, y) => {
                console.log('LINE:' + y);
                item.variant_total = 0;
                if (item.size) {
                    item.size.forEach((thisSize) => {
                        var orderQTY = this.cartProvider.getViewSizeQty(thisSize.sku, order_part.seller_account_id)

                        item.variant_total = item.variant_total + (orderQTY * item.price)
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

    handleCart(results) {

        this.vieworder = results;

    }

    popView() {
        this.navCtrl.pop();
    }
}
