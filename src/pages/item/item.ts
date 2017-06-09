import { Component, ViewChild } from '@angular/core';
import { PopoverController, ViewController, NavController, NavParams, Content } from 'ionic-angular';
import { CartProvider } from '../../providers/cart';
import { Values } from '../../providers/values';
import { Data } from '../../providers/data';
import { View360Page } from '../view360/view360';
import { Slides } from 'ionic-angular';

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
  mySlideOptions = {
    paper:false,
    
  };

  //  keypad
  @ViewChild(Content) content: Content;
  @ViewChild(Slides) slides: Slides;

  cart: any;
  nb: any;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public popoverCtrl: PopoverController, public navparams: NavParams, public cartProvider: CartProvider, public values: Values, public data: Data) {

  }

  view360(variants, default360){
    //this.data.consolelog('360Variants:'+JSON.stringify(variants))
    let popover = this.popoverCtrl.create(View360Page,{productVariants: variants, default360: default360});
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

  ngOnInit(){

    this.product = this.navparams.get("product");
    this.collection = this.navparams.get("collection");
    this.data.designer = this.navparams.get("designer");
    //this.data.consolelog('ionViewDidLoad ItemPage')   
    //this.render3D();
    this.data.getDesignerCurrency(this.values.user_profile.user_region_id,-1);
    this.has360();

    //set the slider key frames
    let abort=false
    let keyCount=0
    this.product.variants[0].slidekey = 0
    for (let i = 0, len = this.product.variants.length; i < len && !abort; i++) { 
      if(i>0){
        keyCount = this.product.variants[i-1].variant_images.length + keyCount;
        this.product.variants[i].slidekey = keyCount;      
        console.log(keyCount+':'+this.product.variants[i-1].variant_images.length)
      }
    } 

  }

  viewSlide(slideNo){
    this.slides.slideTo(slideNo);
  }
  
  ionViewDidEnter(){
    this.setItemQty();
  }

  addToCart(product_title,colour,material,swatch,image,designer_title,variant_id, sku, price, event, designer_id, size, size_id, type, product_id){
      if(this.values.user_profile.seller_account_id != 0){return false;}
      let qty = event.target.value
      //this.data.consolelog('add to cart:'+qty);
      this.cartProvider.addToCart(product_title,colour,material,swatch,image,designer_title,designer_id, product_id, variant_id, size, size_id, type, qty, price, sku);
      
      this.setItemQty();
  }

  clearItem(variant_id,keepit){

    //this.data.consolelog('Clear variant id:'+variant_id)
    this.cartProvider.clearSomeItem(variant_id,keepit)
    this.setItemQty();
  }

  setItemQty(){

      //  set QTY field for product variant size from cart

      this.product.variants.forEach((variant,vindex) => {
        this.product.variants[vindex].total = 0
        variant.sizes.forEach((size,sindex) => {
          var orderQTY = this.cartProvider.getSizeQty(this.product.variants[vindex].sizes[sindex].sku,this.data.designer.seller_account_id)         
          this.product.variants[vindex].total = this.product.variants[vindex].total + (orderQTY * this.product.region_prices[0].wsp)
          if (orderQTY==0)
            {
              this.product.variants[vindex].sizes[sindex].qty=''
            }
          else
            {
              this.product.variants[vindex].sizes[sindex].qty = orderQTY
            }
        });
      });

  }

  has360(){
    let abort=false;
    for (let i = 0, len = this.product.variants.length; i < len && !abort; i++) { 
      for (let j = 0, len = this.product.variants[i].variant_images.length; j < len && !abort; j++) { 
        if(this.product.variants[i].variant_images[j].variant_360){
          abort=true;
          this.yesThisHas360 = true;
          this.default360 = this.product.variants[i].variant_images[j].variant_360;
          //this.data.consolelog('Yes, has 360 starting:'+this.default360);
        }
      }
    }
  }

  scrollToTop() {
    this.content.scrollToTop();
  }

  popView(){
    this.navCtrl.pop();
  }

  
  
}
