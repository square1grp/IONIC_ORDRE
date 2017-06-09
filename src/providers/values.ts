import { Injectable } from '@angular/core';

@Injectable()
export class Values {

  count: number = 0;
  filter: any = 10;
  isLoggedIn: boolean = false;
  customerName: string = "";
  customerId: number = null;
  listview: boolean = false;
  device_token: string= "";
  online: boolean;
  downloadQueue: number = 0;
  downloadTarget: number = 0;
  search: string = "";

  user_profile: any;
  designer: any;
  debug: any;

  designer_checkpoint = new Date('01/01/1980');  
  collection_checkpoint = [];

  //cart: Array<[{sku: string, price: number, qty: number}]>;
  cart: any;
  vieworder: any;
  emptyCart: any;
  orderHistory: any;
  orderDraft: any;
  currency: any = "USD";
  cartNonce: any;

  //main data
  designers: any;
  collections: any;
  products: any;
  lsproducts: any;
  downloadedCollections = [];

  cancel: any;

  cacheImageID: any;
  imageCacheFolder: 'imgCache';
  fs: any;
  freeSpace: any;

  imageFrames = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24'];

  //API
  APIRoot = "https://ordre.kineticmedia.com.au";   //  STAGE
  //APIRoot = "https://www.ordre.com";             //  PRODUCTION


  constructor() {

    this.device_token = "";
    this.debug = true;

    //let this.cart = Object.assign({}, this.emptyCart);  cloning doesn't work - new object is bound to assign!
    this.orderHistory = [];
    this.orderDraft = [];
  }

}

