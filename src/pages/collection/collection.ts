import { Component, ViewChild, NgZone, ChangeDetectorRef  } from '@angular/core';
import { Nav, NavController, NavParams, Content, AlertController, PopoverController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { ItemPage } from '../item/item';
import { LinesheetPage } from '../linesheet/linesheet';
import { Data } from '../../providers/data';
import { Values } from '../../providers/values';
import { CartProvider } from '../../providers/cart';
import { ViewloaderPage } from '../viewloader/viewloader'

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
    myjson:any = JSON;

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

    constructor(private cd: ChangeDetectorRef, public popoverController:PopoverController, private zone : NgZone, public navCtrl: NavController, 
      public navParams: NavParams, public data: Data, public cartProvider: CartProvider, public values: Values, private alertCtrl:AlertController, 
      private popoverCtrl:PopoverController ) {
        //will need this to get related collection
        //this.designer = params.get('item');
        this.searchControl = new FormControl();
    }

    ngOnInit() {
        //load with no model (faster)
        //this.values.lsproducts = null;    
        this.values.search = '';
        this.searchValue = '';
        this.mode = this.navParams.get("mode");

        //console.log('Designer:'+JSON.stringify(this.values.designer));
        //this.designer.content = this.designer.content.split(/<p>|<\/p>|¤/);
        //this.data.consolelog(this.data.designer);
        //this.data.consolelog('ionViewDidLoad CollectionPage');
        /*
        if (typeof this.mode == 'undefined') {
          this.values.lsproducts = this.values.products;
        };
        */
        console.log('Mode:' + this.mode);
        if( this.mode != 'fromlinesheet') { 
            //this.data.getDesignerCurrency(this.values.user_profile.user_region_id,0);
            //this.data.getThisCollections(this.values.designer.seller_account_id,this.values.device_token,
            //  this.values.user_profile.user_token).then((data) => {
            //  mode
            //  0 = no cache
            //  1 = just try and cache
            //  2 = delete then cache
            //  3 = just delete     
            this.firstItem = 0;
            this.addItemsToGrid('',0);
            //});  
        }

        if (this.mode == 'fromlinesheet') { 
            this.values.lsproducts = this.values.products;     
        }   
        this.search(); 
        console.log("======= products start =======");
        console.log(this.values.products);
        console.log("======= products end =======");      
    }

    search(){
        console.log('Search enabled');
        this.searchControl.valueChanges.debounceTime(1000).distinctUntilChanged().subscribe(searchString => {
          //if(searchString != '' && searchString){
            console.log('Search for:' + searchString);
            let mode = 0;
            this.searchValue = searchString;
            if (searchString.length == 0) { mode = 1; }
            this.addItemsToGrid(searchString,mode);
            this.data.dismissLoadingSpiner();
          //}
        });
    }

    addItemsToGrid(search, mode) {
        this.maxItems = this.values.products.length;
        if (((search.length > 0) && (mode != 2)) || (mode == 1)) {
            this.firstItem = 0;
            this.lastItem = 0;
            //if (this.maxItems>18){this.maxItems=18};
            this.items = [];
        }
        if (this.firstItem > this.maxItems) {
            return false;  
        }
        if ((this.firstItem + 18) > this.maxItems) {
            this.lastItem = this.maxItems;
        }
        else
        {
            this.lastItem = this.firstItem + 18;
        }
        console.log(this.firstItem);
        console.log(this.lastItem - 1);
        console.log(this.maxItems);
        
        let abort = false;
        for (var i = this.firstItem; i < this.lastItem && abort == false; i++) {
            if (search.length > 0) {
                console.log('Search:'+this.values.products[i].search_me + ' - ' + this.values.products[i].product_title);
                if (this.values.products[i].search_me.toLowerCase().indexOf(search.toLowerCase()) >= 0) {
                    this.items.push(this.values.products[i]);  
                }
                else
                {         
                    if (this.lastItem < this.maxItems) { this.lastItem = this.lastItem + 1; } 
                }
            }
            else
            {
                this.items.push(this.values.products[i]);
            }
        }
        this.firstItem = this.lastItem;
        console.log('Render view changes');
        //this.cd.markForCheck();  
    }



    doInfinite(infiniteScroll) {
        console.log('Begin async operation');

        //setTimeout(() => {
        this.addItemsToGrid(this.searchValue, 2);
        //for (let i = 18; i < 36; i++) {
        //  this.items.push( this.values.lsproducts[i] );
        //}
        //this.cd.markForCheck();
        console.log('Async operation has ended');
        infiniteScroll.complete();
        //}, 500);
    }

    addProductToCart(product_title, material, designer_title, price, designer_id, type, product_id) {

        if (this.values.user_profile.seller_account_id != 0) { return false; }
        //let qty = 0;
        //find the product
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
          }
        }
        //this.setItemQty();
    }

    isProductInOrder (product_id, designer_id) {
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
            return("assets/images/selected-icon.png");
        }
        else
        {  
            return("assets/images/select-icon.png");
        }
    }

    changeCollection(collection_id, designer_id, index) {
        //console.log(JSON.stringify(this.values.collections));
        console.log('Change Collection:' + collection_id);
        if (!this.values.online) {
            if (this.values.collections[index].offline != 'Downloaded') {
                this.data.offlineManager();
                return false;
            }
        } 
        this.data.presentLoadingSpiner();
        setTimeout(() => {
            if (this.data.isloadingState == true) {
                this.data.dismissLoadingSpiner();
            }
        }, 2000);
        this.items = [];
        //this.cd.markForCheck();
        this.searchValue = '';
        this.data.currentCollectionID = collection_id;
        //  get selected collection profile
        this.data.selectedCollection = this.data.filterCollections(this.data.currentCollectionID)[0];
        //  get product items in the collection
        // //this.data.consolelog('1. Getting products for collection ID:'+collection_id)
        //this.downloadCollection(collection_id,designer_id)          
        this.data.getProduct(collection_id, this.values.device_token, this.values.user_profile.user_token, 0, 0).then((data) => {
            this.data.consolelog('Got collection products:' + collection_id);
            //this.values.products = data;
            this.data.consoleLog("this.values.products", this.values.products);
            this.data.consolelog('Set Products Obj');
            //this.values.lsproducts = this.values.products; 
            this.firstItem = 0;
            this.addItemsToGrid('', 0);
            setTimeout(() => {
                this.data.dismissLoadingSpiner();
            }, 500);
        });  
    }

    downloadManager(collection_id, designer_id, designer, collection_title, mode) {
        this.values.cancel = false;
        this.data.presentLoadingSpiner();
        setTimeout(() => {
            if (this.data.isloadingState == true) {
                this.data.dismissLoadingSpiner();
            }
        }, 2000);
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
          { collection_id:collection_id, designer_id:designer_id, mode:mode, source:'collection' });
        popover.present();
        // setTimeout(() => {
        //     this.data.dismissLoadingSpiner();
        // }, 5000);
        this.data.cacheCollection(collection_id, designer_id, designer, collection_title, mode).then(() => {
            setTimeout(() => {
                this.data.dismissLoadingSpiner();
            }, 500);
            //this.cd.markForCheck(); 
        });   
    }
    
    productItem(product) {
        this.data.presentLoadingSpiner();
        setTimeout(() => {
            if (this.data.isloadingState == true) {
                this.data.dismissLoadingSpiner();
            }
        }, 2000);
        this.navCtrl.push(ItemPage, { product:product, collection:this.data.selectedCollection });
    }

    lineSheet() {
        this.data.presentLoadingSpiner();
        setTimeout(() => {
            if (this.data.isloadingState == true) {
                this.data.dismissLoadingSpiner();
            }
        }, 2000);
        this.navCtrl.push(LinesheetPage, { collection: this.data.selectedCollection });//}
    }

    scrollToTop() {
        //let scrollContent: Content = document.getElementById("collectionScroll");
        this.scrollContent.scrollToTop();
    }

    popView() {
        this.navCtrl.pop();
    }


}
