import { Injectable } from '@angular/core';
import { Platform, AlertController, LoadingController } from 'ionic-angular';
import { Http, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { Values } from './values';
import { Connectivity } from './connectivity';
import { Storage } from '@ionic/storage';
//import { IonicStorageModule } from '@ionic/storage'
import { File } from '@ionic-native/file';
import PouchDB from 'pouchdb';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { concat } from 'rxjs/operator/concat';

declare var cordova;

@Injectable()
export class Data {
    abort = false;

    action: string;
    email: string;
    pass: string;
    data: any;


    //  collection management
    collection: any;
    user: any;
    designers: any;
    designer: any;
    currentCollectionID: any;
    selectedCollection: any;
    retailers: any;
    buyers: any;
    loading: any;


    //drafts and orders
    draftOrders = [];
    requestedOrders: any;
    db: any;
    dbDraft: any;
    dbRequest: any;
    oldDraftOrders = [];
    oldRequestedOrders = [];
    imageDB: any;
    storeDesigners: any;
    storeCollection: any;
    storeProducts: any;
    dlog: any;
    loadingState: boolean = false;
    isloadingState: boolean = false;
    SQLLite: boolean;

    //  download management CindexCollection
    c_collection_title: string;
    c_collection_id: any;
    c_designer_title: string;
    c_designer_id: any;
    c_mode: number;
    c_action: string;
    c_collection_total_bytes: any;


    constructor(private file: File, public storage: Storage, public loadingCtrl: LoadingController, public http: Http,
        public platform: Platform, public values: Values, private alertCtrl: AlertController, private connectivity: Connectivity) { }


    ngOnInit() {
        setTimeout(() => {
            this.initDB();
        }, 3000);
        this.createLoader();
    }

    initDB() {

        //this.SQLLite = true;

        return new Promise((resolve, reject) => {
            this.consolelog('Waiting for platform...');
            this.platform.ready()
                .then(() => {
                    this.storage.ready().then(() => {

                        // Init dB
                        this.consolelog('PouchdB Init');
                        //PouchDB.debug.disable()

                        this.dbDraft = new PouchDB('ordreDraft01');
                        this.dbRequest = new PouchDB('ordreRequested01');
                        this.storage.get('cacheImageID').then((data) => {
                            if (data != null) {
                                this.values.cacheImageID = data
                            }
                            else {
                                this.values.cacheImageID = 0
                            }
                        })

                        //check cache storage (file or dB)
                        if (this.platform.is('cordova!')) {

                            this.values.fs = cordova.file.dataDirectory;
                            this.file.checkDir(this.values.fs, this.values.imageCacheFolder).then(() => { }).catch(err => {
                                this.file.createDir(this.values.fs, this.values.imageCacheFolder, true)
                            });
                            this.values.freeSpace = this.file.getFreeDiskSpace()
                            console.log('Freespace:' + JSON.stringify(this.values.freeSpace))
                            //this.storage.clear();
                        }
                        else {
                            //dev so clear it about
                            //this.storage.clear();
                        }

                        this.values.online = this.connectivity.isOnline();
                        this.addConnectivityListeners();

                        //persist user
                        this.getUser().then(data => {
                            if (data != null) {
                                this.values.user_profile = data;
                            }
                            resolve(data);
                        })

                    });

                });
        });
    }

    addConnectivityListeners(): void {

        //force online + watch for change
        this.connectivity.watchOnline().subscribe(() => {
            console.log("online");
            this.values.online = true;
        });

        this.connectivity.watchOffline().subscribe(() => {
            console.log("offline");
            this.values.online = false;
        });

    }

    offlineManager() {

        if (!this.values.online) {
            let alert = this.alertCtrl.create({
                title: 'You are offline.',
                subTitle: 'You need to be online to do this. Check your settings and try again.',
                buttons: [
                    {
                        text: 'OK',
                        handler: () => {
                            this.consolelog('Warning about being offline');
                            this.dismissLoadingSpiner();
                        }
                    }
                ]
            });
            alert.present();
        }

    }
    // login method for kinetic API

    login(credentials, device_token) {
        let email = credentials.user_email
        let password = credentials.user_password
        return new Promise((resolve, reject) => {
            if (!this.values.online) {
                this.offlineManager();
                reject(null);
            };

            let apiSource = this.values.APIRoot + "/app/auth.php?json={%22action%22:%22login_user%22,%22request%22:{%22email%22:%22" + email + "%22,%22pass%22:%22" + password + "%22}}";
            this.http.get(apiSource)
                .map(res => res.json())
                .subscribe(data => {
                    this.consolelog('Got Authentication Result');
                    resolve(data);
                });
        });
    }

    //  user profiles

    saveUser(profile) {
        return new Promise((resolve, reject) => {
            this.consolelog('Delete then save user')
            this.deleteItem('user_profile').then(() => {
                //this.consolelog('SAVE USER:'+JSON.stringify(profile))
                profile._id = 'user_profile';
                resolve(this.storage.set('user_profile', profile));
            });
        });
    }


    getUser() {
        return new Promise((resolve, reject) => {
            this.consolelog('Get user')
            this.storage.get('user_profile').then((data) => {
                resolve(data);
            }).catch(error => {
                resolve({ 'user_id': 0 });
            })
        });
    }

    // is this redundant now?
    removeUser(delUser) {

        return new Promise((resolve, reject) => {
            //resolve(null)

            this.storage.remove(delUser).then((data) => {
                data = '';
                resolve(data);
            }).catch(error => {
                reject(error);
            })

        });
    }

    getLog() {
        this.storage.get('download_log').then((response) => {
            this.dlog = [];
            if (response != null) {
                this.dlog = response.data;
                console.log('Got log')
            }
        })
    }

    //  orders and drafts 

    saveOrder(order) {
        //draft._id = id;
        delete order._id;
        delete order._rev;
        //this.consolelog('SAVE:'+JSON.stringify(order))
        return new Promise((resolve, reject) => {
            order._id = new Date().toJSON();
            this.dbRequest.post(order).then((new_id) => {
                resolve(new_id);
            }).catch(error => {
                reject(error);
            })
        });
        //this.dbDraft.post(draft).subscribe((data) =>{
        //  return data;  
        //});
    }

    getOrder(id) {
        return new Promise((resolve, reject) => {
            this.dbRequest.get(id).then((data) => {
                resolve(data);
            }).catch(error => {
                reject(error);
            })
        });
    }

    saveDraftOrder(draft) {
        //draft._id = id;
        return new Promise((resolve, reject) => {
            draft._id = new Date().toJSON();
            //draft.door =  this.values.cart.request.order[0].door;
            delete draft._rev;
            //this.consolelog('SAVING:' + JSON.stringify(draft));
            this.consoleLog("draft", draft);
            this.dbDraft.post(draft).then((new_id) => {
                resolve(new_id);
            }).catch(error => {
                reject(error);
            })
        });
        //this.dbDraft.post(draft).subscribe((data) =>{
        //  return data;  
        //});
    }

    getAllDraftOrders(buyer_id, seller_id) {
        this.consolelog('Getting all draft orders for:' + buyer_id + ':' + seller_id)
        return this.dbDraft.allDocs({ include_docs: true })
            .then(docs => {
                this.draftOrders = docs.rows.map(row => {
                    if (seller_id > 0) {
                        this.consolelog('Filtering by seller')
                        if ((row.doc.seller_account_id == seller_id) && (row.doc.buyer_id == buyer_id)) {
                            row.doc.Date = new Date(row.doc.Date);
                            //this.consolelog('Found'+JSON.stringify(row.doc));
                            return row.doc;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        console.log(row.doc.buyer_id);
                        if (row.doc.buyer_id == buyer_id) {
                            row.doc.Date = new Date(row.doc.Date);
                            //this.consoleLog('row.doc', row.doc);
                            return row.doc;
                        }
                        else {
                            return false;
                        }
                    }
                });

                this.consoleLog("this.values.cart in getAllDraftOrders", this.values.cart);
                this.consoleLog("this.draftOrders in getAllDraftOrders", this.draftOrders);
                return this.draftOrders;
            });
    }

    getDraftOrder(id) {
        return new Promise((resolve, reject) => {
            this.dbDraft.get(id).then((data) => {
                resolve(data);
            }).catch(error => {
                reject(error);
            })
        });
        //this.dbDraft.get(id).subscribe((data) =>{
        //  return data;  
        //});
    }

    deleteDraftOrder(doc) {
        return new Promise((resolve, reject) => {
            //this.consolelog('Delete DRAFT _id:'+doc._id);
            this.dbDraft.remove(doc).catch(function (err) {
                this.consolelog(err);
                return Promise.resolve(null);
            });
        });
    }

    getAllOrders(buyer_id, seller_id) {

        this.consolelog('Getting all orders for:' + buyer_id + ':' + seller_id)
        return this.dbRequest.allDocs({ include_docs: true })
            .then(docs => {

                this.requestedOrders = docs.rows.map(row => {
                    // Dates are not automatically converted from a string.
                    //this.consolelog('Row:'+JSON.stringify(row.doc))
                    if (seller_id > 0) {
                        if ((row.doc.seller_account_id == seller_id) && (row.doc.buyer_id == buyer_id)) {
                            row.doc.Date = new Date(row.doc.Date);
                            //this.consolelog('Found'+JSON.stringify(row.doc));
                            return row.doc;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        if (row.doc.buyer_id == buyer_id) {
                            row.doc.Date = new Date(row.doc.Date);
                            //this.consolelog('Found'+JSON.stringify(row.doc));
                            return row.doc;
                        }
                        else {
                            return false;
                        }
                    }
                });
                this.consoleLog("this.draftOrders in getAllOrders", this.requestedOrders);
                return this.requestedOrders;
            });
    }

    updateOldOrders() {
        this.storage.get('updated_flag').then((result) => {
            if (result == true) {
                console.log("You have already updated your old Orders.");
            }
            else {
                this.dbDraft.allDocs({ include_docs: true }).then(docs => {
                    docs.rows.map(row => {
                        if (!row.doc.hasOwnProperty('door')) {
                            let oldOrder = {
                                _rev: row.doc._rev,
                                _id: row.doc._id,
                                status: row.doc.status
                            }
                            this.oldDraftOrders.push(oldOrder);
                        }
                        else if (!row.doc.door.hasOwnProperty('door_email')) {
                            let oldOrder = {
                                _rev: row.doc._rev,
                                _id: row.doc._id,
                                status: row.doc.status
                            }
                            this.oldDraftOrders.push(oldOrder);
                        }
                    });
                    this.consoleLog("this.values.cart in update", this.values.cart);
                    this.consoleLog("this.draftOrders in update", this.draftOrders);
                }).then(() => {
                    this.consoleLog("oldOrders", this.oldDraftOrders);
                    for (let cindex = 0, len = this.oldDraftOrders.length; cindex < len; cindex++) {
                        this.dbDraft.get(this.oldDraftOrders[cindex]._id).then((doc) => {
                            if (doc.status ==  "DRAFT") doc.status = "SERVER_DRAFT";
                            if (doc.status ==  "REQUEST") doc.status = "LOCAL_DRAFT";
                            doc.door = {
                                "door_first_name": "",
                                "door_last_name": "",
                                "door_company": "",
                                "door_email": "",
                                "door_address": "",
                                "door_address_2": "",
                                "door_city": "",
                                "door_state": "",
                                "door_postcode": "",
                                "door_telephone": "",
                                "door_country": "",
                            };
                            if (!doc.hasOwnProperty('purchase_order')) {
                                doc.purchase_order = "";
                            }
                            return this.dbDraft.put(doc);
                        });
                    }
                });

                this.dbRequest.allDocs({ include_docs: true }).then(docs => {
                    docs.rows.map(row => {
                        if (!row.doc.hasOwnProperty('door')) {
                            let oldOrder = {
                                _rev: row.doc._rev,
                                _id: row.doc._id,
                                status: row.doc.status
                            }
                            this.oldRequestedOrders.push(oldOrder);
                        }
                        else if (!row.doc.door.hasOwnProperty('door_email')) {
                            let oldOrder = {
                                _rev: row.doc._rev,
                                _id: row.doc._id,
                                status: row.doc.status
                            }
                            this.oldDraftOrders.push(oldOrder);
                        }
                    });
                    this.consoleLog("this.values.cart in update", this.values.cart);
                    this.consoleLog("this.draftOrders in update", this.requestedOrders);
                }).then(() => {
                    this.consoleLog("oldOrders", this.oldRequestedOrders);
                    for (let cindex = 0, len = this.oldRequestedOrders.length; cindex < len; cindex++) {
                        this.dbRequest.get(this.oldRequestedOrders[cindex]._id).then((doc) => {
                            doc.door = {
                                "door_first_name": "",
                                "door_last_name": "",
                                "door_company": "",
                                "door_email": "",
                                "door_address": "",
                                "door_address_2": "",
                                "door_city": "",
                                "door_state": "",
                                "door_postcode": "",
                                "door_telephone": "",
                                "door_country": "",
                            };
                            if (!doc.hasOwnProperty('purchase_order')) {
                                doc.purchase_order = "";
                            }
                            return this.dbRequest.put(doc);
                        });
                    }
                });
                this.storage.set('updated_flag', true);         
            } 
        });
    }

    getDesigners(device_token, user_token, force) {

        let checkpoint = false;
        let ONE_HOUR = 60 * 60 * 1000;
        let baseDate = new Date('01/01/1980');
        let nowDate = Date.now();
        this.consolelog('Get Designers - Checkpoint:' + this.values.designer_checkpoint + ' compared:' + (this.values.designer_checkpoint.getTime() == baseDate.getTime()));
        this.consolelog('Checkpoint past?' + (nowDate - ONE_HOUR > this.values.designer_checkpoint.getTime()));

        if ((this.values.online) && ((this.values.designer_checkpoint.getTime() == baseDate.getTime()) ||
            (nowDate - ONE_HOUR > this.values.designer_checkpoint.getTime()))) {
            force = true;
            checkpoint = true;
        }
        this.consolelog('Force?' + force);

        //  check for designers in db

        let record_id = 'designers'
        let record_id_get = record_id;
        if (force == true) {
            record_id_get = 'NOPEA1';
        }
        console.log("//-----  record_id_get  ------//");
        console.log(record_id_get);

        return new Promise((resolve, reject) => {
            this.consolelog('Try GET:' + record_id);
            this.storage.get(record_id_get).then((result) => {

                console.log("//-----  result  ------//");
                console.log(JSON.parse(result));

                if (result != null) {
                    console.log('Got:' + record_id)
                    let pdata = JSON.parse(result)
                    //console.log(pdata.data);
                    this.values.designers = null;
                    resolve(pdata.data);
                    return false;
                    //this.loading.dismiss().catch(() => {});
                }
                console.log('Online:' + this.values.online)
                if (!this.values.online) {
                    this.offlineManager();
                    //this.loading.dismiss().catch((err) => {console.log('Problem with spinner:'+err)});
                    return false;
                };

                if ((checkpoint == true || force == true || result == null) && (this.values.online)) {
                    this.consolelog('Forced update?' + force);
                    let apiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22designers%22,%22request%22:{%22device_token%22:%22" +
                        device_token + "%22,%22user_token%22:%22" + user_token + "%22,%22checkpoint%22:%22" + (baseDate.getTime() / 1000) + "%22}}";
                    this.consolelog(apiSource);
                    this.http.get(apiSource).map(res => res.json()).subscribe(data => {
                        this.consolelog('Got All Designers from API');
                        let gotdata = data.result;
                        this.consoleLog("data", data);
                        this.consoleLog("data.result", data.result);
                        resolve(data.result);
                        this.values.designer_checkpoint = new Date();
                        this.consolelog('Store in pouchDB');
                        this.storeDesigners = { '_id': record_id, data: gotdata };

                        this.consolelog('Store Designers with wrapper.');
                        this.storage.set(record_id, JSON.stringify(this.storeDesigners)).then((new_ID) => {
                        }).catch(function (err) {
                            console.log(err);
                        });
                    })
                }
            })
        });
    }

    // all collections for the selected designer

    getThisCollections(designer_id, device_token, user_token) {
        return new Promise((resolve, reject) => {
            console.log(this.values.designers);
            console.log(this.values.designer);
            console.log(designer_id);
            
            this.getCollections(designer_id, device_token, user_token, 0).then(response => {
                this.values.collections = response;
                
                this.storage.get('download_log').then((response) => {
                    if (response != null) {
                        let ulog = response.data;
                        this.consoleLog('ulog', ulog);
                        for (let i = 0, len = ulog.length; i < len; i++) {
                            for (let j = 0, len = this.values.collections.length; j < len; j++) {
                                if (ulog[i].collection_id == this.values.collections[j].collection_id) {
                                    //set collection status
                                    this.values.collections[j].offline = ulog[i].action;
                                }
                            }
                        }
                    }
                });
                this.consoleLog('this.values.collections', this.values.collections);
                if (this.values.hasOwnProperty('collections')) {
                    //current collection ID
                    this.currentCollectionID = this.setThisCollection();
                    this.consolelog('Set Current Collection... ');

                    this.selectedCollection = this.filterCollections(this.currentCollectionID)[0];
                }
                resolve(response);
            }).catch(function (err) {
                reject(err);
            });
        });
    }

    getCollections(designer_id, device_token, user_token, force) {

        let checkpoint = false;

        let ONE_HOUR = 60 * 60 * 1000;
        let baseDate = new Date('01/01/1980');
        let nowDate = Date.now();
        this.consoleLog("collection_checkpoint", this.values.collection_checkpoint);
        if (!this.values.collection_checkpoint[designer_id]) {
            this.values.collection_checkpoint[designer_id] = new Date('01/01/1980');
        }

        if (force == 0 && this.values.online && (this.values.collection_checkpoint[designer_id].getTime() == baseDate.getTime()
            || nowDate - ONE_HOUR > this.values.collection_checkpoint[designer_id].getTime())) {
            force = true;
        }
        //  check for designers in pouch
        let record_id = 'collections_' + designer_id;
        let record_id_get = record_id;  
        if (force == true) { record_id_get = 'NOPEA' }
        return new Promise((resolve, reject) => {
            this.storage.get(record_id_get).then((result) => {
                if (result != null) {
                    let pdata = JSON.parse(result);
                    resolve(pdata.data);
                    // this.storage.get('download_log').then((response) => {
                    //     if (response != null) {
                    //         let ulog = response.data;
                    //         for (let i = 0, len = ulog.length; i < len; i++) {
                    //             for (let j = 0, len = this.values.collections.length; j < len; j++) {
                    //                 if (ulog[i].collection_id == this.values.collections[j].collection_id) {
                    //                     //set collection status
                    //                     this.values.collections[j].offline = 'Downloaded'
                    //                 }
                    //             }
                    //         }
                    //     }
                    // });
                }
                else {
                    if (checkpoint == true || force == true || result == null) {
                        if (!this.values.online) {
                            this.offlineManager();
                            reject(null);
                        };
                        if (this.values.online) {
                            let apiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22collections_short%22,%22request%22:{%22device_token%22:%22" + device_token + "%22,%22user_token%22:%22" + user_token + "%22,%22checkpoint%22:%22" + (baseDate.getTime() / 1000) + "%22,%22seller_account_id%22:" + designer_id + "}}";
                            this.http.get(apiSource).map(res => res.json()).subscribe(data => {
                                resolve(data.result);
                                this.consolelog('Got Collection from API:' + apiSource);
                                this.values.collection_checkpoint[designer_id] = new Date();
                                this.storeCollections(record_id, data.result);

                                //  set download status based on collection download index
                                // this.storage.get('download_log').then((response) => {
                                //     if (response != null) {
                                //         let ulog = response.data;
                                //         for (let i = 0, len = ulog.length; i < len; i++) {
                                //             for (let j = 0, len = this.values.collections.length; j < len; j++) {
                                //                 if (ulog[i].collection_id == this.values.collections[j].collection_id) {
                                //                     //set collection status
                                //                     this.values.collections[j].offline = 'Downloaded'
                                //                 }
                                //             }
                                //         }
                                //     }
                                // });

                            });
                        }
                    }
                }
            }).catch(function (err) {
                console.log(err);
                let idn = '';
                resolve(idn);
            })
        });
    }

    //  stores collection list for a designer, record_id = 'collections_' + designer_id

    storeCollections(record_id, data) {
        this.consolelog('4. Store in db');
        let storeCollection = { '_id': record_id, data: data };
        this.consolelog('5. Store Collections with wrapper.');
        this.consolelog('5d. Delete done, Posting:' + storeCollection._id);
        this.storage.set(record_id, JSON.stringify(storeCollection));
    }

    deleteItem(id) {
        //this.consolelog('5a. Delete an ID:' + id);
        return new Promise((resolve, reject) => {
            this.storage.remove(id).then((data) => {
                //this.consolelog('5c. Item deleted:'+id);
                let idn = '';
                resolve(idn);
            }).catch(function (err) {
                console.log(err);
                let idn = '';
                resolve(idn);
            });
        });
    };


    getProduct(collection_id, device_token, user_token, force, mode) {
        //mode=set values or return them
        //force = cache force
        if (force == 4) force = 1;
        if (force == 5) force = 2;
        let record_id = 'products_' + collection_id;
        let record_id_get = record_id;
        if (force == 1) record_id_get = 'NOPEA';
        return new Promise((resolve, reject) => {
            this.values.debug = 'Get Products';
            this.storage.get(record_id_get).then((result) => {
                if (result != null) {
                    let pdata = JSON.parse(result)
                    if (mode == 0) {
                        this.values.products = pdata.data;
                        resolve('');
                    }
                    else {
                        resolve(pdata.data);
                    }
                    this.consolelog('9. Done getting data');
                    if (force > 0) {
                        this.productsCache(pdata.data, force);
                    }
                }
                else {
                    console.log('Not found in dB: Products for collection ' + record_id_get);
                    if (!this.values.online) {
                        this.offlineManager();
                        reject(null);
                    }
                    if (this.values.online) {
                        let apiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22collection_products%22,%22request%22:{%22device_token%22:%22" + device_token + "%22,%22user_token%22:%22" + user_token + "%22,%22collection_id%22:" + collection_id + "}}";
                        this.http.get(apiSource).map(res => res.json()).subscribe(productData => {
                            this.consolelog('10. Got Products from API:' + apiSource);
                            if (mode == 0) {
                                this.values.products = productData.result;
                                resolve('');
                            } else {
                                resolve(productData.result);
                            }
                            this.deleteItem(record_id).then(() => {
                                let storeProducts = { '_id': record_id, data: productData.result };
                                let newData = JSON.stringify(storeProducts);
                                this.storage.set(record_id, newData).then(() => {
                                    if (productData.result.length > 0 && force > 0) {
                                        this.productsCache(productData.result, force);
                                    }
                                }).catch((err) => {
                                    console.log(err);
                                    let idn = '';
                                    resolve(idn);
                                });
                            });
                        });
                    }
                }
            }).catch(function (err) {
                console.log(err);
                let idn = '';
                resolve(idn);
            });
        });
    }

    productCache_original(products, force) {
        //designer logos not passively cached
        //http://ordre.kineticmedia.com.au/app/get_image.php?image=/media/prod_images/t/t/tt1.jpg&w=320&h=150&zc=1&xtype=designer
        if (this.values.designer != undefined) {
            this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'
                + this.values.designer.logo_image + '&w=320&h=150&zc=1&xtype=designer', force);
        }
        console.log('Product Cache');
        //  mode
        //  1 = just try and cache
        //  2 = delete then cache
        //  3 = just delete
        //products.forEach((product, pindex) => {
        let product: any;
        for (let pindex = 0; pindex < products.length; pindex++) {
            //for (let pindex = 0; pindex < 3; pindex++) {
            console.log("pindex: " + pindex);
            product = products[pindex];
            this.values.debug = 'Processing products';
            if (product.variants[0]) {
                //  cache the main product image and slider images
                if (product.variants[0].variant_images[0]) {
                    //if(product.variants[0].variant_images[0].variant_image){
                    //this.consolelog('Cached feature image:'+this.values.APIRoot + '/app/get_image.php?image=/'+product.variants[0]
                    //.variant_images[0].variant_image+'&w=342&h=509')
                    //this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'+product.variants[0].variant_images[0]
                    //.variant_image+'&w=342&h=509&xtype=prodimage');
                    //}
                    if (product.variants.length > 0 && this.values.cancel == false) {
                        //product.variants.forEach((variant) => {
                        let variant: any;
                        for (let vindex = 0; vindex < product.variants.length; vindex++) {
                            variant = product.variants[vindex];
                            //  product hero image
                            if (variant.variant_images[0].variant_image) {
                                //this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'+variant.variant_images[0].variant_image
                                //+'&w=110&h=165&xtype=prodimage',force);  
                                this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + variant.variant_images[0].variant_image
                                    + '&w=342&h=509&xtype=prodimage', force);
                            }
                            //  swatches
                            if (variant.swatch.swatch_image && this.values.cancel == false) {
                                this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + variant.swatch.swatch_image
                                    + '&w=20&h=20&xtype=prodimage', force);
                                this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + variant.swatch.swatch_image
                                    + '&w=100&h=100&xtype=prodimage', force);
                            }
                            if (variant.variant_images.length > 0 && this.values.cancel == false) {
                                variant.variant_images.forEach((imageslide) => {
                                    //  360 left nav
                                    //if(imageslide.hasOwnProperty('variant_360')){
                                    //  this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'+imageslide.variant_360+'img01
                                    //  .jpg&w=683&h=957&zc=3',force);  
                                    //}
                                    //  variant images
                                    if ((imageslide.variant_image.length > 0) && (this.values.cancel == false)) {
                                        //  item?
                                        this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + imageslide.variant_image +
                                            '&w=683&h=980&zc=2&xtype=prodimage', force);
                                        //  linesheet
                                        this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + imageslide.variant_image +
                                            '&w=110&h=165&xtype=prodimage', force);
                                    }
                                    //  cache 360 frames                                 
                                    if (imageslide.variant_360 && this.values.cancel == false) {
                                        //this.values.imageFrames.forEach((frame) => {
                                        let pad = "00";
                                        for (let i = 1, len = imageslide.frame_count; i < len; i++) {
                                            let thisFrame = "" + i;
                                            let frame = pad.substring(0, pad.length - thisFrame.length) + thisFrame;
                                            this.consolelog('Cached 360 image:' + this.values.APIRoot + '/app/get_image.php?image=/' +
                                                imageslide.variant_360 + 'img' + frame + '.jpg&w=480&h=670&zc=3&xtype=360');
                                            this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + imageslide.variant_360 + 'img'
                                                + frame + '.jpg&w=480&h=670&zc=3&xtype=360', force);
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    productsCache(products, force) {
        this.abort = false;
        this.values.debug = 'Processing products';
        this.countDownloadTarget(products, force);
        this.values.cacheProducts = products;
        this.values.force = force;
        this.values.pIndex = 0;
        this.values.cacheIndex = 0;
        this.values.numOfProdutTotalImages = 0;
        //designer logos not passively cached
        //http://ordre.kineticmedia.com.au/app/get_image.php?image=/media/prod_images/t/t/tt1.jpg&w=320&h=150&zc=1&xtype=designer
        if (this.values.designer != undefined) {
            this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'
                + this.values.designer.logo_image + '&w=320&h=150&zc=1&xtype=designer', force);
            this.values.cacheIndex = this.values.cacheIndex - 1;
            //this.values.numOfProdutTotalImages = this.values.numOfProdutTotalImages + 1;
        }
        this.values.pIndexCheckPoint = Date.now();
        setTimeout(() => {
            let currentCheckPoint = Date.now();
            if (currentCheckPoint - this.values.pIndexCheckPoint >= 7000) {
                if (!this.values.online) {
                    this.offlineManager();
                    return false;
                };
            }
        }, 7000);
        this.countProdutTotalImages(this.values.cacheProducts[this.values.pIndex], this.values.force);
        this.productCache(this.values.cacheProducts[this.values.pIndex], this.values.force);
    }

    productCache(product, force) {
        console.log("Downloading is runnig at the product number  :  " + this.values.pIndex);
        if (product.variants[0]) {
            if (product.variants[0].variant_images[0]) {
                if (product.variants.length > 0) {
                    product.variants.forEach((variant) => {
                        if (variant.variant_images[0].variant_image) {
                            this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + variant.variant_images[0].variant_image
                                + '&w=342&h=509&xtype=prodimage', force);
                        }
                        //  swatches
                        if (variant.swatch.swatch_image) {
                            this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + variant.swatch.swatch_image
                                + '&w=20&h=20&xtype=prodimage', force);
                            this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + variant.swatch.swatch_image
                                + '&w=100&h=100&xtype=prodimage', force);
                        }
                        if (variant.variant_images.length > 0) {
                            variant.variant_images.forEach((imageslide) => {
                                if (imageslide.variant_image.length > 0) {
                                    //  item?
                                    this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + imageslide.variant_image +
                                        '&w=683&h=980&zc=2&xtype=prodimage', force);
                                    //  linesheet
                                    this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + imageslide.variant_image +
                                        '&w=110&h=165&xtype=prodimage', force);
                                }
                                //  cache 360 frames                                 
                                if (imageslide.variant_360) {
                                    //this.values.imageFrames.forEach((frame) => {
                                    let pad = "00";
                                    for (let i = 1, len = imageslide.frame_count; i < len; i++) {
                                        let thisFrame = "" + i;
                                        let frame = pad.substring(0, pad.length - thisFrame.length) + thisFrame;
                                        this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + imageslide.variant_360 + 'img'
                                            + frame + '.jpg&w=480&h=670&zc=3&xtype=360', force);
                                    }
                                }
                            });
                        }
                    });
                }
            }
        }
    }

    countProdutTotalImages(product, force) {
        this.values.numOfProdutTotalImages = 0;
        if (product.variants[0]) {
            if (product.variants[0].variant_images[0]) {
                if (product.variants.length > 0) {
                    product.variants.forEach((variant) => {
                        if (variant.variant_images[0].variant_image) {
                            this.values.numOfProdutTotalImages = this.values.numOfProdutTotalImages + 1;
                        }
                        //  swatches
                        if (variant.swatch.swatch_image) {
                            this.values.numOfProdutTotalImages = this.values.numOfProdutTotalImages + 1;
                            this.values.numOfProdutTotalImages = this.values.numOfProdutTotalImages + 1;
                        }
                        if (variant.variant_images.length > 0) {
                            variant.variant_images.forEach((imageslide) => {
                                if (imageslide.variant_image.length > 0) {
                                    //  item?
                                    this.values.numOfProdutTotalImages = this.values.numOfProdutTotalImages + 1;
                                    //  linesheet
                                    this.values.numOfProdutTotalImages = this.values.numOfProdutTotalImages + 1;
                                }
                                //  cache 360 frames                                 
                                if (imageslide.variant_360) {
                                    //this.values.imageFrames.forEach((frame) => {
                                    for (let i = 1, len = imageslide.frame_count; i < len; i++) {
                                        this.values.numOfProdutTotalImages = this.values.numOfProdutTotalImages + 1;
                                    }
                                }
                            });
                        }
                    });
                }
            }
        }
    }

    countDownloadTarget(products, force) {
        if (this.values.designer != undefined) {
            this.values.downloadTarget = this.values.downloadTarget + 1;
        }
        this.values.downloadTarget = 0;
        products.forEach((product, pindex) => {
            this.values.debug = 'Processing products';
            if (product.variants[0]) {
                if (product.variants[0].variant_images[0]) {
                    if (product.variants.length > 0) {
                        product.variants.forEach((variant) => {
                            if (variant.variant_images[0].variant_image) {
                                this.values.downloadTarget = this.values.downloadTarget + 1;
                            }
                            if (variant.swatch.swatch_image) {
                                this.values.downloadTarget = this.values.downloadTarget + 1;
                                this.values.downloadTarget = this.values.downloadTarget + 1;
                            }
                            if (variant.variant_images.length > 0) {
                                variant.variant_images.forEach((imageslide) => {
                                    if (imageslide.variant_image.length > 0) {
                                        this.values.downloadTarget = this.values.downloadTarget + 1;
                                        this.values.downloadTarget = this.values.downloadTarget + 1;
                                    }
                                    if (imageslide.variant_360) {
                                        for (let i = 1, len = imageslide.frame_count; i < len; i++) {
                                            this.values.downloadTarget = this.values.downloadTarget + 1;
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
        this.values.downloadQueue = this.values.downloadTarget;
    }

    cacheMaybe(url, force) {
        //  cache force
        //  1 = just try and cache
        //  2 = delete then cache
        //  3 = just delete
        if (force > 1) {
            console.log('Delete from cache:' + url);
            this.deleteItem(url).then(() => {
                if (force == 3) {
                    this.values.downloadQueue = this.values.downloadQueue - 1;
                    if (this.values.downloadQueue < 0) this.values.downloadQueue = 0;

                    this.values.cacheIndex = this.values.cacheIndex + 1;
                    if (this.values.cacheIndex >= this.values.numOfProdutTotalImages) {
                        this.values.pIndex = this.values.pIndex + 1;
                        this.values.cacheIndex = 0;
                        if (this.values.pIndex >= this.values.cacheProducts.length || this.values.cancel == true) {
                            if (this.values.cancel == false) {
                                if (this.c_mode == 3) {
                                    this.delCindex(this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id);
                                }
                                else {
                                    if (this.c_mode > 0) {
                                        this.addCindex(this.c_action, this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id, this.c_collection_total_bytes);
                                    }
                                }
                            }
                            this.values.pIndex = 0;
                            this.values.cancel = false;
                            this.values.pIndexCheckPoint = Date.now();
                            this.abort = true;
                        }
                        else {
                            this.values.pIndexCheckPoint = Date.now();
                            setTimeout(() => {
                                let currentCheckPoint = Date.now();
                                if (currentCheckPoint - this.values.pIndexCheckPoint >= 7000) {
                                    if (!this.values.online) {
                                        this.offlineManager();
                                        return false;
                                    };
                                }
                            }, 7000);
                            this.countProdutTotalImages(this.values.cacheProducts[this.values.pIndex], this.values.force);
                            if (this.abort == false) this.productCache(this.values.cacheProducts[this.values.pIndex], this.values.force);
                        }
                    }
                }
                if (force == 2) {
                    this.cacheImage(url);
                }
            });
        }
        if (force == 1) {
            this.cacheImage(url);
        }
    }

    cacheImage(url) {
        this.values.productCashImageUrls.push(url);
        //cache if not already cached
        this.storage.get(url).then((data) => {
            if (data != null) {
                this.values.downloadQueue = this.values.downloadQueue - 1;
                if (this.values.downloadQueue < 0) this.values.downloadQueue = 0;

                let urlIndex = this.values.productCashImageUrls.indexOf(url);
                if(urlIndex >= 0) {
                    this.values.productCashImageUrls.splice(urlIndex, 1);
                }
                let longTimeUrlIndex = this.values.longTimeRequestUrls.indexOf(url);
                if(longTimeUrlIndex == -1) {
                    this.values.cacheIndex = this.values.cacheIndex + 1;
                }
                else {
                    this.values.longTimeRequestUrls.splice(longTimeUrlIndex, 1);
                }
                //if (this.values.cacheIndex >= this.values.numOfProdutTotalImages - 1) {
                if (this.values.cacheIndex >= this.values.numOfProdutTotalImages - 5) {
                    this.values.pIndex = this.values.pIndex + 1;
                    this.values.cacheIndex = 0;
                    this.values.longTimeRequestUrls = this.values.longTimeRequestUrls.concat(this.values.productCashImageUrls);
                    this.values.productCashImageUrls = [];

                    if (this.values.pIndex >= this.values.cacheProducts.length || this.values.cancel == true) {
                        if (this.values.cancel == false) {
                            if (this.c_mode == 3) {
                                this.delCindex(this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id)
                            }
                            else {
                                if (this.c_mode > 0) {
                                    this.addCindex(this.c_action, this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id, this.c_collection_total_bytes);
                                }
                            }
                        }
                        this.values.pIndex = 0;
                        this.consoleLog("this.values.longTimeRequestUrls", this.values.longTimeRequestUrls);
                        this.values.longTimeRequestUrls = [];
                        this.values.productCashImageUrls = [];
                        this.values.cancel = false;
                        this.values.pIndexCheckPoint = Date.now();
                        this.abort = true;
                    }
                    else {
                        this.values.pIndexCheckPoint = Date.now();
                        setTimeout(() => {
                            let currentCheckPoint = Date.now();
                            if (currentCheckPoint - this.values.pIndexCheckPoint >= 7000) {
                                if (!this.values.online) {
                                    this.offlineManager();
                                    return false;
                                };
                            }
                        }, 7000);
                        this.countProdutTotalImages(this.values.cacheProducts[this.values.pIndex], this.values.force);

                        if (this.abort == false) {
                            this.productCache(this.values.cacheProducts[this.values.pIndex], this.values.force);
                        }
                        else {
                            this.values.pIndex = 0;
                            this.values.longTimeRequestUrls = [];
                            this.values.productCashImageUrls = [];
                        }
                    }
                }
            }
            else {
                this.putImage(url).then(() => {
                    this.values.downloadQueue = this.values.downloadQueue - 1;
                    if (this.values.downloadQueue < 0) this.values.downloadQueue = 0;
                    //this.storage.get('user_profile')
                        
                    let urlIndex = this.values.productCashImageUrls.indexOf(url);
                    if(urlIndex != -1) {
                        this.values.productCashImageUrls.splice(urlIndex, 1);
                    }
                    let longTimeUrlIndex = this.values.longTimeRequestUrls.indexOf(url);
                    if(longTimeUrlIndex == -1) {
                        this.values.cacheIndex = this.values.cacheIndex + 1;
                    }
                    else {
                        this.values.longTimeRequestUrls.splice(longTimeUrlIndex, 1);
                    }

                    if (this.values.cacheIndex >= this.values.numOfProdutTotalImages - 5) {
                        this.values.pIndex = this.values.pIndex + 1;
                        this.values.cacheIndex = 0;
                        //this.values.numOfProdutTotalImages = 0;
                        this.values.longTimeRequestUrls = this.values.longTimeRequestUrls.concat(this.values.productCashImageUrls);
                        this.values.productCashImageUrls = [];

                        if (this.values.pIndex >= this.values.cacheProducts.length || this.values.cancel == true) {
                            if (this.values.cancel == false) {
                                if (this.c_mode == 3) {
                                    this.delCindex(this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id)
                                }
                                else {
                                    if (this.c_mode > 0) {
                                        this.addCindex(this.c_action, this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id, this.c_collection_total_bytes);
                                    }
                                }
                            }
                            else {
                                console.log("Downloading is canceled at the product number  :  " + this.values.pIndex);
                            }
                            this.values.pIndex = 0;
                            this.consoleLog("this.values.longTimeRequestUrls", this.values.longTimeRequestUrls);
                            this.values.longTimeRequestUrls = [];
                            this.values.productCashImageUrls = [];
                            this.values.cancel = false;
                            this.values.pIndexCheckPoint = Date.now();
                            this.abort = true;
                        }
                        else {
                            this.values.pIndexCheckPoint = Date.now();
                            setTimeout(() => {
                                let currentCheckPoint = Date.now();
                                if (currentCheckPoint - this.values.pIndexCheckPoint >= 7000) {
                                    if (!this.values.online) {
                                        this.offlineManager();
                                        return false;
                                    };
                                }
                            }, 7000);
                            this.countProdutTotalImages(this.values.cacheProducts[this.values.pIndex], this.values.force);

                            if (this.abort == false) {
                                this.productCache(this.values.cacheProducts[this.values.pIndex], this.values.force);
                            }
                            else {
                                this.values.pIndex = 0;
                                this.values.longTimeRequestUrls = [];
                                this.values.productCashImageUrls = [];
                            }
                        }
                    }
                }).catch((err) => {
                    this.consoleLog("image request error : " + url, err);
                    this.values.downloadQueue = this.values.downloadQueue - 1;
                    if (this.values.downloadQueue < 0) this.values.downloadQueue = 0;

                    let urlIndex = this.values.productCashImageUrls.indexOf(url);
                    if(urlIndex != -1) {
                        this.values.productCashImageUrls.splice(urlIndex, 1);
                    }
                    let longTimeUrlIndex = this.values.longTimeRequestUrls.indexOf(url);
                    if(longTimeUrlIndex == -1) {
                        this.values.cacheIndex = this.values.cacheIndex + 1;
                    }
                    else {
                        this.values.longTimeRequestUrls.splice(longTimeUrlIndex, 1);
                    }

                    if (this.values.cacheIndex >= this.values.numOfProdutTotalImages - 5) {
                        this.values.pIndex = this.values.pIndex + 1;
                        this.values.cacheIndex = 0;
                        //this.values.numOfProdutTotalImages = 0;
                        this.values.longTimeRequestUrls = this.values.longTimeRequestUrls.concat(this.values.productCashImageUrls);
                        this.values.productCashImageUrls = [];

                        if (this.values.pIndex >= this.values.cacheProducts.length || this.values.cancel == true) {
                            if (this.values.cancel == false) {
                                if (this.c_mode == 3) {
                                    this.delCindex(this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id)
                                }
                                else {
                                    if (this.c_mode > 0) {
                                        this.addCindex(this.c_action, this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id, this.c_collection_total_bytes);
                                    }
                                }
                            }
                            else {
                                console.log("Downloading is canceled at the product number  :  " + this.values.pIndex);
                            }
                            this.values.pIndex = 0;
                            this.consoleLog("this.values.longTimeRequestUrls", this.values.longTimeRequestUrls);
                            this.values.longTimeRequestUrls = [];
                            this.values.productCashImageUrls = [];
                            this.values.cancel = false;
                            this.values.pIndexCheckPoint = Date.now();
                            this.abort = true;
                        }
                        else {
                            this.values.pIndexCheckPoint = Date.now();
                            setTimeout(() => {
                                let currentCheckPoint = Date.now();
                                if (currentCheckPoint - this.values.pIndexCheckPoint >= 7000) {
                                    if (!this.values.online) {
                                        this.offlineManager();
                                        return false;
                                    };
                                }
                            }, 7000);
                            this.countProdutTotalImages(this.values.cacheProducts[this.values.pIndex], this.values.force);

                            if (this.abort == false) {
                                this.productCache(this.values.cacheProducts[this.values.pIndex], this.values.force);
                            }
                            else {
                                this.values.pIndex = 0;
                                this.values.longTimeRequestUrls = [];
                                this.values.productCashImageUrls = [];
                            }
                        }
                    }
                });
            }

        }).catch((err) => {
            console.log(err);
        });
    }



    //post image from URL into dB
    putImage(url) {
        return new Promise((resolve, reject) => {
            let headers = new Headers({
                "Content-Type": "application/blob"
            });
            /*
            let contentType = 'image/png';
            if(url.includes('.jpg')){
            contentType = 'image/jpeg'
            }
            */
            let options = new RequestOptions({
                headers: headers,
                responseType: ResponseContentType.Blob
            });
            this.http.get(url, options).subscribe(response => {
                let blob = new Blob([response.blob()]);
                //  image id
                let imageID = this.values.cacheImageID;
                this.values.cacheImageID = this.values.cacheImageID + 1;

                //  image type
                let suffix = '.jpg';
                let imageType = 'jpeg';
                if (url.indexOf('png')) {
                    suffix = '.png';
                    imageType = 'png';
                }
                // date 
                let d = new Date();
                let n = d.getTime();
                let filename = 'img_' + imageID + '_' + n + suffix;
                //file or dB storage for cache
                // if (this.platform.is('cordova!')) {
                //     this.getImageCordova(blob,filename,url).then((nr1) => {
                //         let nr = '';
                //         resolve(nr);
                //     })
                // }
                // else {
                //console.log('Image Cache Get Blob:'+url)
                this.getImage64(blob, filename, url, imageType).then((nr1) => {
                    let nr = '';
                    resolve(nr);
                })
                // }
            }, error => {
                console.log("404 error");
                console.log(error);
                reject(error);
            });
        });
    }

    getNumofOnescreenProcountImages(products, onescreen_products_num) {
        let totalImages: number = 0;
        let product: any;
        for (let pindex = 0; pindex <= onescreen_products_num; pindex++) {
            product = products[pindex];
            if (product.variants[0]) {
                if (product.variants[0].variant_images[0]) {
                    if (product.variants.length > 0) {
                        product.variants.forEach((variant) => {
                            if (variant.variant_images[0].variant_image) {
                                totalImages++;
                            }
                            if (variant.swatch.swatch_image) {
                                totalImages += 2;
                            }
                            if (variant.variant_images.length > 0) {
                                variant.variant_images.forEach((imageslide) => {
                                    if (imageslide.variant_image.length > 0) {
                                        totalImages += 2;
                                    }
                                    if (imageslide.variant_360) {
                                        for (let i = 1, len = imageslide.frame_count; i < len; i++) {
                                            totalImages++;
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            }
        }
        return totalImages;
    }

    getImageCordova(blob, filename, url) {
        return new Promise((resolve, reject) => {
            this.file.writeFile(this.values.fs + this.values.imageCacheFolder, filename, blob, true).then((nr1) => {
                let nr = '';
                resolve(nr);
                this.cacheIndex(url, filename)
            })
        })
    }

    getImage64(blob, filename, url, imageType) {
        //console.log('Get As Image 64:'+url)
        return new Promise((resolve, reject) => {
            let image64 = '';
            var myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
                image64 = myReader.result;
                let nr = '';
                //this.cacheIndex(url,'data:image/'+imageType+';base64,'+image64);
                this.cacheIndex(url, image64);
                resolve(nr);
            }
            myReader.readAsDataURL(blob);
        });
    }

    cacheIndex(url, filename) {
        this.storage.set(url, filename)
    }

    //fetch the blob from the dB; returns blob
    getImage(img_src) {
        //this.consolelog('Get image from Cache:'+img_src);
        return new Promise((resolve, reject) => {
            this.storage.get(img_src).then((data) => {
                //let image = JSON.parse(data);  
                resolve(data);
            }).catch(function (err) {
                //console.log(err);
                let idn = '../assets/images/tinyplaceholder.png';
                resolve(idn);
            });
            /*
            this.imageDB.getAttachment(img_src, 'file').then((image) => {
                //this.consolelog('Get from pouch:'+img_src)
                resolve(image);
            }).catch(function(err){
                //this.consolelog('Not found in cache'); //+img_src+' --> '+err);
                reject('Not found in cache');//+img_src+' --> '+err);
            })
            */
        });
    }

    getDownloads() {
        return new Promise((resolve, reject) => {
            this.values.downloadedCollections = []
            this.storage.get('collection_index').then((response) => {
                if (response != null) {
                    this.values.downloadedCollections = response.data;
                }
                let nv = '';
                resolve(nv);
            })
        });
    }


    //  manage caching a collection (cache index / log / get products / mode)

    cacheCollection(collection_id, designer_id, designer_title, collection_title, mode) {
        return new Promise((resolve, reject) => {
            console.log('Cache processing mode:' + mode + ' Collection ID:' + collection_id);
            //  set the specific collection with an offline property status
            this.values.downloadTarget = 0;
            this.values.downloadQueue = 0;
            this.values.cancel = false;
            //  mode logic
            //  mode
            //  0 = no cache
            //  1 = just try and cache
            //  2 = delete then cache
            //  3 = just delete     
            let abort = false;
            for (let cindex = 0, len = this.values.collections.length; cindex < len && !abort; cindex++) {
                if (this.values.collections[cindex].collection_id == collection_id) {
                    abort = true;
                    console.log('Set collection status');
                    this.values.collections[cindex].offline = 'Downloading';

                    //this.values.collections[cindex].designer = designer_title;
                    //this.values.collections[cindex].size = this.values.collections[cindex].app_total_bytes
                    //this.data.consolelog('3. Status set to "downloading" - updating collections obj for this designer')

                    let record_id = 'collections_' + designer_id;

                    //  log entry
                    //  0 = just get products
                    //  1 = just try and cache
                    //  2 = delete then cache
                    //  3 = just delete   
                    //  4 = update 
                    //  5 = update all images     
                    let action = '';
                    if (mode == 1) { action = 'Downloaded'; }
                    if (mode == 2) { action = 'Downloaded (all images)'; }
                    if (mode == 3) { action = 'Remove'; }
                    if (mode == 4) { action = 'Updated'; }
                    if (mode == 5) { action = 'Updated (all images)'; }
                    this.storeCollections(record_id, this.values.collections);
                    this.consolelog('7. Save Collection');
                    this.getProduct(collection_id, this.values.user_profile.device_token, this.values.user_profile.user_token, mode, 0).then((data) => {

                        this.c_collection_title = collection_title;
                        this.c_collection_id = collection_id;
                        this.c_designer_title = designer_title;
                        this.c_designer_id = designer_id;
                        this.c_mode = mode;
                        this.c_action = action;
                        this.c_collection_total_bytes = this.values.collections[cindex].app_total_bytes;

                        // //this.values.products = data;
                        // if (mode ==  3) {
                        //     this.delCindex(collection_title, collection_id, designer_title, designer_id)
                        // }
                        // else {
                        //     if (mode > 0) {
                        //         this.addCindex(action, collection_title, collection_id, designer_title, designer_id, this.values.collections[cindex].app_total_bytes);   
                        //     }
                        // }   
                        resolve('');
                    });
                }
            }
        });
    }

    // Collection Caching Index

    addCindex(action, collection_title, collection_id, designer_title, designer_id, sizebytes) {
        console.log('Add to cache index');
        let sizeMb = Math.round(parseInt(sizebytes) / 1024 / 1000);
        let entry_date = new Date();
        let index_entry = {
            'collection_id': collection_id, 'designer': designer_title, 'designer_id': designer_id, 'collection': collection_title,
            'download_date': entry_date, 'size': sizeMb
        };
        this.addDownlog(action, collection_title, collection_id, designer_title, designer_id);
        this.storage.get('collection_index').then((response) => {
            let cIndex = [];
            if (response != null) {
                let GcIndex = response.data;
                //console.log('Cache Index:'+JSON.stringify(cIndex));
                cIndex = this.removeCIndexItem(GcIndex, collection_id);
            }
            cIndex.push(index_entry);
            let newCindex = { 'data': cIndex }
            this.storage.set('collection_index', newCindex)
        })
    }

    delCindex(collection_title, collection_id, designer_title, designer_id) {
        console.log('Delete from cache pindex:' + collection_id);
        this.addDownlog('Remove', collection_title, collection_id, designer_title, designer_id);
        this.storage.get('collection_index').then((response) => {
            let cIndex = response.data;
            //remove collection_id from cIndex
            let cIndexData = this.removeCIndexItem(cIndex, collection_id);
            let newCindex = { 'data': cIndexData }
            //save collection index
            this.storage.set('collection_index', newCindex)

            //update collection offline property
            this.getCollections(designer_id, this.values.user_profile.device_token, this.values.user_profile.user_token, 0).then(response => {
                this.values.collections = response;
                let abort = false;
                console.log('Looking to delete:' + collection_id)
                for (let i = 0, len = this.values.collections.length; i < len && !abort; i++) {
                    if (this.values.collections[i].collection_id == collection_id) {
                        abort = true;
                        delete this.values.collections[i].offline
                        console.log('Offline property removed')
                    }
                }
                let record_id = 'collections_' + designer_id;
                this.storeCollections(record_id, this.values.collections)
            });
        });
    }

    removeCIndexItem(cIndex, collection_id) {
        //console.log('Remove '+collection_id+' from:'+JSON.stringify(cIndex));
        let abort = false;
        for (let i = 0, len = cIndex.length; i < len && !abort; i++) {
            console.log('Item:' + i);
            //console.log('Cache Index:'+JSON.stringify(cIndex[i]));
            if (cIndex[i].collection_id == collection_id) {
                abort = true;
                console.log('Removed')
                //console.log('Cache Index:'+JSON.stringify(cIndex));
                //remove it
                cIndex.splice(i, 1);
                return cIndex;
            }
        }
        return cIndex;
    }

    //  Log File

    addDownlog(action, collection_title, collection_id, designer_title, designer_id) {
        console.log('Add to log');
        let log_date = new Date();
        let log_entry = { 'action': action, 'collection_id': collection_id, 'designer': designer_title, 'designer_id': designer_id, 'collection': collection_title, 'date': log_date }
        this.storage.get('download_log').then((response) => {
            let ulog = [];
            if (response != null) {
                console.log('Updating existing log')
                ulog = response.data;
            }
            ulog.push(log_entry);
            let newdlog = { 'data': ulog }
            this.storage.set('download_log', newdlog);
            console.log('Log saved')
            this.dlog = ulog
            if (this.selectedCollection.collection_id == collection_id) {
                this.selectedCollection.offline = action;
            }
            //console.log(JSON.stringify(this.dlog))
        });
    }

    //  get a single collection profile

    filterCollections(collection_id) {
        this.values.search = '';
        return this.values.collections.filter((collection) => {
            return collection.collection_id == collection_id;
        });
    }

    //  set default collection on collection page on first entry

    setThisCollection() {
        if (this.designer.hasOwnProperty("currentCollectionID")) {
            return this.designer.currentCollectionID;
        }
        else {
            this.designer.currentCollectionID = this.values.collections[0].collection_id
            return this.designer.currentCollectionID;
        }
    }

    getRetailers(device_token, user_token) {
        return new Promise((resolve, reject) => {
            if (!this.values.online) {
                this.offlineManager();
                reject(null);
            };
            this.consolelog('Get All Retailers');
            let gPapiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22retail_buyers%22,%22request%22:{%22device_token%22:%22" + device_token + "%22,%22user_token%22:%22" + user_token + "%22}}";
            //this.http.get(apiSource).map(res => res.json()).subscribe(data => {
            this.http.get(gPapiSource).map(res => res.json()).subscribe(data => {
                this.consolelog('Got retailers');
                resolve(data.result);
            })
        });
    }

    getShippings(device_token, user_token, buyer_id) {
        return new Promise((resolve, reject) => {
            if (!this.values.online) {
                this.offlineManager();
                reject(null);
            };
            this.consolelog('Get Shipping Addresses');
            let gPapiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22shipping%22,%22request%22:{%22device_token%22:%22" + device_token + "%22,%22user_token%22:%22" + user_token + "%22,%22buyer_id%22:%22" + buyer_id + "%22}}";
            this.consoleLog("shipping_api", gPapiSource);
            this.http.get(gPapiSource).map(res => res.json()).subscribe(data => {
                this.consolelog('Got Shipping Addresses');
                this.consoleLog("shipping_api response", data.result);
                resolve(data.result);
            })
        });
    }

    getDesignerCurrency(region_id, designer_id) {

        this.consolelog('Getting currency profile for Region ID:' + region_id + ' Designer ID:' + designer_id)
        //this.consolelog(JSON.stringify(this.values.designers));
        //if design_id then look up the designer
        if ((designer_id > 0) && (this.values.designers)) {
            let abort = false;
            for (let i = 0, len = this.values.designers.length; i < len && !abort; i++) {
                if (this.values.designers[i].seller_account_id == designer_id) {
                    this.designer = this.values.designers[i];
                    abort = true;
                    this.consolelog('Design profile set for currency:' + designer_id)
                }
            }
        }
        else {
            this.designer = this.values.designer;
        }
        //this.consolelog('Designer profile:'+JSON.stringify(this.data.designer));
        //find region in designer
        console.log('Set currency')
        let abort = false;
        for (let i = 0, len = this.values.designer.region_currency.length; i < len && !abort; i++) {
            if (this.values.designer.region_currency[i].region_id == region_id) {
                abort = true;
                this.consolelog('Currency code:' + this.values.designer.region_currency[i].currency_code);
                this.consolelog('Currency symbol:' + this.values.designer.region_currency[i].currency_symbol);
                this.designer.buyer_code = this.values.designer.region_currency[i].currency_code;
                this.designer.buyer_symbol = this.values.designer.region_currency[i].currency_symbol;
            }
            else {
                console.log('Skip')
            }
        }
        //set currency string  
    }

    //get countries list from server for the select the country of door address form.
    getCountries() {
        this.storage.get('countries').then((response) => {
            let country_count = 0;
            if (response != null) {
                country_count = response.length;
                this.values.countries = response;
                console.log("Countries are already stored in the local storage.");
            }
            let apiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22countries%22,%22request%22:{%22device_token%22:%22" +
            this.values.user_profile.device_token + "%22,%22user_token%22:%22" + this.values.user_profile.user_token + "%22,%22country_count%22:%22" + country_count + "%22}}";
            this.consolelog(apiSource);
            this.http.get(apiSource).map(res => res.json()).subscribe(data => {
                this.consolelog('Got All Countries from API');
                this.consoleLog("Countries", data);
                if (data.result.length > 0) {
                    this.storage.set('countries', data.result);
                    this.values.countries = data.result;
                }
            })
        });
    }

    //activity logs process functions
    initActivityLogs() {
        this.storage.get('activity_logs').then((response) => {
            if (response != null) {
                this.values.activity_logs = {
                    "action": "post_log",
                    "request": {
                        "device_token": this.values.user_profile.device_token,
                        "user_token": this.values.user_profile.user_token,
                        "log": response
                    }
                };
            }
            else {
                this.values.activity_logs = {
                    "action": "post_log",
                    "request": {
                        "device_token": this.values.user_profile.device_token,
                        "user_token": this.values.user_profile.user_token,
                        "log": []
                    }
                };
            }
        });
        
        this.consoleLog('activity_logs', this.values.activity_logs);
        
    }

    emptyActivityLogs() {
        this.values.activity_logs = {
            "action": "post_log",
            "request": {
                "device_token": this.values.user_profile.device_token,
                "user_token": this.values.user_profile.user_token,
                "log": []
            }
        };
        this.storage.set('activity_logs', this.values.activity_logs.request.log);
    }

    activityLogPost(activity_type, designer_id, collection_id, product_id, variant_id) {
        let activity_log = {
            "activity_type": activity_type,
            "designer_id": designer_id,
            "user_id": this.values.user_profile.user_id,
            "buyer_id": this.values.user_profile.buyer_id,
             
            "collection_id": collection_id,
            "product_id": product_id,
            "variant_id": variant_id,
            "activity_unixdate": Date.now()
        };

        this.consoleLog('activity_log', activity_log);

        this.values.activity_logs.request.log.push(activity_log);

        this.storage.set('activity_logs', this.values.activity_logs.request.log);
        this.consoleLog('activity_logs', this.values.activity_logs);

        if (this.values.online) {
            let apiURL = this.values.APIRoot + "/app/api.php";  
            let data = encodeURIComponent(JSON.stringify(this.values.activity_logs));
            let headers = new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
            });
            let options = new RequestOptions({
                headers: headers
            });
            // TODO: Encode the values using encodeURIComponent().
            let body = 'json=' + data
            this.http.post(apiURL, body, options)
                .map(res => res.json())
                .subscribe(response => {
                    this.consoleLog('Response:', response);
                    if(response.status == 'ok') {
                        this.emptyActivityLogs();
                    }
                });
        }
    }


    //Loading Spinner process functions
    createLoader() {
        this.loading = this.loadingCtrl.create({
            dismissOnPageChange: false,
            spinner: 'crescent',
            content: `
                    <div id="loading" class="loading_container">
                    <div class="loading_spinner"></div>
                    </div>`
        });
    }

    presentLoadingSpiner() {
        console.log(this.loadingState);
        if (this.loadingState == true) return;
        this.loading.present().then(() => {
            console.log("presented");
            this.loadingState = true;
        }).catch(function (err) {
            console.log(err);
        });
    }

    dismissLoadingSpiner() {
        console.log("this.loadingState :" + this.loadingState);
        if (this.loadingState == false) {
            this.isloadingState = true;
            return;
        }
        console.log("Spinner_dismiss() function are called");
        this.loading.dismiss().then(() => {
            console.log("Spinner are dismissed perfectly.");
            this.loadingState = false;
            this.isloadingState = false;
            this.values.onescreen_image_index = 0;
            this.values.onescreen_total_imgages_num = 0;
            this.createLoader();
        }).catch(function (err) {
            console.log(err);
        });
    }

    presentLoadingSpinerSec() {
        return new Promise((resolve, reject) => {
            console.log(this.loadingState);
            if (this.loadingState == true) return;
            this.loading.present().then(() => {
                console.log("presented");
                this.loadingState = true;
                this.values.spinnerCheckPoint = Date.now();
                if (this.values.isHeavyLoad == true) {
                    setTimeout(() => {
                        let currentCheckPoint = Date.now();
                        if (this.loadingState == true && currentCheckPoint - this.values.spinnerCheckPoint >= 35000) {
                            this.dismissLoadingSpiner();
                            let alert = this.alertCtrl.create({
                                title: 'WARNING: Internet connect problem.',
                                subTitle: 'Please check your internet connectivity and try again.',
                                buttons: [
                                    {
                                        text: 'OK',
                                        handler: () => {
                                            console.log('Network is too bad.');
                                        }
                                    }
                                ]
                            });
                            alert.present();
                        }
                    }, 35000);
                    this.values.isHeavyLoad = false;
                }
                else {
                    setTimeout(() => {
                        let currentCheckPoint = Date.now();
                        if (this.loadingState == true && currentCheckPoint - this.values.spinnerCheckPoint >= 20000) {
                            this.dismissLoadingSpiner();
                            let alert = this.alertCtrl.create({
                                title: 'WARNING: Internet connect problem.',
                                subTitle: 'Please check your internet connectivity and try again.',
                                buttons: [
                                    {
                                        text: 'OK',
                                        handler: () => {
                                            console.log('Downloading is too Slow.');
                                        }
                                    }
                                ]
                            });
                            alert.present();
                        }
                    }, 20000);
                }
                resolve();
            }).catch(function (err) {
                console.log(err);
                reject();
            });
        });
    }

    consolelog(str) {
        if (this.values.debug) {
            console.log('LOG:' + str);
        }
    }

    consoleLog(str1, str2) {
        if (this.values.debug) {
            console.log('//------- ' + str1 + ' -------//');
            console.log(str2);
        }
    }

    isOpenedCollection(designer_id) {
        if (this.values.designers == undefined) return false;
        for (let cindex = 0, len = this.values.designers.length; cindex < len; cindex++) {
            if (this.values.designers[cindex].seller_account_id == designer_id) return true;
        }
        return false;
    }

    addIsOpenedProp() {
        for (let cindex = 0, len = this.values.downloadedCollections.length; cindex < len; cindex++) {
            let isOpenedCollection = this.isOpenedCollection(this.values.downloadedCollections[cindex].designer_id);
            this.values.downloadedCollections[cindex].isOpenedCollection = isOpenedCollection;
        }
        //let newCindex = {'data':this.values.downloadedCollections}
        //this.storage.set('collection_index', newCindex)
    }
    /*
    getBuyers(retailer_id,device_token,user_token){

    this.consolelog('Get Retailers');
    let gPapiSource = this.APIRoot + "/app/api.php?json={%22action%22:%22retail_buyers%22,%22request%22:{%22device_token%22:%22"+device_token+"%22,%22user_token%22:%22"+user_token+"%22,%22retailer_id%22:"+retailer_id+"}}";
    return this.http.get(gPapiSource).map(res => res.json());
                
    }
    */
}

// (c) Copyright 2016-2017 Netambition Pty Ltd