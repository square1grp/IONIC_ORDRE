import { Component, ViewChild } from '@angular/core';
import { PopoverController, ViewController, NavController, AlertController, NavParams, Content } from 'ionic-angular';
import { CartProvider } from '../../providers/cart';
import { Values } from '../../providers/values';
import { Data } from '../../providers/data';
import { View360Page } from '../view360/view360';
import { SettingsPage } from '../settings/settings';
import { Slides } from 'ionic-angular';
import * as Constants from '../../providers/constants'

//import circlr from 'circlr';

@Component({
    selector: 'page-item',
    templateUrl: 'item.html'
})
export class ItemPage {

    slideOptions: any;
    product: any;
    //designer: any;
    collection: any;
    show3D: boolean = false;
    default360: any;
    currency_code: any;
    currency_symbol: any;
    yesThisHas360: any;
    is_multiple_images: boolean = false;


    //  keypad
    @ViewChild(Content) content: Content;
    @ViewChild(Slides) slides: Slides;

    cart: any;
    nb: any;
    qty: any;

    constructor(public navCtrl: NavController, public viewCtrl: ViewController, public popoverCtrl: PopoverController, private alertCtrl: AlertController,
        public navparams: NavParams, public cartProvider: CartProvider, public values: Values, public data: Data) {

    }

    view360(variants, default360) {
        console.log(variants);
        console.log(default360);
        let popover = this.popoverCtrl.create(View360Page, {productVariants: variants, default360: default360, data: this.data});
        console.log('popover');
        console.log(popover);
                
        popover.present();

        //this.data.consolelog('try to render 3d')
        //  https://www.pincer.io/npm/libraries/circlr

        /*
        const el = document.querySelector('#test3d');    
        console.log('Element:'+JSON.stringify(el));
        circlr(el)
          .scroll(true)
          .interval(150)
          .play(23)
          .reverse(true)
          .on('show', n => {
          });
        */
    }

    ngOnInit() {
        this.product = this.navparams.get("product");
        this.collection = this.navparams.get("collection");
        this.data.designer = this.navparams.get("designer");
        this.data.getDesignerCurrency(this.values.user_profile.user_region_id, -1);
        this.has360();

        //set the slider key frames
        let abort = false;
        let keyCount = 0;
        this.product.variants[0].slidekey = 0
        for (let i = 0, len = this.product.variants.length; i < len && !abort; i++) {
            if (i > 0) {
                keyCount = this.product.variants[i - 1].variant_images.length + keyCount;
                this.product.variants[i].slidekey = keyCount;
                console.log(keyCount + ':' + this.product.variants[i - 1].variant_images.length);
            }
        }
        if (keyCount == 0 && this.product.variants[0].variant_images.length < 2) {
            this.is_multiple_images = false;
        }
        else {
            this.is_multiple_images = true;
        }
        this.data.consoleLog("this.data.designer", this.data.designer);
        this.data.consoleLog("this.product", this.product);
    }

    ionViewDidLoad() {
        this.data.activityLogPost(Constants.LOG_VIEWED_PRODUCT, this.values.designer.seller_account_id, this.collection.collection_id, this.product.product_id, '');
        
    }

    ionViewDidEnter() {
        this.setItemQty();
    }

    viewSlide(slideNo) {
        this.slides.slideTo(slideNo);
    }

    next() {
        this.slides.slideNext();
    }

    prev() {
        this.slides.slidePrev();
    }

    addToCart(product_title, colour, material, swatch, image, designer_title, variant_id, sku, price, price_rrp,
        event, designer_id, size, size_id, type, product_id) {
        this.data.consoleLog("price", price);

        let icon_path = this.isVariantInOrder(product_id, variant_id, designer_id);
        if (icon_path == "assets/images/selected-icon.png") {
        //if (event == null && icon_path == "assets/images/selected-icon.png") {
                let abort = false;
            for (let i = 0, len = this.values.cart.request.order[0].sales_order_parts.length; i < len && !abort; i++) {
                if (this.values.cart.request.order[0].sales_order_parts[i].seller_account_id == designer_id) {
                    abort = true;
                    let qty_abort = false;
                    for (let j = 0, len = this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines.length; j < len && !qty_abort; j++) {
                        let line = this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j];
                        if (!line.hasOwnProperty('size') && line.variant_id == variant_id && line.quantity > 0) {
                            qty_abort = true;
                        }
                    }
                    if (qty_abort) {
                        let alert = this.alertCtrl.create({
                            title: 'Are you sure you want to remove this item?',
                            subTitle: 'This will remove the quantities for this item in your selection',
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
                                        this.cartProvider.clearItem(i, product_id, 0, variant_id);
                                        this.setItemQty();
                                        this.qty = 0;
                                    }
                                }
                            ]
                        });
                        alert.present();
                    }
                    else {
                        this.cartProvider.clearItem(i, product_id, 0, variant_id);
                    }
                }
            }
        }
        else {
            if (this.values.user_profile.seller_account_id != 0) { 
                if (event == null) {
                    let alert = this.alertCtrl.create({
                        title: 'Are you trying to add this style to your selection?',
                        subTitle: 'To create a selection begin by selecting a buyer',
                        buttons: [
                            {
                                text: 'Cancel',
                                role: 'cancel',
                                handler: () => {
                                    console.log('Cancel clicked');
                                }
                            },
                            {
                                text: 'Select buyer',
                                handler: () => {
                                    console.log('Select buyer clicked');
                                    this.navCtrl.push(SettingsPage);
                                }
                            }
                        ]
                    });
                    alert.present();
                }
                return false; 
            }
            if (event == null) {
                this.qty = 0;
            } else {
                this.qty = event.target.value;
                if (this.qty == "") this.qty = 0;
            }
            this.cartProvider.addToCart(product_title, colour, material, swatch, image, designer_title, designer_id,
                product_id, variant_id, size, size_id, type, this.qty, price, price_rrp, sku);
            this.setItemQty();
            this.qty = 0;
    
            this.data.activityLogPost(Constants.LOG_ADD_TO_RANGINGROOM, designer_id, this.collection.collection_id, product_id, variant_id);
        }
    }

    onFocusSize(event) {
        if (this.values.user_profile.seller_account_id != 0) { 
            let alert = this.alertCtrl.create({
                title: 'Are you trying to add this style to your selection?',
                subTitle: 'To create a selection begin by selecting a buyer',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                            console.log('Cancel clicked');
                        }
                    },
                    {
                        text: 'Select buyer',
                        handler: () => {
                            console.log('Select buyer clicked');
                            this.navCtrl.push(SettingsPage);
                        }
                    }
                ]
            });
            alert.present();
            event.target.value = "";
            return false; 
        }
    }
    
    clearItem(variant_id, keepit) {
        this.cartProvider.clearSomeItem(variant_id, keepit);
        this.setItemQty();
    }

    setItemQty() {
        //  set QTY field for product variant size from cart
        this.product.variants.forEach((variant, vindex) => {
            this.product.variants[vindex].total = 0
            this.product.variants[vindex].total_rrp = 0
            variant.sizes.forEach((size, sindex) => {
                var orderQTY = this.cartProvider.getSizeQty(this.product.variants[vindex].sizes[sindex].sku, this.data.designer.seller_account_id);

                if (this.values.designer_pricelist.region_index == null) {
                    this.product.variants[vindex].total = this.product.variants[vindex].total + (orderQTY * this.product.region_prices[this.values.user_profile.user_region_id<4 ? this.values.user_profile.user_region_id - 1 : this.values.user_profile.user_region_id - 2].wsp);
                    this.product.variants[vindex].total_rrp = this.product.variants[vindex].total_rrp + (orderQTY * this.product.region_prices[this.values.user_profile.user_region_id<4 ? this.values.user_profile.user_region_id - 1 : this.values.user_profile.user_region_id - 2].rrp);
                }
                else {
                    this.product.variants[vindex].total = this.product.variants[vindex].total + (orderQTY * this.product.region_prices[this.values.designer_pricelist.region_index].wsp);
                    this.product.variants[vindex].total_rrp = this.product.variants[vindex].total_rrp + (orderQTY * this.product.region_prices[this.values.designer_pricelist.region_index].rrp);
                }
            if (orderQTY == 0) {
                    this.product.variants[vindex].sizes[sindex].qty = '';
                }
                else {
                    this.product.variants[vindex].sizes[sindex].qty = orderQTY;
                }
            });
        });

    }

    has360() {
        let abort = false;
        for (let i = 0, len = this.product.variants.length; i < len && !abort; i++) {
            for (let j = 0, len = this.product.variants[i].variant_images.length; j < len && !abort; j++) {
                if (this.product.variants[i].variant_images[j].variant_360) {
                    abort = true;
                    this.yesThisHas360 = true;
                    this.default360 = this.product.variants[i].variant_images[j].variant_360;
                }
            }
        }
    }

    scrollToTop() {
        this.content.scrollToTop();
    }

    popView() {
        this.navCtrl.pop();
    }

    isVariantInOrder(product_id, variant_id, designer_id) {
        let abort = false;
        for (let part = 0, len = this.values.cart.request.order[0].sales_order_parts.length; part < len && !abort; part++) {
            if (this.values.cart.request.order[0].sales_order_parts[part].seller_account_id == designer_id) {
                //check line items
                for (let line = 0, len = this.values.cart.request.order[0].sales_order_parts[part].sales_order_lines.length;
                    line < len && !abort; line++) {
                    if (this.values.cart.request.order[0].sales_order_parts[part].sales_order_lines[line].product_id == product_id
                        && this.values.cart.request.order[0].sales_order_parts[part].sales_order_lines[line].variant_id == variant_id) {
                        abort = true;
                    }
                }
            }
        }
        if (abort) {
            return ("assets/images/selected-icon.png");
        }
        else {
            return ("assets/images/select-icon.png");
        }
    }

}
