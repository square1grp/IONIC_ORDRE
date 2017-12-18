import { Injectable } from '@angular/core';

@Injectable()
export class Values {

    count: number = 0;
    filter: any = 10;
    isLoggedIn: boolean = false;
    customerName: string = "";
    customerId: number = null;
    listview: boolean = false;
    device_token: string = "";
    online: boolean;
    search: string = "";

    user_profile: any;
    designer: any;
    debug: any;

    isDesignersPage: boolean = true;
    designer_checkpoint = new Date('01/01/1980');
    collection_checkpoint = [];

    //cart: Array<[{sku: string, price: number, qty: number}]>;
    cart: any;
    post_cart: any;
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
    countries = [];

    activity_logs: any;
    shipping_address: any;
    shipping_addresses: any;
    //activity_log: any;

    cancel: boolean = false;

    cacheImageID: any;
    imageCacheFolder: 'imgCache';
    fs: any;
    freeSpace: any;

    downloadQueue: number = 0;
    downloadTarget: number = 0;
    numOfProdutTotalImages: number = 0;
    cacheProducts: any;
    force: any;
    pIndex: number = 0;
    cacheIndex: number = 0;
    pIndexCheckPoint: any;

    spinnerCheckPoint: any;
    //  the total number of the imaged in first screen.
    onescreen_total_imgages_num: number = 0;
    onescreen_image_index: number = 0;

    isHeavyLoad = false;

    imageFrames = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15',
        '16', '17', '18', '19', '20', '21', '22', '23', '24'];

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

