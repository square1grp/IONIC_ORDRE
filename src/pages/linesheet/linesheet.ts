import { Component, ViewChild, Renderer, ElementRef, ChangeDetectorRef, NgZone  } from '@angular/core';
import { NavController, NavParams, Content, AlertController, PopoverController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { CollectionPage } from '../collection/collection';
import { ItemPage } from '../item/item';
import { CartPage } from '../cart/cart';
import { Data } from '../../providers/data';
import { CartProvider } from '../../providers/cart';
import { Values } from '../../providers/values';
import { ViewloaderPage } from '../viewloader/viewloader'

@Component({
  //changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'page-linesheet',
  templateUrl: 'linesheet.html'
  
})
export class LinesheetPage {

  items = [];
  maxItems: any;
  firstItem: any;
  lastItem: any;
  page: number;
  pageItems: number;
  pages: number;
  lastPageItems: number;
  pageArray = [];

  //pagination variables
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
  @ViewChild(Content) content: Content;
  @ViewChild('toggle_totals_input') totalMenu:ElementRef;

  itemPage = ItemPage;
  itemsCnt: number;
  cartPage: any = CartPage;
  viewloaderPage = ViewloaderPage;
  searchControl: FormControl;
  searchValue: string;
  vArray: any;
  qty: any = 0;
  addFlag: boolean = false;
  constructor( private zone: NgZone, private cd: ChangeDetectorRef, private popoverController:PopoverController, public navCtrl: NavController, public navParams: NavParams, public data: Data, public cartProvider: CartProvider, public values: Values, private el: ElementRef, private renderer: Renderer, private alertCtrl:AlertController, private popoverCtrl:PopoverController) {
    //this.values.products = null;

    //this.data.designer = this.navParams.get("designer");
  }

  ngOnInit(){
    //this.values.lsproducts = null;
    //this.values.search= '';
    this.searchValue= '';
    this.searchControl = new FormControl();
    //find the order part (for sub-totals)
    this.cartProvider.order_part_item_id = null;
    let abort=false;
    for (let pindex = 0, len = this.values.cart.request.order[0].sales_order_parts.length; pindex < len && !abort; pindex++) {  
      if (this.values.cart.request.order[0].sales_order_parts[pindex].seller_account_id == this.values.designer.seller_account_id) {
        this.cartProvider.order_part_item_id = pindex;
        abort=true;
      }
    };    

    //this.cd.markForCheck();

    //console.log(JSON.stringify(this.values.products));
    //this.data.designer = this.navParams.get("designer")
    //this.values.products = this.navParams.get("products");
    //this.data.consolelog(JSON.stringify(this.values.products));
    //this.data.collection = this.navParams.get("collection");    
    //this.designer.content = this.designer.content.split(/<p>|<\/p>|¤/);
    //this.data.consolelog(this.data.designer)
    this.data.consolelog('ionViewDidLoad CollectionPage')
    //this.data.getThisCollections(this.data.designer.seller_account_id);
    //this.data.getDesignerCurrency(this.values.user_profile.user_region_id,-1);

    //build array for virtual scrolling (flatten product + variants)
    this.buildArray('',0);

    this.addItemsToGrid();
    this.search();




    //***** Pagination code part **************//

    this.pageArrayLength = this.pageArray.length;
    this.pageLength = 7;
    this.currentGroupIndex = 0;

    let remainGroup = this.pageArrayLength % this.pageLength;
    let totalGroupCount = Math.floor(this.pageArrayLength / this.pageLength);
    let groupIndex = 0;
    let tempGroup = [];
    let pageLength = this.pageLength;
    
    if((totalGroupCount == 0) || (totalGroupCount == 1 && remainGroup == 0)) {
        if(remainGroup != 0) pageLength = remainGroup;
        this.prevVisibility = "hidden";
        this.nextVisibility = "hidden";
    }
    else {
        this.prevVisibility = "hidden";
        this.nextVisibility = "visible";
    }

    for (let index = 0; index < this.pageArrayLength ; index++) {
        tempGroup.push(this.pageArray[index]);
        if((index + 1) % pageLength == 0) {
            this.pageGroupArray.push(tempGroup);
            groupIndex++;
            this.totalGroupCount = groupIndex;
            console.log(this.totalGroupCount);
            if(groupIndex == totalGroupCount) pageLength = remainGroup;
            tempGroup = [];
        }
    }
    // console.log("dismiss_linsheet");
    // setTimeout(() => {
    //     this.data.dismissLoadingSpiner();
    // }, 800);
  }

  prevPage() {
    if(this.currentGroupIndex <= 0){
      this.currentGroupIndex = 0;
    }
    else
    {
      this.currentGroupIndex--;
    }
    if(this.currentGroupIndex == 0) this.prevVisibility = "hidden";
    this.nextVisibility = "visible";
  }

  nextPage() {
    if(this.currentGroupIndex >= this.totalGroupCount - 1)
    {
      this.currentGroupIndex = this.totalGroupCount - 1;
    }
    else
    {
      this.currentGroupIndex++;
    }

    if((this.currentGroupIndex == this.totalGroupCount - 1) || (this.currentGroupIndex == this.totalGroupCount && this.pageArrayLength % this.pageLength == 0)) this.nextVisibility = "hidden";
    this.prevVisibility = "visible";
  }

  ionViewDidEnter(){
    this.setItemQty();
  }

  ionViewDidLeave(){
    //this.items = [];
    //this.vArray = [];
  }

  buildArray(search,mode){
    //let thisProduct
    //let pindex
    //let vindex
    this.vArray = [];
    this.values.products.forEach((thisProduct, pindex) => {
      thisProduct.variants.forEach((thisVariant, vindex) => {
        if(search.length>0){
          if((thisVariant.vsearch.toLowerCase().indexOf(search.toLowerCase())>=0)&&(mode==0)){
            this.vArray.push({'variant':thisVariant,'product':thisProduct});  
          }
        }
        else
        {
          this.vArray.push({'variant':thisVariant,'product':thisProduct});
        }
      })
    })
    this.firstItem = 0;
    this.page = 0;
    this.pageItems = 35; 
    if(this.vArray.length==0)
    {
        this.pageItems=0
        this.itemsCnt=0
        this.pages=0
        this.lastPageItems=0
    }
    else
    {
      this.itemsCnt = this.vArray.length
      this.pages = Math.floor(this.itemsCnt/this.pageItems)
    
      var oddItems = this.itemsCnt % this.pageItems
      if (oddItems>0)
        {
          this.pages = this.pages+1;
          this.lastPageItems = oddItems;
        }
      else
        {
          this.lastPageItems = this.pageItems
        }
    }
    if(this.pages>0){this.pages = this.pages-1}
    this.pageArray = [];
    for (var i = 0; i < this.pages+1; i++) {
      var pageItems=this.pageItems;
      if (i == this.pages){pageItems=this.lastPageItems};
      this.pageArray.push({'page':i+1,'items':pageItems,'id':i}) ; 
    }  
    console.log(JSON.stringify(this.pageArray));    
    console.log('Mirror:'+this.vArray.length);
  }

  changePage(page){
    //
    console.log('Page:'+page)
    this.page = page-1;
    this.addItemsToGrid()
    this.scrollToTop();
  }

  addItemsToGrid(){
    //this.maxItems = this.vArray.length
    this.items = [];
    this.maxItems = this.pageArray[this.page].items
    this.firstItem = (this.page)*this.pageItems
    this.lastItem = this.firstItem + this.maxItems
    /*
    if(((search.length>0)&&(mode!=2))||(mode==1)){
      this.firstItem=0;
      this.lastItem=0;
      //if (this.maxItems>18){this.maxItems=18};
      this.items = [];
    }
    */
    //if(this.firstItem > this.maxItems){
    //  return false;  
    //}
    //if((this.firstItem + 18)>this.maxItems){
    //  this.lastItem = this.maxItems
    //}
    //else
    //{
    //  this.lastItem = this.firstItem+18;
    //}
    console.log(this.firstItem)
    console.log(this.lastItem-1)
    console.log(this.maxItems)
    
    let abort=false;
    for (var i = this.firstItem; i < this.lastItem&&abort==false; i++) {
      /*
      if(search.length>0){
        console.log('Search:'+this.vArray[i].variant.vsearch + ' - ' + this.vArray[i].product.product_title)
        if(this.vArray[i].variant.vsearch.toLowerCase().indexOf(search.toLowerCase())>=0){
          this.items.push( this.vArray[i] );  
        }
        else
        {         
          if(this.lastItem<this.maxItems){this.lastItem = this.lastItem + 1 ;} 
        }
      }
      else
      {
      */  
        this.items.push( this.vArray[i] );
      //}
    }
    //this.firstItem = this.lastItem
    //console.log('Found '+this.vArray.length);
    //this.cd.markForCheck();  
  }

  doInfinite(infiniteScroll) {
    console.log('Begin async operation');

    //setTimeout(() => {
      this.addItemsToGrid();
      //this.cd.markForCheck();
      console.log('Async operation has ended');
      infiniteScroll.complete();
    //}, 500);
  }

  search(){
    console.log('Search enabled')
    this.searchControl.valueChanges.debounceTime(1000).distinctUntilChanged().subscribe(searchString => {
      //if(searchString != '' && searchString){
        console.log('Search for:'+searchString)
        let mode=0
        this.searchValue = searchString;
        if(searchString.length==0){mode=1}
        this.buildArray(searchString,mode);
        this.addItemsToGrid();
      //}
    });
  }

  toggleTottle(){
    this.data.consolelog('Toggle Click');
    this.el.nativeElement.click();
  }

  /*
  changeCollection(collection_id){
    this.values.lsproducts = null;
    this.data.currentCollectionID = collection_id;
    //  get selected collection profile
    this.data.selectedCollection = this.data.filterCollections(this.data.currentCollectionID)[0];
    //  get product items in the collection
    this.data.consolelog('Getting products for collection ID:'+collection_id)
    this.data.getProduct(collection_id,this.values.device_token,this.values.user_profile.user_token,0,0).then(data => {      
      this.values.lsproducts = this.values.products;
      //this.values.products = data;
    })
  }
  */
  addToCart(product_title,colour,material,swatch,image,designer_title, variant_id, sku, price, event, designer_id, size, size_id, type, product_id, itemItem){
    this.zone.run(() => {
      if(this.values.user_profile.seller_account_id != 0){return false;}
      if(event == null) {
          this.qty = 0;
          this.addFlag = true;          
      } else {
          this.qty = event.target.value;
          if(this.qty == "") this.qty = 0;
      }
      this.cartProvider.addToCart(product_title,colour,material,swatch,image,designer_title, designer_id, product_id, variant_id, size, size_id, type, this.qty, price, sku);
      this.setItemQty();
      this.cd.markForCheck();
      this.qty = 0;
    });
    console.log("====== item ========");
    console.log(itemItem);
    console.log("====== item end ========");    
  }
  
  addProductVariantToCart(product_title,colour,material,swatch,image,designer_title, variant_id, sku, price, event, designer_id, size, size_id, type, product_id, itemItem){
    this.zone.run(() => {
      if(this.values.user_profile.seller_account_id != 0){return false;}
      let qty = event.target.value;
      this.data.consolelog('add to cart:'+qty);
      this.cartProvider.addToCart(product_title,colour,material,swatch,image,designer_title, designer_id, product_id, variant_id, size, size_id, type, qty, price, sku);
      this.setItemQty();
      this.cd.markForCheck();
    });
    console.log("====== item ========");
    console.log(itemItem);
    console.log("====== item end ========");
  }

  clearItem(variant_id,keepit){
    this.data.consolelog('Clear variant id:'+variant_id)
    this.cartProvider.clearSomeItem(variant_id,keepit)
    this.setItemQty();
  }

  isProductInOrder(product_id, variant_id, designer_id){
    let abort=false;
    for (let part = 0, len = this.values.cart.request.order[0].sales_order_parts.length; part < len && !abort; part++) {
      if (this.values.cart.request.order[0].sales_order_parts[part].seller_account_id==designer_id){
        //check line items
        for (let line = 0, len = this.values.cart.request.order[0].sales_order_parts[part].sales_order_lines.length; line < len && !abort; line++) {
          if(this.values.cart.request.order[0].sales_order_parts[part].sales_order_lines[line].product_id == product_id && this.values.cart.request.order[0].sales_order_parts[part].sales_order_lines[line].variant_id == variant_id) {
            abort=true;
          }
        }  
      }
    }
    if(abort){
      return("assets/images/selected-icon.png");
    }
    else
    {  
      return("assets/images/select-icon.png");
    }
  }

  setItemQty(){

      //  set QTY field for product variant size from cart
      this.values.products.forEach((product,pindex) => {
        this.values.products[pindex].variants.forEach((variant,vindex) => {
          this.values.products[pindex].variants[vindex].total = 0
          variant.sizes.forEach((size,sindex) => {
            var orderQTY = this.cartProvider.getSizeQty(this.values.products[pindex].variants[vindex].sizes[sindex].sku,this.values.designer.seller_account_id)
            
            this.values.products[pindex].variants[vindex].total = this.values.products[pindex].variants[vindex].total + (orderQTY * this.values.products[pindex].region_prices[0].wsp)
            if (orderQTY==0){
              this.values.products[pindex].variants[vindex].sizes[sindex].qty = '';
            }
            else{
              this.values.products[pindex].variants[vindex].sizes[sindex].qty = orderQTY;
            }
            //this.data.consolelog('Set QTY in UI:'+this.values.products[pindex].variants[vindex].sizes[sindex].qty);
          });
        });
      });

  }  

  downloadManager(collection_id,designer_id,designer,collection_title,mode){
      this.data.presentLoadingSpiner();
      setTimeout(() => {
          if (this.data.isloadingState == true) {
              this.data.dismissLoadingSpiner();
          }
      }, 2000);
      if(!this.values.online){
        this.data.offlineManager();
        return false;
      };
     if(mode!=3){    
      if(this.values.user_profile.forcecache){
        mode=2
      }
      else
      {
        mode=1
      }          
    }       
    let popover = this.popoverController.create(this.viewloaderPage,{collection_id:collection_id,designer_id:designer_id,mode:mode});
    popover.present();
    this.data.cacheCollection(collection_id, designer_id, designer, collection_title, mode).then(() => {
        setTimeout(() => {
            this.data.dismissLoadingSpiner();
        }, 500);
        //this.cd.markForCheck(); 
    });      
  }
  /*
  downloadCollection(collection_id,designer_id){
    if(!this.values.online){
      this.data.offlineManager();
      return false;
    };
    //  set the specific collection with an offline property status
    this.values.downloadTarget = 0;
    this.values.downloadQueue = 0;
    this.values.cancel=0;
    let popover = this.popoverCtrl.create(ViewloaderPage,{collection_id:collection_id,designer_id:designer_id,mode:1});
    popover.present();
    
    this.values.debug = 'Set Collection Status'
    let abort=false;
    for (let cindex = 0, len = this.values.collections.length; cindex < len && !abort; cindex++) {
      if (this.values.collections[cindex].collection_id == collection_id){
        abort = true;
        this.values.collections[cindex].offline = 'Downloading';
        this.values.collections[cindex].designer = this.data.designer.title;
        this.values.collections[cindex].size = this.values.collections[cindex].app_total_bytes        
        //this.data.consolelog('3. Status set to "downloading" - updating collections obj for this designer')
        let record_id = 'collections_'+designer_id
        
        this.data.storeCollections(record_id,this.values.collections)
          //this.data.consolelog('7. Collection Stored!')         
          this.values.debug = 'Set Collection Status: Done'
          this.data.getProduct(collection_id,this.values.user_profile.device_token,this.values.user_profile.user_token,1).then((data) => {
            this.values.products = data;
          });  
      }
    } 
  }
  */


  gridView(){
    this.navCtrl.push(CollectionPage, {collection: this.data.selectedCollection, mode: 'fromlinesheet'});
  }

  productItem(product){
    this.data.presentLoadingSpiner();
    setTimeout(() => {
        if (this.data.isloadingState == true) {
            this.data.dismissLoadingSpiner();
        }
    }, 2000);
    this.navCtrl.push(ItemPage, { product: product, collection: this.data.selectedCollection });
  }

  openPage(page): void {
    //this.navCtrl.setRoot(page);
    this.navCtrl.push(page);
  }

  scrollToTop() {
    this.content.scrollToTop();
  }

  popView(){
    this.items = [];
    this.vArray = [];    
    this.navCtrl.pop();
    //this.cd.markForCheck();
  }

}
