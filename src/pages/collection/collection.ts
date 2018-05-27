import { Component, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { Nav, NavController, NavParams, Content, AlertController, PopoverController } from 'ionic-angular';
import { Insomnia } from '@ionic-native/insomnia'
import { FormControl } from '@angular/forms';
import { ItemPage } from '../item/item';
import { LinesheetPage } from '../linesheet/linesheet';
import { SettingsPage } from '../settings/settings';
import { Data } from '../../providers/data';
import { Values } from '../../providers/values';
import { CartProvider } from '../../providers/cart';
import { ViewloaderPage } from '../viewloader/viewloader'
import * as Constants from '../../providers/constants'

@Component({
    selector: 'page-collection',
    templateUrl: 'collection.html'//,
    //changeDetection: ChangeDetectionStrategy.OnPush
})

export class CollectionPage {

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
        private popoverCtrl: PopoverController, private insomnia: Insomnia) {
        this.searchControl = new FormControl();
        
        // set designer special price_list if this designer have its own special price.
        if (this.values.isDesignerLogin) {
            console.log("price_list");
            this.values.designer_pricelist.region_id = null;
            this.values.designer_pricelist.region_index = null;
            for (var i = 0; i < this.values.associationByDesigner.length; i++) {
                console.log("price_list2");
                let abort = false;
                for (var j = 0; j < this.values.associationByDesigner[i].retailers.length && abort == false; j++) {
                    console.log("price_list3");
                    if (this.values.user_profile.retailer_id == this.values.associationByDesigner[i].retailers[j]) {
                        console.log("price_list4");
                        this.values.designer_pricelist.region_id = this.values.associationByDesigner[i].region_id;
                        abort = true;
                        for (var k = 0; k < this.values.designer.region_currency.length; k++) {
                            console.log("price_list5");
                            if (this.values.designer.region_currency[k].region_id == this.values.designer_pricelist.region_id) {
                                this.values.designer_pricelist.region_index = k;
                                console.log("price_list have just set!");
                                console.log(this.values.designer_pricelist);
                            }
                        }
                    }
                }
            }
            this.data.getDesignerCurrency(this.values.user_profile.user_region_id, 0);
        }
    }

    ngOnInit() {
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
                console.log('Online:' + this.values.online);

                this.values.products = null;
                this.data.getProduct(this.data.currentCollectionID, this.values.device_token, this.values.user_profile.user_token, 0, 0).then(data => {
                    if (this.values.products.length < 9) {
                        this.values.onescreen_total_imgages_num = this.values.products.length * 2;
                    }
                    else {
                        this.values.onescreen_total_imgages_num = 18;
                    }
                    this.data.consoleLog('this.values.products' , this.values.products);
                    

                    this.mode = this.navParams.get("mode");
                    if (this.mode != 'fromlinesheet') {
                        this.firstItem = 0;
                        this.addItemsToGrid('', 0);
                    }
            
                    if (this.mode == 'fromlinesheet') {
                        this.values.lsproducts = this.values.products;
                    }
                    this.search();
                    this.data.consoleLog("this.values.products", this.values.products);
                    this.values.longTimeRequestUrls = [];
                    this.values.productCashImageUrls = [];
                    this.data.consoleLog("this.data.selectedCollection", this.data.selectedCollection);

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

            this.mode = this.navParams.get("mode");
            if (this.mode != 'fromlinesheet') {
                this.firstItem = 0;
                this.addItemsToGrid('', 0);
            }
    
            if (this.mode == 'fromlinesheet') {
                this.values.lsproducts = this.values.products;
            }
            this.search();
            this.data.consoleLog("this.values.products", this.values.products);
            this.values.longTimeRequestUrls = [];
            this.values.productCashImageUrls = [];
            this.data.consoleLog("this.data.selectedCollection", this.data.selectedCollection);
        }
    }

    ionViewDidLoad() {
        this.data.activityLogPost(Constants.LOG_VIEWED_COLLECTION, this.values.designer.seller_account_id, this.data.designer.currentCollectionID, '', '');
        this.data.consoleLog("user_profile", this.values.user_profile);
        this.data.consoleLog("designer", this.values.designer);
        this.data.consoleLog("first_product", this.items[0]);
        
    }
    search() {
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

    addProductToCart(product_title, material, designer_title, price, price_rrp, designer_id, type, product_id) {

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
            return false; 
        }
        //find the product
        let abort = false;
        for (let pindex = 0, len = this.values.products.length; pindex < len && !abort; pindex++) {
            if (this.values.products[pindex].product_id == product_id) {
                abort = true;
                //add all the variants to cart
                this.data.consoleLog("this.values.products[pindex]", this.values.products[pindex]);
                this.values.products[pindex].variants.forEach((variant) => {
                    let is_variant = this.isVariantInOrder(product_id, variant.variant_id, designer_id);
                    if (!is_variant) {
                        this.cartProvider.addToCart(product_title + ' : ' + variant.title, variant.colour,
                            material, variant.swatch.swatch_image, variant.variant_images[0].variant_image,
                            designer_title, designer_id, product_id, variant.variant_id, variant.sizes[0].size_title,
                            variant.sizes[0].variant_size_id, type, 0, price, price_rrp, variant.sizes[0].sku);
                    }
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
        return abort;
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

        this.insomnia.keepAwake().then(
            () => console.log("keepAwake success !"),
            () => console.log("keepAwake error !")
        );

        this.data.cacheCollection(collection_id, designer_id, designer, collection_title, mode).then(() => {
            //this.data.selectedCollection.offline = "Downloaded";
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
