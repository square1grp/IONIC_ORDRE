import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { NavController, AlertController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Values } from '../../values.service';
import { Data } from '../../data.service';
import { CartProvider } from '../../cart.service';
import { ViewloaderComponent } from '../viewloader/viewloader.component';
import * as Constants from '../../constants';

@Component({
    selector: 'page-linesheet',
    templateUrl: './linesheet.component.html',
    styleUrls: ['./linesheet.component.scss'],
})
export class LinesheetComponent implements OnInit {

    items = [];
    maxItems: any;
    firstItem: any;
    lastItem: any;
    page: number;
    pageItems: number;
    pages: number;
    lastPageItems: number;
    pageArray = [];

    // pagination variables
    currentGroupIndex: number;
    pageLength: number;
    pageArrayLength: number;
    currentPageArray = [];
    pageGroupArray = [];
    totalGroupCount: number;
    prevVisibility: string = "hidden";
    nextVisibility: string = "hidden";

    collection: any;
    products: any;
    designer: any;
    @ViewChild('content') content: any;
    @ViewChild('toggle_totals_input') totalMenu: ElementRef;

    itemsCnt: number;
    searchValue: string;
    vArray: any;
    qty: any = 0;
    addFlag: boolean = false;
    searchTerm$ = new Subject<string>();

    constructor(
        private zone: NgZone,
        private cd: ChangeDetectorRef,
        private popoverCtrl: PopoverController,
        public navCtrl: NavController,
        private router: Router,
        public data: Data,
        public cartProvider: CartProvider,
        public values: Values,
        private el: ElementRef,
        private alertCtrl: AlertController) {

    }

    ngOnInit() {
        this.values.view_mode = 'linesheet view';
        this.searchValue = '';
        this.collection = this.values.collection;

        // find the order part (for sub-totals)
        this.cartProvider.order_part_item_id = null;
        let abort = false;
        for (let pindex = 0, len = this.values.cart.request.order[0].sales_order_parts.length; pindex < len && !abort; pindex++) {
            if (this.values.cart.request.order[0].sales_order_parts[pindex].seller_account_id == this.values.designer.seller_account_id) {
                this.cartProvider.order_part_item_id = pindex;
                abort = true;
            }
        };
        this.buildArray('', 0);
        this.addItemsToGrid();
        this.search();

        // Pagination code part
        this.pageArrayLength = this.pageArray.length;
        this.pageLength = 7;
        this.currentGroupIndex = 0;

        let remainGroup = this.pageArrayLength % this.pageLength;
        let totalGroupCount = Math.floor(this.pageArrayLength / this.pageLength);
        let groupIndex = 0;
        let tempGroup = [];
        let pageLength = this.pageLength;

        if ((totalGroupCount == 0) || (totalGroupCount == 1 && remainGroup == 0)) {
            if (remainGroup != 0) pageLength = remainGroup;
            this.prevVisibility = "hidden";
            this.nextVisibility = "hidden";
        }
        else {
            this.prevVisibility = "hidden";
            this.nextVisibility = "visible";
        }

        for (let index = 0; index < this.pageArrayLength; index++) {
            tempGroup.push(this.pageArray[index]);
            if ((index + 1) % pageLength == 0) {
                this.pageGroupArray.push(tempGroup);
                groupIndex++;
                this.totalGroupCount = groupIndex;
                if (groupIndex == totalGroupCount) pageLength = remainGroup;
                tempGroup = [];
            }
        }
    }

    prevPage() {
        if (this.currentGroupIndex <= 0) {
            this.currentGroupIndex = 0;
        }
        else {
            this.currentGroupIndex--;
        }
        if (this.currentGroupIndex == 0) this.prevVisibility = "hidden";
        this.nextVisibility = "visible";
    }

    nextPage() {
        if (this.currentGroupIndex >= this.totalGroupCount - 1) {
            this.currentGroupIndex = this.totalGroupCount - 1;
        }
        else {
            this.currentGroupIndex++;
        }

        if ((this.currentGroupIndex == this.totalGroupCount - 1) || (this.currentGroupIndex == this.totalGroupCount && this.pageArrayLength % this.pageLength == 0)) this.nextVisibility = "hidden";
        this.prevVisibility = "visible";
    }

    ionViewDidEnter() {
        this.setItemQty();
    }

    ionViewDidLeave() {
    }

    buildArray(search, mode) {
        this.vArray = [];
        this.values.products.forEach((thisProduct, pindex) => {
            thisProduct.variants.forEach((thisVariant, vindex) => {
                if (search.length > 0) {
                    if (thisVariant.vsearch.toLowerCase().indexOf(search.toLowerCase()) >= 0 && mode == 0) {
                        this.vArray.push({ 'variant': thisVariant, 'product': thisProduct });
                    }
                }
                else {
                    this.vArray.push({ 'variant': thisVariant, 'product': thisProduct });
                }
            });
        })
        this.firstItem = 0;
        this.page = 0;
        this.pageItems = 35;
        if (this.vArray.length == 0) {
            this.pageItems = 0;
            this.itemsCnt = 0;
            this.pages = 0;
            this.lastPageItems = 0;
        }
        else {
            this.itemsCnt = this.vArray.length;
            this.pages = Math.floor(this.itemsCnt / this.pageItems);

            var oddItems = this.itemsCnt % this.pageItems;
            if (oddItems > 0) {
                this.pages = this.pages + 1;
                this.lastPageItems = oddItems;
            }
            else {
                this.lastPageItems = this.pageItems;
            }
        }
        if (this.pages > 0) this.pages = this.pages - 1;
        this.pageArray = [];
        for (var i = 0; i < this.pages + 1; i++) {
            var pageItems = this.pageItems;
            if (i == this.pages) pageItems = this.lastPageItems;
            this.pageArray.push({ 'page': i + 1, 'items': pageItems, 'id': i });
        }
    }

    changePage(page) {
        this.page = page - 1;
        this.addItemsToGrid();
        this.scrollToTop();
    }

    addItemsToGrid() {
        this.items = [];
        this.maxItems = this.pageArray[this.page].items;
        this.firstItem = (this.page) * this.pageItems;
        this.lastItem = this.firstItem + this.maxItems;

        let abort = false;
        for (var i = this.firstItem; i < this.lastItem && abort == false; i++) {
            this.items.push(this.vArray[i]);
        } 
    }

    doInfinite(infiniteScroll) {
        this.addItemsToGrid();
        infiniteScroll.complete();
    }

    search() {
        this.searchTerm$.debounceTime(1000)
        .distinctUntilChanged().subscribe(searchString => {
        let mode = 0;
        this.searchValue = searchString;
        if (searchString.length == 0) mode = 1;
        this.buildArray(searchString, mode);
        this.addItemsToGrid();
        });
    }

    toggleTottle() {
        this.el.nativeElement.click();
    }

    async addToCart(product_title, colour, material, swatch, image, designer_title, variant_id, sku, price, price_rrp, event, designer_id
        , size, size_id, type, product_id, itemItem) {

        let icon_path = this.isProductInOrder(product_id, variant_id, designer_id);
        if (event == null && icon_path == "assets/images/selected-icon.png") {
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
                                        this.values.cart.request.order[0].total_line_items --;
                                        this.values.cart.request.order[0].sales_order_parts[i].total_line_items --;
                                        this.setItemQty();
                                        this.qty = 0;
                                    }
                                }
                            ]
                        });
                        await alert.present();
                    }
                    else {
                        this.cartProvider.clearItem(i, product_id, 0, variant_id);
                    }
                }
            }
        }
        else {
            this.zone.run(() => {
                if (this.values.user_profile.seller_account_id != 0) { return false; }
                if (event == null) {
                    this.qty = 0;
                    this.addFlag = true;
                } else {
                    this.qty = event.target.value;
                    if (this.qty == "") this.qty = 0;
                }
                this.cartProvider.addToCart(product_title, colour, material, swatch, image, designer_title, designer_id, product_id
                    , variant_id, size, size_id, type, this.qty, price, price_rrp, sku);
                this.setItemQty();
                this.cd.markForCheck();
                this.qty = 0;

                this.data.activityLogPost(Constants.LOG_ADD_TO_RANGINGROOM, designer_id, this.collection.collection_id, product_id, variant_id);
            });
        }
    }

    addProductVariantToCart(product_title, colour, material, swatch, image, designer_title, variant_id, sku, price, price_rrp, event
        , designer_id, size, size_id, type, product_id, itemItem) {
        this.zone.run(() => {
            if (this.values.user_profile.seller_account_id != 0) return false;
            let qty = event.target.value;
            this.cartProvider.addToCart(product_title, colour, material, swatch, image, designer_title, designer_id, product_id, variant_id, size, size_id, type, qty, price, price_rrp, sku);
            this.setItemQty();
            this.cd.markForCheck();
        });
    }

    clearItem(variant_id, keepit) {
        this.cartProvider.clearSomeItem(variant_id, keepit);
        this.setItemQty();
    }

    isProductInOrder(product_id, variant_id, designer_id) {
        let abort = false;
        for (let part = 0, len = this.values.cart.request.order[0].sales_order_parts.length; part < len && !abort; part++) {
            if (this.values.cart.request.order[0].sales_order_parts[part].seller_account_id == designer_id) {
                //check line items
                for (let line = 0, len = this.values.cart.request.order[0].sales_order_parts[part].sales_order_lines.length; line < len
                    && !abort; line++) {
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

    setItemQty() {
        //  set QTY field for product variant size from cart
        this.values.products.forEach((product, pindex) => {
            this.values.products[pindex].variants.forEach((variant, vindex) => {
                this.values.products[pindex].variants[vindex].total = 0
                this.values.products[pindex].variants[vindex].total_rrp = 0
                variant.sizes.forEach((size, sindex) => {
                    var orderQTY = this.cartProvider.getSizeQty(this.values.products[pindex].variants[vindex].sizes[sindex].sku, this.values.designer.seller_account_id)

                    if (this.values.user_profile.user_region_id > 13) {
                        this.values.products[pindex].variants[vindex].total = 0;
                        this.values.products[pindex].variants[vindex].total_rrp = 0;
                    }
                    else {
                        this.values.products[pindex].variants[vindex].total = this.values.products[pindex].variants[vindex].total + (orderQTY * this.values.products[pindex].region_prices[this.values.user_profile.user_region_id<4 ? this.values.user_profile.user_region_id - 1 : this.values.user_profile.user_region_id - 2].wsp);

                        this.values.products[pindex].variants[vindex].total_rrp = this.values.products[pindex].variants[vindex].total_rrp + (orderQTY * this.values.products[pindex].region_prices[this.values.user_profile.user_region_id<4 ? this.values.user_profile.user_region_id - 1 : this.values.user_profile.user_region_id - 2].rrp);
                    }

                    if (orderQTY == 0) {
                        this.values.products[pindex].variants[vindex].sizes[sindex].qty = '';
                    }
                    else {
                        this.values.products[pindex].variants[vindex].sizes[sindex].qty = orderQTY;
                    }
                });
            });
        });
    }

    async downloadManager(collection_id, designer_id, designer, collection_title, mode) {
        if (!this.values.online) {
            this.data.offlineManager();
            return false;
        }
        if (mode != 3) {
            if (this.values.user_profile.forcecache) {
                mode = 2;
            }
            else {
                mode = 1;
            }
        }
        let popover = await this.popoverCtrl.create({
            component: ViewloaderComponent,
            componentProps: {
                collection_id: collection_id,
                designer_id: designer_id,
                mode: mode
            },
        });
        await popover.present();
        this.data.cacheCollection(collection_id, designer_id, designer, collection_title, mode).then(() => { });
    }

    gridView() {
        this.router.navigate(['/collection', { mode: 'fromlinesheet' }]);
    }

    productItem(product) {
        this.data.presentLoadingSpinerSec().then(() => {
            this.values.onescreen_total_imgages_num = product.variants.length * 2;
            this.values.onescreen_image_index = 0;
            this.values.product = product;
            this.values.collection = this.data.selectedCollection;
            this.router.navigate(['/item', { mode: 'fromlinesheet' }]);
        });
    }

    openPage(page): void {
        this.router.navigate(['/' + page]);
    }

    scrollToTop() {
        this.content.scrollToTop();
    }

    popView() {
        this.items = [];
        this.vArray = [];
        this.values.view_mode = "grid view";
        this.navCtrl.pop();
    }
}
