import { Injectable } from '@angular/core';
import { Platform, AlertController, LoadingController, Events } from '@ionic/angular';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { fromEvent } from 'rxjs';
import { Values } from './values.service';
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { Network } from '@ionic-native/network/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import PouchDB from 'pouchdb';
import 'rxjs/Rx';
import { map } from 'rxjs/operators';
import { concat } from 'rxjs';
import { async } from 'rxjs/internal/scheduler/async';

declare var cordova;

@Injectable({
    providedIn: 'root'
})
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


    isDevice: boolean = false;
    sqliteDB: any;
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

    //  download management CindexCollection
    c_collection_title: string;
    c_collection_id: any;
    c_designer_title: string;
    c_designer_id: any;
    c_mode: number;
    c_action: string;
    c_collection_total_bytes: any;

    //collections download variables
    d_collections_all: boolean = false;
    d_collection_index: number = 0;


    constructor(
        private file: File,
        public storage: Storage,
        public loadingCtrl: LoadingController,
        public http: HttpClient,
        public platform: Platform,
        public values: Values,
        private alertCtrl: AlertController,
        public events: Events,
        private network: Network,
        private sqlite: SQLite) {

        setTimeout(() => {
            this.initDB();
        }, 3000);
        // this.createLoader();
    }

    initDB() {

        return new Promise((resolve, reject) => {
            this.platform.ready()
                .then(() => {
                    this.storage.ready().then(() => {

                        this.dbDraft = new PouchDB('ordreDraft01');
                        this.dbRequest = new PouchDB('ordreRequested01');
                        this.storage.get('cacheImageID').then((data) => {
                            if (data != null) {
                                this.values.cacheImageID = data
                            }
                            else {
                                this.values.cacheImageID = 0
                            }
                        });
                        if (this.platform.is('cordova')) {
                            this.isDevice = true;
                            this.sqlite.create({
                                name: 'data.db',
                                location: 'default'
                            }).then((sqliteDB: SQLiteObject) => {
                                this.sqliteDB = sqliteDB;
                                const query = 'CREATE TABLE IF NOT EXISTS images ( id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, img_data TEXT )';
                                this.sqliteDB.executeSql(query, []).then(() => {
                                }).catch(e => console.log(e));
                            }).catch(e => console.log(e));

                            this.values.online = this.network.type !== 'none';

                            this.network.onDisconnect().subscribe(() => {
                                this.values.online = false;
                            });
                            this.network.onConnect().subscribe(() => {
                                this.values.online = true;
                            });
                        } else {
                            this.values.online = navigator.onLine;
                            fromEvent(window, "offline").subscribe(
                                () => {
                                    this.values.online = false;
                                }
                            );
                            fromEvent(window, "online").subscribe(
                                () => {
                                    this.values.online = true;
                                }
                            );
                        }

                        //check cache storage (file or dB)
                        // if (this.platform.is('cordova')) {

                        //     this.values.fs = cordova.file.dataDirectory;
                        //     this.file.checkDir(this.values.fs, this.values.imageCacheFolder).then(() => { }).catch(err => {
                        //         this.file.createDir(this.values.fs, this.values.imageCacheFolder, true)
                        //     });
                        //     this.values.freeSpace = this.file.getFreeDiskSpace()
                        //     //this.storage.clear();
                        // }
                        // else {
                        //     //dev so clear it about
                        //     //this.storage.clear();
                        // }

                        //persist user
                        this.getUser().then(data => {
                            if (data != null) {
                                this.values.user_profile = data;
                            }
                            resolve(data);
                        })

                    });
                    this.loadingCtrl.create({
                        duration: 5000,
                    });
                });
        });
    }

    async offlineManager() {

        if (!this.values.online) {
            this.dismissLoadingSpiner();
            let alert = await this.alertCtrl.create({
                header: 'No Internet connection found.',
                subHeader: 'Check your connection',
                buttons: [
                    {
                        text: 'OK',
                        handler: () => {
                            // this.dismissLoadingSpiner();
                        }
                    }
                ]
            });
            await alert.present();
        }

    }
    // login method for kinetic API
    
    login(credentials, device_token) {
        let email = credentials.user_email
        //let password = encodeURIComponent(credentials.user_password);
        
        let password = credentials.user_password;
        return new Promise((resolve, reject) => {
            if (!this.values.online) {
                this.offlineManager();
                reject(null);
            };

            let apiSource = this.values.APIRoot + "/app/auth.php?json={%22action%22:%22login_user%22,%22request%22:{%22email%22:%22" + email + "%22,%22pass%22:%22" + password + "%22}}";
            this.http.get(apiSource, {
                observe: 'response',
                responseType: 'json'
            }).subscribe(res => {
                    resolve(res);
                }, err => {
                    reject(err);
                }
            );
        });
    }

    //  user profiles

    saveUser(profile) {
        return new Promise((resolve, reject) => {
            this.deleteItem('user_profile').then(() => {
                profile._id = 'user_profile';
                resolve(this.storage.set('user_profile', profile));
            });
        });
    }


    getUser() {
        return new Promise((resolve, reject) => {
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
            }
        })
    }

    //  orders and drafts 

    saveOrder(order) {
        //draft._id = id;
        delete order._id;
        delete order._rev;
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
        return this.dbDraft.allDocs({ include_docs: true })
            .then(docs => {
                this.draftOrders = docs.rows.map(row => {
                    if (seller_id > 0) {
                        if ((row.doc.seller_account_id === seller_id) && (row.doc.buyer_id === buyer_id)) {
                            row.doc.Date = new Date(row.doc.Date);
                            return row.doc;
                        } else {
                            return false;
                        }
                    } else {
                        if (row.doc.buyer_id === buyer_id) {
                            row.doc.Date = new Date(row.doc.Date);
                            return row.doc;
                        } else {
                            return false;
                        }
                    }
                });

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
            this.dbDraft.remove(doc).catch(function (err) {
                this.consolelog(err);
                return Promise.resolve(null);
            });
        });
    }

    getAllOrders(buyer_id, seller_id) {

        return this.dbRequest.allDocs({ include_docs: true })
            .then(docs => {

                this.requestedOrders = docs.rows.map(row => {
                    // Dates are not automatically converted from a string.
                    if (seller_id > 0) {
                        if ((row.doc.seller_account_id === seller_id) && (row.doc.buyer_id === buyer_id)) {
                            row.doc.Date = new Date(row.doc.Date);
                            return row.doc;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        if (row.doc.buyer_id === buyer_id) {
                            row.doc.Date = new Date(row.doc.Date);
                            return row.doc;
                        }
                        else {
                            return false;
                        }
                    }
                });
                return this.requestedOrders;
            });
    }

    updateOldOrders() {
        this.storage.get('updated_flag').then((result) => {
            if (result === true) {
                console.log("You have already updated your old Orders.");
            } else {
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
                }).then(() => {
                    for (let cindex = 0, len = this.oldDraftOrders.length; cindex < len; cindex++) {
                        this.dbDraft.get(this.oldDraftOrders[cindex]._id).then((doc) => {
                            if (doc.status ===  "DRAFT") doc.status = "SERVER_DRAFT";
                            if (doc.status ===  "REQUEST") doc.status = "LOCAL_DRAFT";
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
                }).then(() => {
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
        let ONE_MONTH = 60 * 60 * 1000 * 24 * 30;
        let baseDate = new Date('01/01/1980');
        let nowDate = Date.now();

        if ((this.values.online) && ((this.values.designers_checkpoint.getTime() === baseDate.getTime()) ||
            (nowDate - ONE_MONTH > this.values.designers_checkpoint.getTime()))) {
            force = true;
            checkpoint = true;
        }

        //  check for designers in db

        let record_id = 'designers'
        let record_id_get = record_id;
        if (force === true) {
            record_id_get = 'NOPEA1';
        }

        return new Promise((resolve, reject) => {
            this.storage.get(record_id_get).then((result) => {

                if (result != null) {
                    let pdata = JSON.parse(result)
                    this.values.designers = null;
                    resolve(pdata.data);
                    return false;
                    //this.loading.dismiss().catch(() => {});
                }
                if (!this.values.online) {
                    this.offlineManager();
                    //this.loading.dismiss().catch((err) => {console.log('Problem with spinner:'+err)});
                    return false;
                };

                if ((checkpoint === true || force === true || result === null) && (this.values.online)) {
                    let apiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22designers%22,%22request%22:{%22device_token%22:%22" +
                        device_token + "%22,%22user_token%22:%22" + user_token + "%22,%22checkpoint%22:%22" + (baseDate.getTime() / 1000) + "%22}}";
                    this.http.get(apiSource).subscribe((data) => {
                        let gotdata = data['result'];
                        resolve( data['result']);
                        this.values.designers_checkpoint = new Date();
                        this.storeDesigners = { '_id': record_id, data: gotdata };

                        this.storage.set(record_id, JSON.stringify(this.storeDesigners)).then((new_ID) => {
                        }).catch(function (err) {
                            console.log(err);
                        });
                    });
                }
            })
        });
    }

    getTheseDesigners() {
        let force = false;
        if (this.values.isDesignersPage == true) {
            force = true;
            this.getDesigners(this.values.device_token, this.values.user_profile.user_token, force).then((response) => {
                this.values.designers = response;
                this.values.onescreen_total_imgages_num = this.values.designers.length;
                for (let index = 0; index < this.values.designers.length; index++) {
                    let designer_id = this.values.designers[index].seller_account_id;
                    this.values.designer_checkpoints[designer_id] = new Date('01/01/1980').getTime();
                }
                this.values.collection_checkpoints = [];
            }).catch(function (err) {
                console.log(err);
            });
        } else {
            this.getDesigners(this.values.device_token, this.values.user_profile.user_token, force).then((response) => {
                this.values.designers = response;
                this.values.onescreen_total_imgages_num = this.values.designers.length;
                this.values.isDesignersPage = true;
            }).catch(function (err) {
                console.log(err);
            });
        }
    }

    // all collections for the selected designer

    getThisCollections(designer_id, device_token, user_token, update_mode = true) {
        return new Promise((resolve, reject) => {
            
            this.getCollections(designer_id, device_token, user_token).then((collections: any) => {
                if (update_mode) this.values.collections = collections;

                this.storage.get('download_log').then((response) => {
                    if (response != null) {
                        let ulog = response.data;
                        for (let i = 0, len = ulog.length; i < len; i++) {
                            for (let j = 0, len = collections.length; j < len; j++) {
                                if (ulog[i].collection_id === collections[j].collection_id) {
                                    //set collection status
                                    collections[j].offline = ulog[i].action;
                                    collections[j].download_date = ulog[i].date;
                                }
                            }
                        }
                    }
                    if (this.values.hasOwnProperty('collections')) {
                        //current collection ID
                        this.currentCollectionID = this.setThisCollection();
    
                        this.selectedCollection = this.filterCollections(this.currentCollectionID)[0];
                    }
                    resolve(collections);
                }).catch((err) => {
                    console.log(err);
                    resolve(collections);
                });
            }).catch(function (err) {
                reject(err);
            });
        });
    }

    getCollections(designer_id, device_token, user_token) {

        let force = false;

        let ONE_MONTH = 60 * 60 * 1000 * 24 * 30;
        let baseTime = new Date('01/01/1980').getTime();
        let currentTime = new Date().getTime();
        if (!this.values.designer_checkpoints[designer_id]) {
            this.values.designer_checkpoints[designer_id] = new Date('01/01/1980').getTime();
        }

        if (this.values.online && currentTime - ONE_MONTH > this.values.designer_checkpoints[designer_id]) {
            force = true;
        }
        //  check for designers in pouch
        let record_id = 'collections_' + designer_id;
        let record_id_get = record_id;
        if (force === true) { record_id_get = 'NOPEA' }

        return new Promise((resolve, reject) => {
            this.storage.get(record_id_get).then((result) => {
                if (result !== null) {
                    let pdata = JSON.parse(result);
                    // this.storage.get('download_log').then((response) => {
                    //     if (response != null) {
                    //         let ulog = response.data;
                    //         for (let i = 0, len = ulog.length; i < len; i++) {
                    //             for (let j = 0, len = this.values.collections.length; j < len; j++) {
                    //                 if (ulog[i].collection_id === this.values.collections[j].collection_id) {
                    //                     //set collection status
                    //                     this.values.collections[j].offline = 'Downloaded'
                    //                 }
                    //             }
                    //         }
                    //     }
                    // });
                    resolve(pdata.data);
                } else {
                    if (!this.values.online) {
                        this.offlineManager();
                        reject(null);
                    } else {
                        let apiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22collections_short%22,%22request%22:{%22device_token%22:%22" + device_token + "%22,%22user_token%22:%22" + user_token + "%22,%22checkpoint%22:%22" + (baseTime / 1000) + "%22,%22seller_account_id%22:" + designer_id + "}}";
                        this.http.get(apiSource).subscribe(data => {
                            resolve(data['result']);
                            this.values.designer_checkpoints[designer_id] = new Date().getTime();
                            this.storeCollections(record_id, data['result']);

                            //  set download status based on collection download index
                            // this.storage.get('download_log').then((response) => {
                            //     if (response != null) {
                            //         let ulog = response.data;
                            //         for (let i = 0, len = ulog.length; i < len; i++) {
                            //             for (let j = 0, len = this.values.collections.length; j < len; j++) {
                            //                 if (ulog[i].collection_id === this.values.collections[j].collection_id) {
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
            }).catch(function (err) {
                console.log(err);
                let idn = '';
                resolve(idn);
            })
        });
    }

    //  stores collection list for a designer, record_id = 'collections_' + designer_id

    storeCollections(record_id, data) {
        let storeCollection = { '_id': record_id, data: data };
        this.storage.set(record_id, JSON.stringify(storeCollection));
    }

    deleteItem(id) {
        return new Promise((resolve, reject) => {
            this.storage.remove(id).then((data) => {
                let idn = '';
                resolve(idn);
            }).catch(function (err) {
                console.log(err);
                let idn = '';
                resolve(idn);
            });
        });
    };


    getProduct(collection_id, device_token, user_token, mode, update_mode = true) {

        let force = false;

        let ONE_MONTH = 60 * 60 * 1000 * 24 * 30;
        let currentTime = new Date().getTime();
        if (!this.values.collection_checkpoints[collection_id]) {
            this.values.collection_checkpoints[collection_id] = new Date('01/01/1980').getTime();
        }

        if (this.values.online && currentTime - ONE_MONTH > this.values.collection_checkpoints[collection_id]) {
            force = true;
        }

        if (mode === 4) mode = 1;
        if (mode === 5) mode = 2;

        let record_id = 'products_' + collection_id;
        let record_id_get = record_id;
        if (force === true || mode === 1) record_id_get = 'NOPEA';

        return new Promise((resolve, reject) => {
            this.storage.get(record_id_get).then((result) => {
                if (result != null) {
                    let pdata = JSON.parse(result);
                    if (update_mode) this.values.products = pdata.data;
                    resolve(pdata.data);
                    if (mode > 0) {
                        this.productsCache(pdata.data, mode);
                    }
                } else {
                    if (!this.values.online) {
                        this.offlineManager();
                        reject(null);
                    } else {
                        let apiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22collection_products%22,%22request%22:{%22device_token%22:%22" + device_token + "%22,%22user_token%22:%22" + user_token + "%22,%22collection_id%22:" + collection_id + "}}";
                        this.http.get(apiSource).subscribe(productData => {
                            if (update_mode) this.values.products = productData['result'];
                            resolve(productData['result']);
                            this.values.collection_checkpoints[collection_id] = new Date().getTime();

                            this.deleteItem(record_id).then(() => {
                                let storeProducts = { '_id': record_id, data: productData['result'] };
                                let newData = JSON.stringify(storeProducts);
                                this.storage.set(record_id, newData).then(() => {
                                    if (productData['result'].length > 0 && mode > 0) {
                                        this.productsCache(productData['result'], mode);
                                    }
                                }).catch((err) => {
                                    console.log(err);
                                    let idn = '';
                                    resolve(idn);
                                });
                            });
                        }, error => {
                            console.log(error);
                            reject(null);
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
        //  mode
        //  1 = just try and cache
        //  2 = delete then cache
        //  3 = just delete
        //products.forEach((product, pindex) => {
        let product: any;
        for (let pindex = 0; pindex < products.length; pindex++) {
            //for (let pindex = 0; pindex < 3; pindex++) {
            product = products[pindex];
            this.values.debug = 'Processing products';
            if (product.variants[0]) {
                //  cache the main product image and slider images
                if (product.variants[0].variant_images[0]) {
                    //if(product.variants[0].variant_images[0].variant_image){
                    //.variant_images[0].variant_image+'&w=342&h=509')
                    //this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'+product.variants[0].variant_images[0]
                    //.variant_image+'&w=342&h=509&xtype=prodimage');
                    //}
                    if (product.variants.length > 0 && this.values.cancel === false) {
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
                            if (variant.swatch.swatch_image && this.values.cancel === false) {
                                this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + variant.swatch.swatch_image
                                    + '&w=20&h=20&xtype=prodimage', force);
                                this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + variant.swatch.swatch_image
                                    + '&w=100&h=100&xtype=prodimage', force);
                            }
                            if (variant.variant_images.length > 0 && this.values.cancel === false) {
                                variant.variant_images.forEach((imageslide) => {
                                    //  360 left nav
                                    //if(imageslide.hasOwnProperty('variant_360')){
                                    //  this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'+imageslide.variant_360+'img01
                                    //  .jpg&w=683&h=957&zc=3',force);  
                                    //}
                                    //  variant images
                                    if ((imageslide.variant_image.length > 0) && (this.values.cancel === false)) {
                                        //  item?
                                        this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + imageslide.variant_image +
                                            '&w=683&h=980&zc=2&xtype=prodimage', force);
                                        //  linesheet
                                        this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/' + imageslide.variant_image +
                                            '&w=110&h=165&xtype=prodimage', force);
                                    }
                                    //  cache 360 frames                                 
                                    if (imageslide.variant_360 && this.values.cancel === false) {
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
                        }
                    }
                }
            }
        }
    }

    productsCache(products, force) {
        this.abort = false;
        this.values.cacheProducts = products;
        this.countDownloadTarget(products, force);
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
            this.deleteItem(url).then(() => {
                if (force === 3) {
                    this.values.downloadQueue = this.values.downloadQueue - 1;
                    if (this.values.downloadQueue < 0) this.values.downloadQueue = 0;

                    this.values.cacheIndex = this.values.cacheIndex + 1;
                    if (this.values.cacheIndex >= this.values.numOfProdutTotalImages) {
                        this.values.pIndex = this.values.pIndex + 1;
                        this.values.cacheIndex = 0;
                        if (this.values.pIndex >= this.values.cacheProducts.length || this.values.cancel === true) {
                            if (this.values.cancel === false) {
                                if (this.c_mode === 3) {
                                    this.delCindex(this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id);
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
                            if (this.abort === false) this.productCache(this.values.cacheProducts[this.values.pIndex], this.values.force);
                        }
                    }
                }
                if (force === 2) {
                    this.cacheImage(url);
                }
            });
        }
        if (force === 1) {
            this.cacheImage(url);
        }
    }

    cacheImage(url) {
        this.values.productCashImageUrls.push(url);
        //cache if not already cached
        this.getImage(url).then((data) => {
            if (data != null) {
                this.values.downloadQueue = this.values.downloadQueue - 1;
                if (this.values.downloadQueue === 0) {
                    if (this.c_mode > 0) {
                        this.addCindex(this.c_action, this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id, this.c_collection_total_bytes);
                    }
                    if (this.d_collections_all) {
                        this.events.publish("collection-download");
                    }
                } else if (this.values.downloadQueue < 0) {
                    this.values.downloadQueue = 0;
                }

                let urlIndex = this.values.productCashImageUrls.indexOf(url);
                if(urlIndex >= 0) {
                    this.values.productCashImageUrls.splice(urlIndex, 1);
                }
                let longTimeUrlIndex = this.values.longTimeRequestUrls.indexOf(url);
                if(longTimeUrlIndex === -1) {
                    this.values.cacheIndex = this.values.cacheIndex + 1;
                } else {
                    this.values.longTimeRequestUrls.splice(longTimeUrlIndex, 1);
                }
                //if (this.values.cacheIndex >= this.values.numOfProdutTotalImages - 1) {
                if (this.values.cacheIndex >= this.values.numOfProdutTotalImages - 5) {
                    this.values.pIndex = this.values.pIndex + 1;
                    this.values.cacheIndex = 0;
                    this.values.longTimeRequestUrls = this.values.longTimeRequestUrls.concat(this.values.productCashImageUrls);
                    this.values.productCashImageUrls = [];

                    if (this.values.pIndex >= this.values.cacheProducts.length || this.values.cancel === true) {
                        if (!this.d_collections_all && !this.values.cancel) {
                            if (this.c_mode === 3) {
                                this.delCindex(this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id)
                            }
                        }
                        this.values.pIndex = 0;
                        this.values.longTimeRequestUrls = [];
                        this.values.productCashImageUrls = [];
                        this.values.pIndexCheckPoint = Date.now();
                        this.abort = true;
                        this.values.cancel = false;
                    } else {
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

                        if (this.abort === false) {
                            this.productCache(this.values.cacheProducts[this.values.pIndex], this.values.force);
                        }
                        else {
                            this.values.pIndex = 0;
                            this.values.longTimeRequestUrls = [];
                            this.values.productCashImageUrls = [];
                        }
                    }
                }
            } else {
                this.putImage(url).then(() => {
                    this.values.downloadQueue = this.values.downloadQueue - 1;
                    if (this.values.downloadQueue === 0) {
                        if (this.c_mode > 0) {
                            this.addCindex(this.c_action, this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id, this.c_collection_total_bytes);
                        }
                        if (this.d_collections_all) {
                            this.events.publish("collection-download");
                        }
                    } else if (this.values.downloadQueue < 0) {
                        this.values.downloadQueue = 0;
                    }
                        
                    let urlIndex = this.values.productCashImageUrls.indexOf(url);
                    if(urlIndex != -1) {
                        this.values.productCashImageUrls.splice(urlIndex, 1);
                    }
                    let longTimeUrlIndex = this.values.longTimeRequestUrls.indexOf(url);
                    if(longTimeUrlIndex === -1) {
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

                        if (this.values.pIndex >= this.values.cacheProducts.length || this.values.cancel === true) {
                            if (!this.d_collections_all && this.values.cancel === false) {
                                if (this.c_mode === 3) {
                                    this.delCindex(this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id)
                                }
                            }
                            this.values.pIndex = 0;
                            this.values.longTimeRequestUrls = [];
                            this.values.productCashImageUrls = [];
                            this.values.pIndexCheckPoint = Date.now();
                            this.abort = true;
                            this.values.cancel = false;
                        } else {
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

                            if (this.abort === false) {
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
                    this.values.downloadQueue = this.values.downloadQueue - 1;
                    if (this.values.downloadQueue === 0) {
                        if (this.c_mode > 0) {
                            this.addCindex(this.c_action, this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id, this.c_collection_total_bytes);
                        }
                        if (this.d_collections_all) {
                            this.events.publish("collection-download");
                        }
                    } else if (this.values.downloadQueue < 0) {
                        this.values.downloadQueue = 0;
                    }

                    let urlIndex = this.values.productCashImageUrls.indexOf(url);
                    if(urlIndex != -1) {
                        this.values.productCashImageUrls.splice(urlIndex, 1);
                    }
                    let longTimeUrlIndex = this.values.longTimeRequestUrls.indexOf(url);
                    if(longTimeUrlIndex === -1) {
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

                        if (this.values.pIndex >= this.values.cacheProducts.length || this.values.cancel === true) {
                            if (!this.d_collections_all && this.values.cancel === false) {
                                if (this.c_mode === 3) {
                                    this.delCindex(this.c_collection_title, this.c_collection_id, this.c_designer_title, this.c_designer_id)
                                }
                            }
                            this.values.pIndex = 0;
                            this.values.longTimeRequestUrls = [];
                            this.values.productCashImageUrls = [];
                            this.values.pIndexCheckPoint = Date.now();
                            this.abort = true;
                            this.values.cancel = false;
                        } else {
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

                            if (this.abort === false) {
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

    putThreeSixtyFrames(threeSixtyFrameUrls) {
        return new Promise((resolve, reject) => {
            let len = threeSixtyFrameUrls.length;
            let count = 0;
            for (let i = 0; i < len; i++) {
                this.storage.get(threeSixtyFrameUrls[i]).then((image) => {
                    if (image != null)
                    {
                        count++;
                        if (count === len) resolve(true);
                    }
                    else {
                        if (this.values.online) {
                            this.putImage(threeSixtyFrameUrls[i]).then((res) => {
                                count++;
                                if (count === len) resolve(true);
                            }).catch((err) => {
                                count++;
                                if (count === len) resolve(true);
                            });
                        }
                        else {
                            count++;
                            if (count === len) resolve(true);
                        }
                    }
                }).catch((error) => {
                    count++;
                    if (count === len) resolve(true);
                    console.log(error);
                });;
            }
        });
    }

    //post image from URL into dB
    putImage(url) {
        return new Promise((resolve, reject) => {
            const headers = new HttpHeaders().set('Content-Type', 'application/blob');
            /*
            let contentType = 'image/png';
            if(url.includes('.jpg')){
            contentType = 'image/jpeg'
            }
            */
            this.http.get(url, {
                headers: headers,
                responseType: 'blob'
            }).subscribe((response: any) => {
                let blob = new Blob([response]);
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
                this.putImage64(blob, filename, url, imageType).then((nr1) => {
                    let nr = '';
                    resolve(nr);
                })
            }, error => {
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

    // getImageCordova(blob, filename, url) {
    //     return new Promise((resolve, reject) => {
    //         this.file.writeFile(this.values.fs + this.values.imageCacheFolder, filename, blob).then((nr1) => {
    //             let nr = '';
    //             resolve(nr);
    //             this.cacheIndex(url, filename)
    //         })
    //     })
    // }

    putImage64(blob, filename, url, imageType) {
        return new Promise((resolve, reject) => {
            let image64;
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
        if (this.isDevice && this.sqliteDB) {
            let query = `SELECT img_data FROM images WHERE url = '` + url + `'`;
            this.sqliteDB.executeSql(query, []).then(images => {
                if (images.rows.length > 0) {
                    query = `UPDATE images SET img_data = '` + filename + `' WHERE url = '` + url + `'`;
                    this.sqliteDB.executeSql(query, []).then(() => {
                    }).catch(e => console.log(e));
                } else {
                    query = `INSERT INTO images(url, img_data) VALUES ('` + url + `', '` + filename + `')`;
                    this.sqliteDB.executeSql(query, []).then(() => {
                    }).catch(e => console.log(e));
                }
            }).catch(e => console.log(e));
        } else {
            this.storage.set(url, filename);
        }
    }

    //fetch the blob from the dB; returns blob
    getImage(img_src) {
        return new Promise((resolve, reject) => {
            if (this.isDevice) {
                if (!this.sqliteDB) {
                    resolve(null);
                    return;
                }
                const query = `SELECT * FROM images WHERE url = '` + img_src + `'`;
                this.sqliteDB.executeSql(query, []).then(images => {
                    if (images.rows.length > 0) {
                        resolve(images.rows.item(0).img_data);
                    } else {
                        resolve(null);
                    }
                }).catch(e => {
                    console.log(e);
                });
            } else {
                this.storage.get(img_src).then((data) => {
                    //let image = JSON.parse(data);  
                    resolve(data);
                }).catch(function (err) {
                    // let idn = '../assets/images/tinyplaceholder.png';
                    // resolve(idn);
                    resolve(null);
                });
            }
            /*
            this.imageDB.getAttachment(img_src, 'file').then((image) => {
                resolve(image);
            }).catch(function(err){
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

    formatCollections(designer_id) {
        for (let cindex = 0, len = this.values.collections.length; cindex < len ; cindex++) {
            let cashe_collection_id = "products_" + this.values.collections[cindex].collection_id;
            this.storage.remove(cashe_collection_id);
        }
    }

    //  manage caching a collection (cache index / log / get products / mode)

    cacheCollection(collection_id, designer_id, designer_title, collection_title, mode) {
        return new Promise((resolve, reject) => {
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
                if (this.values.collections[cindex].collection_id === collection_id) {
                    abort = true;
                    // this.values.collections[cindex].offline = 'Downloading';

                    //this.values.collections[cindex].designer = designer_title;
                    //this.values.collections[cindex].size = this.values.collections[cindex].app_total_bytes

                    let record_id = 'collections_' + designer_id;

                    //  log entry
                    //  0 = just get products
                    //  1 = just try and cache
                    //  2 = delete then cache
                    //  3 = just delete   
                    //  4 = update 
                    //  5 = update all images     
                    let action = '';
                    if (mode === 1) { action = 'Downloaded'; }
                    if (mode === 2) { action = 'Downloaded (all images)'; }
                    if (mode === 3) { action = 'Remove'; }
                    if (mode === 4) { action = 'Updated'; }
                    if (mode === 5) { action = 'Updated (all images)'; }
                    this.storeCollections(record_id, this.values.collections);
                    this.getProduct(collection_id, this.values.user_profile.device_token, this.values.user_profile.user_token, mode).then((data) => {

                        this.c_collection_title = collection_title;
                        this.c_collection_id = collection_id;
                        this.c_designer_title = designer_title;
                        this.c_designer_id = designer_id;
                        this.c_mode = mode;
                        this.c_action = action;
                        this.c_collection_total_bytes = this.values.collections[cindex].app_total_bytes;

                        // //this.values.products = data;
                        // if (mode ===  3) {
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
        let sizeMb = Math.round(parseInt(sizebytes) / 1024 / 1000);
        let entry_date = new Date().toISOString();
        let index_entry = {
            'collection_id': collection_id, 'designer': designer_title, 'designer_id': designer_id, 'collection': collection_title,
            'download_date': entry_date, 'size': sizeMb
        };
        this.addDownlog(action, collection_title, collection_id, designer_title, designer_id);
        this.storage.get('collection_index').then((response) => {
            let cIndex = [];
            if (response != null) {
                let GcIndex = response.data;
                cIndex = this.removeCIndexItem(GcIndex, collection_id);
            }
            cIndex.push(index_entry);
            let newCindex = { 'data': cIndex }
            this.storage.set('collection_index', newCindex)
        })
    }

    delCindex(collection_title, collection_id, designer_title, designer_id) {
        this.addDownlog('Remove', collection_title, collection_id, designer_title, designer_id);
        this.storage.get('collection_index').then((response) => {
            let cIndex = response.data;
            let cIndexData = this.removeCIndexItem(cIndex, collection_id);
            let newCindex = { 'data': cIndexData };
            this.storage.set('collection_index', newCindex);

            //update collection offline property
            this.getCollections(designer_id, this.values.user_profile.device_token, this.values.user_profile.user_token).then(response => {
                this.values.collections = response;
                let abort = false;
                for (let i = 0, len = this.values.collections.length; i < len && !abort; i++) {
                    if (this.values.collections[i].collection_id === collection_id) {
                        abort = true;
                        delete this.values.collections[i].offline
                    }
                }
                let record_id = 'collections_' + designer_id;
                this.storeCollections(record_id, this.values.collections)
            });
        });
    }

    removeCIndexItem(cIndex, collection_id) {
        let abort = false;
        for (let i = 0, len = cIndex.length; i < len && !abort; i++) {
            if (cIndex[i].collection_id === collection_id) {
                abort = true;
                cIndex.splice(i, 1);
                return cIndex;
            }
        }
        return cIndex;
    }

    addDownlog(action, collection_title, collection_id, designer_title, designer_id) {
        let log_date = new Date().toISOString();
        let log_entry = { 'action': action, 'collection_id': collection_id, 'designer': designer_title, 'designer_id': designer_id, 'collection': collection_title, 'date': log_date }
        this.storage.get('download_log').then((response) => {
            let ulog = [];
            if (response != null) {
                ulog = response.data;
            }
            ulog.push(log_entry);
            let newdlog = { 'data': ulog }
            this.storage.set('download_log', newdlog);
            this.dlog = ulog
            if (this.selectedCollection != undefined && this.selectedCollection.collection_id === collection_id) {
                this.selectedCollection.offline = action;
            }
        });
    }

    filterCollections(collection_id) {
        this.values.search = '';
        return this.values.collections.filter((collection) => {
            return collection.collection_id === collection_id;
        });
    }

    setThisCollection() {
        if (!this.values.online) {
            for (let i = 0, len = this.values.collections.length; i < len; i++) {
                if (this.values.collections[i].offline === "Downloaded") {
                    this.designer.currentCollectionID = this.values.collections[i].collection_id
                    return this.designer.currentCollectionID;
                }
            }
            if (this.designer.hasOwnProperty("currentCollectionID")) {
                return this.designer.currentCollectionID;
            } else {
                this.designer.currentCollectionID = this.values.collections[0].collection_id
                return this.designer.currentCollectionID;
            }
        } else {
            if (this.designer.hasOwnProperty("currentCollectionID")) {
                return this.designer.currentCollectionID;
            } else {
                this.designer.currentCollectionID = this.values.collections[0].collection_id
                return this.designer.currentCollectionID;
            }
        }
    }

    getRetailers(device_token, user_token) {
        return new Promise((resolve, reject) => {
            if (this.values.online) {
                let gPapiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22retail_buyers%22,%22request%22:{%22device_token%22:%22" + device_token + "%22,%22user_token%22:%22" + user_token + "%22}}";
                this.http.get(gPapiSource).subscribe(data => {
                    resolve(data['result']);
                    this.storage.set("retailers", data['result']);
                }, err => {
                    this.storage.get("retailers").then(data => {
                        resolve(data);
                    }).then(error => {
                        reject(error);
                    });
                });
            }
            else {
                this.storage.get("retailers").then(data => {
                    resolve(data);
                }).then(err => {
                    reject(err);
                });
            }
        });
    }

    getShippings(device_token, user_token, buyer_id) {
        return new Promise((resolve, reject) => {
            if (!this.values.online) {
                this.offlineManager();
                reject(null);
            };
            let gPapiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22shipping%22,%22request%22:{%22device_token%22:%22" + device_token + "%22,%22user_token%22:%22" + user_token + "%22,%22buyer_id%22:%22" + buyer_id + "%22}}";
            this.http.get(gPapiSource).subscribe(data => {
                resolve(data['result']);
            })
        });
    }

    getDesignerCurrency(region_id, designer_id) {
        //if design_id then look up the designer
        if ((designer_id > 0) && (this.values.designers)) {
            let abort = false;
            for (let i = 0, len = this.values.designers.length; i < len && !abort; i++) {
                if (this.values.designers[i].seller_account_id === designer_id) {
                    this.designer = this.values.designers[i];
                    abort = true;
                }
            }
        }
        else {
            this.designer = this.values.designer;
        }

        // find region in designer
        let selected_regionId = null;
        if (this.values.designer_pricelist.region_index === null) {
            selected_regionId = region_id;
        }
        else {
            selected_regionId = this.values.designer_pricelist.region_id;
        }

        let abort = false;
        for (let i = 0, len = this.values.designer.region_currency.length; i < len && !abort; i++) {
            if (this.values.designer.region_currency[i].region_id === selected_regionId) {
                abort = true;
                this.designer.buyer_code = this.values.designer.region_currency[i].currency_code;
                this.designer.buyer_symbol = this.values.designer.region_currency[i].currency_symbol;
            }
        }
    }

    // get countries list from server for the select the country of door address form.
    getCountries() {
        this.storage.get('countries').then((response) => {
            let country_count = 0;
            if (response != null) {
                country_count = response.length;
                this.values.countries = response;
            }
            let apiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22countries%22,%22request%22:{%22device_token%22:%22" +
            this.values.user_profile.device_token + "%22,%22user_token%22:%22" + this.values.user_profile.user_token + "%22,%22country_count%22:%22" + country_count + "%22}}";
            this.http.get(apiSource).subscribe(data => {
                if (data['result'].length > 0) {
                    this.storage.set('countries', data['result']);
                    this.values.countries = data['result'];
                }
            })
        });
    }

    // activity logs process functions
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


        this.values.activity_logs.request.log.push(activity_log);

        this.storage.set('activity_logs', this.values.activity_logs.request.log);

        if (this.values.online) {
            let apiURL = this.values.APIRoot + "/app/api.php";  
            let data = encodeURIComponent(JSON.stringify(this.values.activity_logs));
            let headers = new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
            });
            // let options = new RequestOptions({
            //     headers: headers
            // });
            // // TODO: Encode the values using encodeURIComponent().
            // let body = 'json=' + data
            // this.http.post(apiURL, body, options)
            //     .pipe(map(res => res.json()))
            //     .subscribe(response => {
            //         if(response.status === 'ok') {
            //             this.emptyActivityLogs();
            //         }
            //     });
        }
    }

    // Get of Designer_Retailer association
    getDRAssociationWithDParam(designer_id, device_token, user_token) {
        return new Promise((resolve, reject) => {
            if (this.values.online) {
                let gPapiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22get_designer_retailer_association%22,%22request%22:{%22device_token%22:%22" + device_token + "%22,%22user_token%22:%22" + user_token + "%22,%22seller_account_id%22:" + designer_id + "}}";
                this.http.get(gPapiSource).subscribe(data => {
                    resolve(data['result']);
                    this.storage.set("association_by_designer_" + designer_id, data['result']);
                }, err => {
                    this.storage.get("association_by_designer_" + designer_id).then(data => {
                        resolve(data);
                    }).then(error => {
                        reject(error);
                    });
                });
            }
            else {
                this.storage.get("association_by_designer_" + designer_id).then(data => {
                    resolve(data);
                }).then(err => {
                    reject(err);
                });
            }
        });
    }

    getDRAssociationWithRParam(retailer_id, device_token, user_token) {
        return new Promise((resolve, reject) => {
            if (this.values.online) {
                let gPapiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22get_designer_retailer_association%22,%22request%22:{%22device_token%22:%22" + device_token + "%22,%22user_token%22:%22" + user_token + "%22,%22retailer_id%22:" + retailer_id + "}}";
                this.http.get(gPapiSource).subscribe(data => {
                    resolve(data['result']);
                    this.storage.set("association_by_retailer_" + retailer_id, data['result']);
                }, err => {
                    this.storage.get("association_by_retailer_" + retailer_id).then(data => {
                        resolve(data);
                    }).then(error => {
                        reject(error);
                    });
                });
            }
            else {
                this.storage.get("association_by_retailer_" + retailer_id).then(data => {
                    resolve(data);
                }).then(err => {
                    reject(err);
                });
            }
        });

    }

    async presentLoadingSpinerSec() {
        this.loadingState = true;
        return await this.loadingCtrl.create({
            duration: 5000,
        }).then(a => {
            a.present().then(() => {
                if (!this.loadingState) {
                    a.dismiss().then(() => {
                        console.log('abort spinner presenting');
                    });
                }
            });
        }).catch(err => {
            console.log(err);
        });
    }

    async dismissLoadingSpiner() {
        this.loadingState = false;
        return await this.loadingCtrl.dismiss().then(() => { }).catch(err => { console.log(err); });
    }
    // dismissLoadingSpiner() {
    //     console.log('dismissLoadingSpiner');
    //     // this.loadingState = false;
    //     // return await this.loadingCtrl.dismiss().then(() => {
    //     //     console.log('loadingCtrl a after dismissLoadingSpiner', this.loadingCtrl);
    //     // });
    // }
    // Loading Spinner process functions
    //   async createLoader() {
    //       this.loading = await this.loadingCtrl.create({
    //           backdropDismiss: false,
    //           spinner: 'crescent',
    //           // content: `
    //           //         <div id="loading" class="loading_container">
    //           //         <div class="loading_spinner"></div>
    //           //         </div>`
    //       });
    //   }

    presentLoadingSpiner() {
        if (this.loadingState === true) return;
        this.loading.present().then(() => {
            this.loadingState = true;
        }).catch(function (err) {
            console.log(err);
        });
    }

    //   dismissLoadingSpiner() {
    //       return new Promise((resolve, reject) => {
    //           if (this.loadingState === false) {
    //               this.isloadingState = true;
    //               return;
    //           }
    //           this.loading.dismiss().then(() => {
    //               this.loadingState = false;
    //               this.isloadingState = false;
    //               this.values.onescreen_image_index = 0;
    //               this.values.onescreen_total_imgages_num = 0;
    //               this.createLoader();
    //               resolve();
    //           }).catch(function (err) {
    //               console.log(err);
    //               reject();
    //           });
    //       });
    //   }

    //   presentLoadingSpinerSec() {
    //       return new Promise((resolve, reject) => {
    //           if (this.loadingState === true) return;
    //           this.loading.present().then(() => {
    //               this.loadingState = true;
    //               this.values.spinnerCheckPoint = Date.now();
    //               if (this.values.isHeavyLoad === true) {
    //                   setTimeout(async () => {
    //                       let currentCheckPoint = Date.now();
    //                       if (this.loadingState === true && currentCheckPoint - this.values.spinnerCheckPoint >= 35000) {
    //                           this.dismissLoadingSpiner();
    //                           let alert = await this.alertCtrl.create({
    //                               header: 'WARNING: Internet connect problem.',
    //                               subHeader: 'Please check your internet connectivity and try again.',
    //                               buttons: [
    //                                   {
    //                                       text: 'OK',
    //                                       handler: () => {
    //                                           console.log('Network is too bad.');
    //                                       }
    //                                   }
    //                               ]
    //                           });
    //                           await alert.present();
    //                       }
    //                   }, 35000);
    //                   this.values.isHeavyLoad = false;
    //               }
    //               else {
    //                   setTimeout(async () => {
    //                       let currentCheckPoint = Date.now();
    //                       if (this.loadingState === true && currentCheckPoint - this.values.spinnerCheckPoint >= 20000) {
    //                             this.dismissLoadingSpiner();
    //                             let alert = await this.alertCtrl.create({
    //                                 header: 'WARNING: Internet connect problem.',
    //                                 subHeader: 'Please check your internet connectivity and try again.',
    //                                 buttons: [
    //                                     {
    //                                         text: 'OK',
    //                                         handler: () => {
    //                                             console.log('Downloading is too Slow.');
    //                                         }
    //                                     }
    //                                 ]
    //                             });
    //                             await alert.present();
    //                       }
    //                   }, 20000);
    //               }
    //               resolve();
    //           }).catch(function (err) {
    //               console.log(err);
    //               reject();
    //           });
    //       });
    //   }

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
        if (this.values.designers === undefined) return false;
        for (let cindex = 0, len = this.values.designers.length; cindex < len; cindex++) {
            if (this.values.designers[cindex].seller_account_id === designer_id) return true;
        }
        return false;
    }

    addIsOpenedProp() {
        for (let cindex = 0, len = this.values.downloadedCollections.length; cindex < len; cindex++) {
            let isOpenedCollection = this.isOpenedCollection(this.values.downloadedCollections[cindex].designer_id);
            this.values.downloadedCollections[cindex].isOpenedCollection = isOpenedCollection;
        }
        // let newCindex = {'data':this.values.downloadedCollections}
        // this.storage.set('collection_index', newCindex)
    }
    /*
    getBuyers(retailer_id,device_token,user_token){

    let gPapiSource = this.APIRoot + "/app/api.php?json={%22action%22:%22retail_buyers%22,%22request%22:{%22device_token%22:%22"+device_token+"%22,%22user_token%22:%22"+user_token+"%22,%22retailer_id%22:"+retailer_id+"}}";
    return this.http.get(gPapiSource).map(res => res.json());
                
    }
    */
}