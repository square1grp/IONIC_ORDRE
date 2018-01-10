import { Component, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { Nav, NavController, NavParams, Content, AlertController, PopoverController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { ItemPage } from '../item/item';
import { LinesheetPage } from '../linesheet/linesheet';
import { Data } from '../../providers/data';
import { Values } from '../../providers/values';
import { CartProvider } from '../../providers/cart';
import { ViewloaderPage } from '../viewloader/viewloader'
import * as Constants from '../../providers/constants'

@Component({
    selector: 'page-collection',
    templateUrl: 'collection.html'
})

export class CollectionPage {

    navOpen: boolean = true;
    mode: any;
    myjson: any = JSON;

    @ViewChild(Nav) nav: Nav;
    @ViewChild(Content) content: Content;
    @ViewChild("collectionScroll") scrollContent: Content;

    items = [];
    maxItems: any;
    firstItem: any;
    lastItem: any;
    itemPage = ItemPage;
    linesheetPage = LinesheetPage;
    viewloaderPage = ViewloaderPage;
    searchControl: FormControl;
    searchValue: string;

    constructor(private cd: ChangeDetectorRef, public popoverController: PopoverController, private zone: NgZone, public navCtrl: NavController,
        public navParams: NavParams, public data: Data, public cartProvider: CartProvider, public values: Values, private alertCtrl: AlertController,
        private popoverCtrl: PopoverController) {
        this.searchControl = new FormControl();
    }

    ngOnInit() {   
        this.values.search = '';
        this.searchValue = '';
        this.mode = this.navParams.get("mode");
        console.log('Mode:' + this.mode);
        if (this.mode != 'fromlinesheet') {
            this.firstItem = 0;
            this.addItemsToGrid('', 0);
        }

        if (this.mode == 'fromlinesheet') {
            this.values.lsproducts = this.values.products;
        }
        this.search();
        this.data.consoleLog("this.values.products", this.values.products);
    }

    ionViewDidLoad() {
        this.data.activityLogPost(Constants.LOG_VIEWED_COLLECTION, this.values.designer.seller_account_id, this.data.designer.currentCollectionID, '', '');
    }
    search() {
        console.log('Search enabled');
        this.searchControl.valueChanges.debounceTime(1000).distinctUntilChanged().subscribe(searchString => {
            console.log('Search for:' + searchString);
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
                console.log('Search:' + this.values.products[i].search_me + ' - ' + this.values.products[i].product_title);
                if (this.values.products[i].search_me.toLowerCase().indexOf(search.toLowerCase()) >= 0) {
                    this.items.push(this.values.products[i]);
                }
                else {
                    if (this.lastItem < this.maxItems) { this.lastItem = this.lastItem + 1; }
                }
            }
            else {
                this.items.push(this.values.products[i]);
            }
        }
        this.firstItem = this.lastItem;
    }



    doInfinite(infiniteScroll) {
        this.addItemsToGrid(this.searchValue, 2);
        infiniteScroll.complete();
    }

    addProductToCart(product_title, material, designer_title, price, designer_id, type, product_id) {

        if (this.values.user_profile.seller_account_id != 0) return false;
        let abort = false;
        for (let pindex = 0, len = this.values.products.length; pindex < len && !abort; pindex++) {
            if (this.values.products[pindex].product_id == product_id) {
                abort = true;
                //add all the variants to cart
                this.data.consoleLog("this.values.products[pindex]", this.values.products[pindex]);
                this.values.products[pindex].variants.forEach((variant) => {
                    this.cartProvider.addToCart(product_title + ' : ' + variant.title, variant.colour,
                        material, variant.swatch.swatch_image, variant.variant_images[0].variant_image,
                        designer_title, designer_id, product_id, variant.variant_id, variant.sizes[0].size_title,
                        variant.sizes[0].variant_size_id, type, 0, price, variant.sizes[0].sku);
                });
                this.data.activityLogPost(Constants.LOG_ADD_TO_RANGINGROOM, designer_id, this.data.selectedCollection.collection_id, product_id, 'all');
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

    changeCollection(collection_id, designer_id, index) {
        this.data.presentLoadingSpinerSec().then(() => {
            if (this.values.products.length < 9) {
                this.values.onescreen_total_imgages_num = this.values.products.length * 2;
            }
            else {
                this.values.onescreen_total_imgages_num = 18;
            }
            this.values.onescreen_image_index = 0;
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
            //  get product items in the collection
            this.data.getProduct(collection_id, this.values.device_token, this.values.user_profile.user_token, 0, 0).then((data) => {
                this.firstItem = 0;
                this.addItemsToGrid('', 0);
                this.data.activityLogPost(Constants.LOG_VIEWED_COLLECTION, this.values.designer.seller_account_id, collection_id, '', '');
            });
        });
    }

    downloadManager(collection_id, designer_id, designer, collection_title, mode) {
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
        let popover = this.popoverController.create(this.viewloaderPage,
            { collection_id: collection_id, designer_id: designer_id, mode: mode, source: 'collection' });
        popover.present();
        this.data.cacheCollection(collection_id, designer_id, designer, collection_title, mode).then(() => {
            // setTimeout(() => {
            //     this.data.dismissLoadingSpiner();
            // }, 500);
            //this.cd.markForCheck(); 
        });
    }

    productItem(product) {
        this.data.presentLoadingSpinerSec().then(() => {
            this.values.onescreen_total_imgages_num = product.variants.length * 2;
            this.values.onescreen_image_index = 0;
            this.navCtrl.push(ItemPage, { product: product, collection: this.data.selectedCollection });
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
            console.log("onescreen_total_imgages_num : " + this.values.onescreen_total_imgages_num);
            console.log("onescreen_image_index : " + this.values.onescreen_image_index);
            this.navCtrl.push(LinesheetPage, { collection: this.data.selectedCollection });
        });
    }

    scrollToTop() {
        this.scrollContent.scrollToTop();
    }

    popView() {
        this.values.isDesignersPage = true;
        this.navCtrl.pop();
    }
}