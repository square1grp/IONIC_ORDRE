import { Component, OnInit, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { NavController, AlertController, PopoverController, Events } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { Values } from '../values.service';
import { Data } from '../data.service';
import { CartProvider } from '../cart.service';
import { ViewloaderComponent } from '../shared/viewloader/viewloader.component';
import * as Constants from '../constants';

@Component({
  selector: 'page-collection',
  templateUrl: './collection.page.html',
  styleUrls: ['./collection.page.scss'],
})
export class CollectionPage implements OnInit {

    navOpen: boolean = true;
    mode: any;
    /*
    collections: any;
    products: any;
    designer: any;
    currentCollectionID: any;
    selectedCollection: any;
    */
    myjson: any = JSON;

    @ViewChild("collectionScroll") scrollContent: any;

    items = [];
    maxItems: any;
    firstItem: any;
    lastItem: any;
    searchValue: string;
    selected_varants_count: number = 0;
    popover: any = null;
    popover_index: number = 0;
    searchTerm$ = new Subject<string>();

    constructor(
        private cd: ChangeDetectorRef, 
        public popoverController: PopoverController, 
        private zone: NgZone, 
        private router: Router,
        private activatedRoute: ActivatedRoute,
        public data: Data,
        public cartProvider: CartProvider, 
        public values: Values, 
        private alertCtrl: AlertController,
        private events: Events,
        private popoverCtrl: PopoverController, 
        private insomnia: Insomnia) {
        
        
        // set designer special price_list if this designer have its own special price.
        if (this.values.isDesignerLogin) {
            this.values.designer_pricelist.region_id = null;
            this.values.designer_pricelist.region_index = null;
            for (var i = 0; i < this.values.associationByDesigner.length; i++) {
                let abort = false;
                for (var j = 0; j < this.values.associationByDesigner[i].retailers.length && abort == false; j++) {
                    if (this.values.user_profile.retailer_id == this.values.associationByDesigner[i].retailers[j]) {
                        this.values.designer_pricelist.region_id = this.values.associationByDesigner[i].region_id;
                        abort = true;
                        for (var k = 0; k < this.values.designer.region_currency.length; k++) {
                            if (this.values.designer.region_currency[k].region_id == this.values.designer_pricelist.region_id) {
                                this.values.designer_pricelist.region_index = k;
                            }
                        }
                    }
                }
            }
            this.data.getDesignerCurrency(this.values.user_profile.user_region_id, 0);
        }



        if (this.values.isCollectionPage == true && (this.values.user_profile.seller_account_id > 0 || this.values.user_profile.masquerade_id > 0)) {

            this.values.search = '';
            this.searchValue = '';

            this.values.collection_checkpoint[this.values.designer.seller_account_id] = new Date('01/01/1980');
            this.data.formatCollections(this.values.designer.seller_account_id);
            this.data.getDesignerCurrency(this.values.user_profile.user_region_id, 0);
            this.data.getThisCollections(this.values.designer.seller_account_id, this.values.device_token, this.values.user_profile.user_token).then((data) => {
                //check collection is downloaded if we're offline
                if (!this.values.online) {
                    if (this.values.collections[0].offline != 'Downloaded') {
                        this.data.offlineManager();
                        return false;
                    }
                };

                this.values.products = null;
                this.data.getProduct(this.data.currentCollectionID, this.values.device_token, this.values.user_profile.user_token, 0, 0).then(data => {
                    if (this.values.products.length < 9) {
                        this.values.onescreen_total_imgages_num = this.values.products.length * 2;
                    }
                    else {
                        this.values.onescreen_total_imgages_num = 18;
                    }

                    this.mode = this.activatedRoute.snapshot.paramMap.get('mode');
                    if (this.mode != 'fromlinesheet') {
                        this.firstItem = 0;
                        this.addItemsToGrid('', 0);
                    }
            
                    if (this.mode == 'fromlinesheet') {
                        this.values.lsproducts = this.values.products;
                    }
                    this.search();
                    this.values.longTimeRequestUrls = [];
                    this.values.productCashImageUrls = [];

                }).catch(function (err) {
                    console.log(err);
                });
            }).catch(function (err) {
                return false;
            });
        }
        else {
            this.values.search = '';
            this.searchValue = '';
            this.values.isCollectionPage = true;

            this.mode = this.activatedRoute.snapshot.paramMap.get('mode');
            if (this.mode != 'fromlinesheet') {
                this.firstItem = 0;
                this.addItemsToGrid('', 0);
            }
    
            if (this.mode == 'fromlinesheet') {
                this.values.lsproducts = this.values.products;
            }
            this.search();
            this.values.longTimeRequestUrls = [];
            this.values.productCashImageUrls = [];
        }
    }

    ngOnInit() {
        this.values.view_mode = "grid view";
    }

    ngAfterViewInit() {
        this.scrollContent.ionScrollStart.subscribe(() => {
            this.closeOverlay(this.popover_index);
        });
    }

    ionViewDidLoad() {
        this.data.activityLogPost(Constants.LOG_VIEWED_COLLECTION, this.values.designer.seller_account_id, this.data.designer.currentCollectionID, '', '');
    }

    search() {
        this.searchTerm$.debounceTime(1000)
        .distinctUntilChanged().subscribe(searchString => {
            let mode = 0;
            this.searchValue = searchString;
            if (searchString.length == 0) { mode = 1; }
            this.addItemsToGrid(searchString, mode);
        });
    }

    addItemsToGrid(search, mode) {
        this.maxItems = this.values.products.length;
        if (((search.length > 0) && (mode != 2)) || (mode == 1)) {
            this.firstItem = 0;
            this.lastItem = 0;
            this.items = [];
        }
        if (this.firstItem > this.maxItems) {
            return false;
        }
        if ((this.firstItem + 18) > this.maxItems) {
            this.lastItem = this.maxItems;
        }
        else {
            this.lastItem = this.firstItem + 18;
        }

        let abort = false;
        for (var i = this.firstItem; i < this.lastItem && abort == false; i++) {
            if (search.length > 0) {
                if (this.values.products[i].search_me.toLowerCase().indexOf(search.toLowerCase()) >= 0) {
                    let item = Object.assign({is_overlay: false}, this.values.products[i]);
                    this.items.push(item);
                }
                else {
                    if (this.lastItem < this.maxItems) { this.lastItem = this.lastItem + 1; }
                }
            }
            else {
                let item = Object.assign({is_overlay: false}, this.values.products[i]);
                this.items.push(item);
            }
        }
        this.firstItem = this.lastItem;
    }



    doInfinite(event) {
        this.addItemsToGrid(this.searchValue, 2);
        event.target.complete();
  
        // App logic to determine if all data is loaded
        // and disable the infinite scroll
    }

    async addProductToCart(product_title, material, designer_title, price, price_rrp, designer_id, type, product_id) {

        if (this.values.user_profile.seller_account_id != 0) { 
            let alert = await this.alertCtrl.create({
                header: 'Are you trying to add this style to your selection?',
                subHeader: 'To create a selection begin by selecting a buyer',
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
                            this.router.navigate(['/settings']);
                        }
                    }
                ]
            });
            await alert.present();
            return false; 
        }
        //find the product
        let abort = false;
        for (let pindex = 0, len = this.values.products.length; pindex < len && !abort; pindex++) {
            if (this.values.products[pindex].product_id == product_id) {
                abort = true;
                //add all the variants to cart

                if (this.values.products[pindex].variants.length == 1) {
                    this.addVariantToCart(product_title, material, designer_title, price, price_rrp, designer_id, type, product_id, this.values.products[pindex].variants[0].variant_id);
                }
                else {
                    this.values.products[pindex].variants.forEach((variant) => {
                        let is_variant = this.isVariantInOrder(product_id, variant.variant_id, designer_id);
                        if (is_variant != "assets/images/selected-icon.png") {
                            this.cartProvider.addToCart(product_title + ' : ' + variant.title, variant.colour,
                                material, variant.swatch.swatch_image, variant.variant_images[0].variant_image,
                                designer_title, designer_id, product_id, variant.variant_id, variant.sizes[0].size_title,
                                variant.sizes[0].variant_size_id, type, 0, price, price_rrp, variant.sizes[0].sku);
                        }
                    });
                }

                this.data.activityLogPost(Constants.LOG_ADD_TO_RANGINGROOM, designer_id, this.data.selectedCollection.collection_id, product_id, 'all');
            }
        }
    }

    addAllToCart(product_title, material, designer_title, price, price_rrp, designer_id, type, product_id, i) {
        this.addProductToCart(product_title, material, designer_title, price, price_rrp, designer_id, type, product_id);
        this.items[i].is_overlay = false;
    }

    async addVariantToCart(product_title, material, designer_title, price, price_rrp, designer_id, type, product_id, variant_id) {
        let is_variant_icon = this.isVariantInOrder(product_id, variant_id, designer_id);
        if (is_variant_icon == "assets/images/selected-icon.png") {
            let abort = false;
            for (let i = 0, len = this.values.cart.request.order[0].sales_order_parts.length; i < len && !abort; i++) {
                if (this.values.cart.request.order[0].sales_order_parts[i].seller_account_id == designer_id) {
                    abort = true;
                    let qty_abort = false;
                    for (let j = 0, len = this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines.length; j < len && !qty_abort; j++) {
                        let line = this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j];
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
                                        this.cartProvider.clearItem(i, product_id, 0, variant_id);
                                        if (this.selected_varants_count > 0) this.selected_varants_count --;
                                        this.values.cart.request.order[0].total_line_items --;
                                        this.values.cart.request.order[0].sales_order_parts[i].total_line_items --;
                                    }
                                }
                            ]
                        });
                        await alert.present();
                    }
                    else {
                        this.cartProvider.clearItem(i, product_id, 0, variant_id);
                        if (this.selected_varants_count > 0) this.selected_varants_count --;
                    }
                }
            }
        }
        else {

            if (this.values.user_profile.seller_account_id != 0) { 
                let alert = await this.alertCtrl.create({
                    header: 'Are you trying to add this style to your selection?',
                    subHeader: 'To create a selection begin by selecting a buyer',
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
                                this.router.navigate(['/settings']);
                            }
                        }
                    ]
                });
                await alert.present();
                return false; 
            }
            //find the product
            let abort = false;
            for (let pindex = 0, len = this.values.products.length; pindex < len && !abort; pindex++) {
                if (this.values.products[pindex].product_id == product_id) {
                    abort = true;
                    //add all the variants to cart
                    this.values.products[pindex].variants.forEach((variant) => {
                        if (variant.variant_id == variant_id) {
                            let is_variant = this.isVariantInOrder(product_id, variant.variant_id, designer_id);
                            if (is_variant != "assets/images/selected-icon.png") {
                                this.cartProvider.addToCart(product_title + ' : ' + variant.title, variant.colour,
                                    material, variant.swatch.swatch_image, variant.variant_images[0].variant_image,
                                    designer_title, designer_id, product_id, variant.variant_id, variant.sizes[0].size_title,
                                    variant.sizes[0].variant_size_id, type, 0, price, price_rrp, variant.sizes[0].sku);
                                this.selected_varants_count ++;
                            }
                        }
                    });
                }
            }
        }
    }

    isProductInOrder(product_id, designer_id) {
        let abort = false;
        for (let part = 0, len = this.values.cart.request.order[0].sales_order_parts.length; part < len && !abort; part++) {
            if (this.values.cart.request.order[0].sales_order_parts[part].seller_account_id == designer_id) {
                //check line items
                for (let line = 0, len = this.values.cart.request.order[0].sales_order_parts[part].sales_order_lines.length;
                    line < len && !abort; line++) {
                    if (this.values.cart.request.order[0].sales_order_parts[part].sales_order_lines[line].product_id == product_id) {
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

    changeCollection(collection_id, designer_id, index) {
        this.data.presentLoadingSpinerSec().then(() => {
            this.values.onescreen_total_imgages_num = 1;
            this.values.onescreen_image_index = 0;
            // if (this.values.products.length < 9) {
            //     this.values.onescreen_total_imgages_num = this.values.products.length * 2;
            // }
            // else {
            //     this.values.onescreen_total_imgages_num = 18;
            // }
            // this.values.onescreen_image_index = 0;

            if (!this.values.online) {
                if (this.values.collections[index].offline != 'Downloaded') {
                    this.data.offlineManager();
                    return false;
                }
            }

            this.items = [];
            this.searchValue = '';
            this.data.currentCollectionID = collection_id;
            //  get selected collection profile
            this.data.selectedCollection = this.data.filterCollections(this.data.currentCollectionID)[0];
            if (this.data.designer) {
                this.data.designer.currentCollectionID = collection_id;
            }
            //  get product items in the collection
            this.data.getProduct(collection_id, this.values.device_token, this.values.user_profile.user_token, 0, 0).then((data) => {
                this.firstItem = 0;
                this.addItemsToGrid('', 0);
                this.data.activityLogPost(Constants.LOG_VIEWED_COLLECTION, this.values.designer.seller_account_id, collection_id, '', '');
            });
        });
    }

    popupOverlay(product_id) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].product_id == product_id) {
                this.items[i].is_overlay = true;
                this.popover_index = i;

                this.selected_varants_count = 0;
                this.items[i].variants.forEach((variant) => {
                    let is_variant = this.isVariantInOrder(product_id, variant.variant_id, this.items[i].seller_account_id);
                    if (is_variant == "assets/images/selected-icon.png") {
                        this.selected_varants_count ++;
                    }
                });
            }
            else {
                this.items[i].is_overlay = false;
            }
        }
    }

    closeOverlay(i) {
        this.items[i].is_overlay = false;
        this.selected_varants_count = 0;
    }

    downloadAllManager() {
        this.data.d_collection_index = 0;
        this.data.d_collections_all = true;
        this.downloadManager(this.values.collections[0].collection_id, this.values.designer.seller_account_id, this.values.designer.title, this.values.collections[0].collection_title, 1);

        this.events.subscribe("collection-download", () => {
            this.events.publish("set-collection-state", this.values.collections[this.data.d_collection_index].collection_id);
            this.data.d_collection_index ++;
            if (this.data.d_collection_index >= this.values.collections.length) {
                this.data.d_collections_all = false;
                this.data.d_collection_index = 0;
                this.events.unsubscribe("collection-download");
            }
            else {
                this.downloadManager(this.values.collections[this.data.d_collection_index].collection_id, this.values.designer.seller_account_id, this.values.designer.title, this.values.collections[this.data.d_collection_index].collection_title, 1);
            }
        });
    }

    async downloadManager(collection_id, designer_id, designer, collection_title, mode) {
        this.values.cancel = false;
        if (!this.values.online) {
            this.data.offlineManager();
            return false;
        };
        if (mode != 3) {
            if (this.values.user_profile.forcecache) {
                mode = 2;
            }
            else {
                mode = 1;
            }
        }
        if (this.data.d_collections_all == false) {
            this.popover = await this.popoverController.create({
                component: ViewloaderComponent,
                componentProps: {
                    collection_id: collection_id,
                    designer_id: designer_id,
                    mode: mode,
                    source: 'collection'
                },
            });
            await this.popover.present();
            this.popover.onDidDismiss(() => {
                this.popover = null;
            })
        }
        else {
            if (this.popover == null) {
                this.popover = await this.popoverController.create({
                    component: ViewloaderComponent,
                    componentProps: {
                        collection_id: 0,
                        designer_id: designer_id,
                        mode: mode,
                        source: 'collection'
                    },
                });

                await this.popover.present();
                this.popover.onDidDismiss(() => {
                    this.popover = null;
                })
            }
        }

        this.insomnia.keepAwake().then(
            () => console.log("keepAwake success !"),
            () => console.log("keepAwake error !")
        );

        this.data.cacheCollection(collection_id, designer_id, designer, collection_title, mode).then(() => {
            //this.data.selectedCollection.offline = "Downloaded";
            console.log("download have finished!");
        });
    }

    productItem(product) {
        this.data.presentLoadingSpinerSec().then(() => {
            this.values.onescreen_total_imgages_num = product.variants.length * 2;
            this.values.onescreen_image_index = 0;
            this.router.navigate(['/item', { product: product, collection: this.data.selectedCollection }]);
        });
    }

    lineSheet() {
        this.data.presentLoadingSpinerSec().then(() => {
            if (this.values.products.length < 12) {
                this.values.onescreen_total_imgages_num = this.values.products.length * 2;
            }
            else {
                this.values.onescreen_total_imgages_num = 24;
            }
            this.values.onescreen_image_index = 0;
            this.router.navigate(['/linesheet', { collection: this.data.selectedCollection }]);
        });
    }

    scrollToTop() {
        this.scrollContent.scrollToTop();
    }

    popView() {
        this.values.isDesignersPage = true;
        this.router.navigate(['/designers']);
    }

    getTimeStamp() {
        let date_str = this.data.selectedCollection.download_date;
        let date = new Date(date_str);
        let m = date.getMonth() + 1;
        let mm = m.toString();
        if (m < 10) mm = "0" + mm;
        let dd = date.getDate();
        let yy = date.getFullYear();
        let time = date.toLocaleTimeString();
        let time_str = date.toTimeString();
        let offset = date.getTimezoneOffset();
        let time_zone = time_str.substr(19, 3);
        if (offset == -60) {
            time_zone = "BST";
        }
        let time_stamp = dd + "." + mm + "." + yy + " " + time + " " + time_zone;
        return time_stamp;
    }
}
