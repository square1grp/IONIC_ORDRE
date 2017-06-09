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

declare var cordova;

@Injectable()
export class Data {

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
  draftOrders: any;
  requestedOrders: any;
  db: any;
  dbDraft: any;
  dbRequest: any;
  imageDB: any;
  storeDesigners: any;
  storeCollection: any;
  storeProducts: any;
  dlog: any;

  SQLLite: boolean;

  constructor(private file: File, public storage: Storage, public loadingCtrl: LoadingController, public http: Http,
              public platform: Platform, public values: Values, private alertCtrl: AlertController, private connectivity:Connectivity) {}

  ngOnInit(){
    setTimeout(() => {
      this.initDB();
    }, 3000);
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
              if(data!=null){
                this.values.cacheImageID = data
              }
              else
              {
                this.values.cacheImageID = 0
              }
            })

            //check cache storage (file or dB)
            if(this.platform.is('cordova!')){

              this.values.fs = cordova.file.dataDirectory;
              this.file.checkDir(this.values.fs, this.values.imageCacheFolder).then(()=>{}).catch(err => {
                this.file.createDir(this.values.fs, this.values.imageCacheFolder, true)
              });
              this.values.freeSpace = this.file.getFreeDiskSpace()
              console.log('Freespace:'+JSON.stringify(this.values.freeSpace))
              //this.storage.clear();
            }  
            else
            {
              //dev so clear it about
              //this.storage.clear();
            }

            this.values.online = this.connectivity.isOnline();
            this.addConnectivityListeners();

            //persist user
            this.getUser().then(data => {
                if (data!=null){
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

  offlineManager(){
    
    if(!this.values.online){
      let alert = this.alertCtrl.create({
        title: 'You are offline.',
        subTitle: 'You need to be online to do this. Check your settings and try again.',
        buttons: [
          {
            text: 'Try Again',
            handler: () => {
              this.consolelog('Warning about being offline');
              
            }
          }
        ]
      });
      alert.present();  
    } 
    
  }
  // login method for kinetic API

  login(credentials, device_token){

    //this.consolelog('Login using:' + JSON.stringify(credentials));
    let email = credentials.user_email
    let password = credentials.user_password
    return new Promise((resolve, reject) => {
      if(!this.values.online){
        this.offlineManager();
        reject(null);
      };

      let apiSource = this.values.APIRoot + "/app/auth.php?json={%22action%22:%22login_user%22,%22request%22:{%22email%22:%22"+email+"%22,%22pass%22:%22"+password+"%22}}";    
      this.http.get(apiSource)
        .map(res => res.json())
        .subscribe(data => {
          this.consolelog('Got Authentication Result');
          //this.consolelog('Response:' + JSON.stringify(data));
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
  
  
  getUser(){
    return new Promise((resolve, reject) => {
      this.consolelog('Get user')
      this.storage.get('user_profile').then((data) => {
        resolve(data);
      }).catch(error => {
        resolve({'user_id':0});
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
      }).catch( error => {
        reject(error);
      })
      
    });
  }

  getLog(){
    this.storage.get('download_log').then((response) => {
      this.dlog=[];
      if(response!=null){
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
      }).catch( error => {
        reject(error);
      })
    });    
    //this.dbDraft.post(draft).subscribe((data) =>{
    //  return data;  
    //});
  }

  getOrder(id){
    return new Promise((resolve, reject) => {
      this.dbRequest.get(id).then((data) => {
        resolve(data);
      }).catch( error => {
        reject(error);
      })
    });
  }

  saveDraftOrder(draft) {  
    //draft._id = id;
    
    return new Promise((resolve, reject) => {
      draft._id = new Date().toJSON();
      delete draft._rev;
      this.consolelog('SAVING:'+JSON.stringify(draft))
      this.dbDraft.post(draft).then((new_id) => {
        resolve(new_id);
      }).catch( error => {
        reject(error);
      })
    });    
    //this.dbDraft.post(draft).subscribe((data) =>{
    //  return data;  
    //});
  }

  getDraftOrder(id){
    return new Promise((resolve, reject) => {
      this.dbDraft.get(id).then((data) => {
        resolve(data);
      }).catch( error => {
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

  getAllOrders(buyer_id,seller_id) {  

    this.consolelog('Getting all orders for:'+buyer_id+':'+seller_id)
    return this.dbRequest.allDocs({ include_docs: true})
        .then(docs => {

            this.requestedOrders = docs.rows.map(row => {
                // Dates are not automatically converted from a string.
                //this.consolelog('Row:'+JSON.stringify(row.doc))
                if (seller_id>0){
                  if((row.doc.seller_account_id==seller_id)&&(row.doc.buyer_id==buyer_id)){
                    row.doc.Date = new Date(row.doc.Date); 
                    //this.consolelog('Found'+JSON.stringify(row.doc));
                    return row.doc; 
                  }
                  else
                  {
                    return false;
                  }
                }  
                else
                {
                  if(row.doc.buyer_id==buyer_id){
                    row.doc.Date = new Date(row.doc.Date);
                    //this.consolelog('Found'+JSON.stringify(row.doc));
                    return row.doc;
                  }
                  else
                  {
                    return false;
                  }
                }
            });
            //this.consolelog(JSON.stringify(this.requestedOrders))
            return this.requestedOrders;
        });
  }

  getAllDraftOrders(buyer_id,seller_id) {  
    this.consolelog('Getting all draft orders for:'+buyer_id+':'+seller_id)
    return this.dbDraft.allDocs({ include_docs: true})
        .then(docs => {

            this.draftOrders = docs.rows.map(row => {
                //this.consolelog('Row:'+JSON.stringify(row.doc))
                // Dates are not automatically converted from a string.
                if (seller_id>0){
                  this.consolelog('Filtering by seller')
                  if((row.doc.seller_account_id==seller_id)&&(row.doc.buyer_id==buyer_id)){
                    row.doc.Date = new Date(row.doc.Date); 
                    //this.consolelog('Found'+JSON.stringify(row.doc));
                    return row.doc; 
                  }
                  else
                  {
                    return false;
                  }
                }  
                else
                {
                  if(row.doc.buyer_id==buyer_id){
                    row.doc.Date = new Date(row.doc.Date);
                    //this.consolelog('Found'+JSON.stringify(row.doc));
                    return row.doc;
                  }
                  else
                  {
                    return false;
                  }
                }
            });

            this.consolelog(JSON.stringify(this.draftOrders))
            return this.draftOrders;
        });
  }

  getDesigners(device_token,user_token,force){

    let checkpoint = false;
    let ONE_HOUR = 60 * 60 * 1000;
    let baseDate = new Date('01/01/1980'); 
    let nowDate = Date.now();
    this.consolelog('Get Designers - Checkpoint:'+this.values.designer_checkpoint+ ' compared:'+(this.values.designer_checkpoint.getTime() == baseDate.getTime()) );
    this.consolelog('Checkpoint past?'+(nowDate-ONE_HOUR > this.values.designer_checkpoint.getTime()));
    if ((this.values.online)&&((this.values.designer_checkpoint.getTime() == baseDate.getTime()) || (nowDate-ONE_HOUR > this.values.designer_checkpoint.getTime()))) {
      force = true;
      checkpoint = true;
    }
    this.consolelog('Force?'+force);
    
    //  check for designers in db

    let record_id = 'designers'
    let record_id_get = record_id;
    if (force==true&&checkpoint==false) {
      record_id_get='NOPEA1'
    }

    return new Promise((resolve, reject) => {
      this.consolelog('Try GET:'+record_id);
      this.storage.get(record_id_get).then((result) => {
        
        if(result!=null){
          console.log('Got:'+record_id)
          let pdata = JSON.parse(result)
          //console.log(pdata.data);
          this.values.designers = null;
          resolve(pdata.data);
          this.loading.dismiss().catch(() => {});
        }
        console.log('Online:'+this.values.online)
        if((checkpoint==true||force==true||result==null)&&(this.values.online))
        {
          if(!this.values.online){
            this.offlineManager();
            this.loading.dismiss().catch((err) => {console.log('Problem with spinner:'+err)});
            return false;
          };
          //if (!this.values.user_profile.seller_account_id){this.presentLoadingCustom()};
          //return new Promise(resolve => {
          this.consolelog('Forced update?'+force);
          let apiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22designers%22,%22request%22:{%22device_token%22:%22"+device_token+"%22,%22user_token%22:%22"+user_token+"%22,%22checkpoint%22:%22"+(baseDate.getTime()/1000)+"%22}}";    
          this.consolelog(apiSource);
          this.http.get(apiSource).map(res => res.json()).subscribe(data => {
              this.consolelog('Got All Designers from API');
              let gotdata = data.result;
              resolve(data.result);

              this.loading.dismiss().catch(() => {});

              //this.deleteItem(record_id_get).then(() => {                 
              //this.consolelog(JSON.stringify(data.result))
              this.values.designer_checkpoint = new Date();
              this.consolelog('Store in pouchDB');
              this.storeDesigners = {'_id':record_id,data:gotdata};

              this.consolelog('Store Designers with wrapper.');
              this.storage.set(record_id, JSON.stringify(this.storeDesigners)).then((new_ID) => {
                //this.consolelog('Designers stored in pouchDB ID:'+JSON.stringify(new_ID));

                //  cache the images
                //data.result.forEach((designer, dindex) => {
                  //this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'+designer.profile_image+'&w=271&h=178');                 
                  //this.cacheMaybe(this.values.APIRoot+'/app/get_image.php?image=/'+designer.logo_image+'&w=310&h=140&zc=1');
                //});

              })
          })
        }
      })
    });
  }

  getCollections(designer_id,device_token,user_token,force){

    let checkpoint=false;
    
    let ONE_HOUR = 60 * 60 * 1000;
    let baseDate = new Date('01/01/1980'); 
    let nowDate = Date.now();

    if (!this.values.collection_checkpoint[designer_id]){
      this.values.collection_checkpoint[designer_id] = new Date('01/01/1980');
    }

    this.consolelog('Get Collections for '+designer_id+' - Checkpoint:'+this.values.collection_checkpoint[designer_id]+ ' compared:'+(this.values.collection_checkpoint[designer_id].getTime() == baseDate.getTime()) );
    this.consolelog('Checkpoint past?'+(nowDate-ONE_HOUR > this.values.collection_checkpoint[designer_id].getTime()));
    if ((force==0)&&(this.values.online)&&((this.values.collection_checkpoint[designer_id].getTime() == baseDate.getTime()) || (nowDate-ONE_HOUR > this.values.collection_checkpoint[designer_id].getTime()))) {
      force = true;
    } 

    //  check for designers in pouch
    let record_id = 'collections_'+designer_id
    let record_id_get = record_id;
    if (force==true&&checkpoint==false&&this.values.online) {record_id_get='NOPEA'}    
    return new Promise((resolve, reject) => {
      this.consolelog('Get Collections for designer:'+designer_id);
      //this.presentLoadingCustom();
      console.log('Hitting Storage');
      this.storage.get(record_id_get).then((result) => {
        if(result!=null){
          //this.consolelog(result.data);
          let pdata = JSON.parse(result);
          this.consolelog('Collection found in db for designer:'+designer_id); 
          resolve(pdata.data);                     
          this.loading.dismiss().catch(() => {});
        }
        if(checkpoint==true||force==true||result==null)
        {       
          if(!this.values.online){
            this.offlineManager();            
            this.loading.dismiss().catch(() => {});
            return false;
          };
          //return new Promise(resolve => {
          if(this.values.online){
            console.log('Hitting API');
            let apiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22collections_short%22,%22request%22:{%22device_token%22:%22"+device_token+"%22,%22user_token%22:%22"+user_token+"%22,%22checkpoint%22:%22"+(baseDate.getTime()/1000)+"%22,%22seller_account_id%22:"+designer_id+"}}"
            this.http.get(apiSource).map(res => res.json()).subscribe(data => {
                resolve(data.result);
                this.consolelog('Got Collection from API:'+apiSource); 
                //this.consolelog('Response:'+JSON.stringify(data.result));                   
                this.loading.dismiss().catch(() => {});             
                this.values.collection_checkpoint[designer_id] = new Date();
                this.storeCollections(record_id,data.result)

                //  set download status based on collection download index
                
                this.storage.get('download_log').then((response) => {
                  if(response!=null){
                    let ulog = response.data;
                    for (let i = 0, len = ulog.length; i < len; i++) {  
                      for (let j = 0, len = this.values.collections.length; j < len; j++) {  
                        if(ulog[i].collection_id==this.values.collections[j].collection_id){
                          //set collection status
                          this.values.collections[j].offline='Downloaded'
                        }
                      }
                    }   
                  }               
                });
                 
            })
          }
          else
          {
            this.loading.dismiss().catch(() => {});;
          }
        }
        this.loading.dismiss().catch(() => {});;
      }).catch(function(err){
          console.log(err);
          let idn='';
          resolve(idn);
      }) 
    });
  }

  //  stores collection list for a designer, record_id = 'collections_' + designer_id

  storeCollections(record_id,data){
    //return new Promise((resolve, reject) => {
      this.consolelog('4. Store in db');
      let storeCollection = {'_id':record_id,data:data};
      this.consolelog('5. Store Collections with wrapper.'); //+ JSON.stringify(this.storeCollection));
      //this.deleteItem(record_id).then(() => {
        this.consolelog('5d. Delete done, Posting:'+storeCollection._id)
        this.storage.set(record_id, JSON.stringify(storeCollection))//.then((new_ID) => {
          //this.consolelog('6. Collection stored!!!')
          //this.consolelog('6a:'+JSON.stringify(new_ID));
          //new_ID='';
          //resolve(new_ID);
        //})
      //})
    //})
  }


  deleteItem(id){
    this.consolelog('5a. Delete an ID:'+id)
    return new Promise((resolve, reject) => {      
      this.storage.remove(id).then((data) => {
        this.consolelog('5c. Item deleted:'+id);
        let idn='';
        resolve(idn);
      }).catch(function(err){
          console.log(err);
          let idn='';
          resolve(idn);
      })   
    });       
  };
  

  getProduct(collection_id,device_token,user_token,force,mode){

      //mode=set values or return them

      //force = cache force
      if(force==4){force=1}; 
      if(force==5){force=2};   
      console.log('Force:'+force);
      //  check for designers in pouch
      let record_id = 'products_'+collection_id
      let record_id_get = record_id;
      if (force==1) {record_id_get='NOPEA'}        
      return new Promise((resolve, reject) => {
        this.values.debug = 'Get Products'
        this.consolelog('8. Get Products for Collection:'+record_id_get)
        this.storage.get(record_id_get).then((result) => {
          console.log('8a. Got result from Storage');
          if(result!=null){
            console.log('8b. Parse data');
            let pdata = JSON.parse(result)
            //console.log(result);
            console.log('8c. Resolve data');
            
            //doing this to avoid unnecessary shuffle of product obj
            if(mode==0){
              this.values.products = pdata.data;
              resolve('');
            }
            else
            {
              resolve(pdata.data);
            }
            this.consolelog('9. Done getting data');
            //this.consolelog('DATA:'+JSON.stringify(pdata.data));
            if (force>0){
              this.productCache(pdata.data,force);
            }
          } else {
              console.log('Not found in dB: Products for collection '+record_id_get);
              if(!this.values.online){
                this.offlineManager();
                this.data.loading.dismiss().catch((err) => {console.log('Problem with spinner:'+err)}); 
                reject(null);
              };
              if(this.values.online){ 
              //return new Promise(resolve => {
              let apiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22collection_products%22,%22request%22:{%22device_token%22:%22"+device_token+"%22,%22user_token%22:%22"+user_token+"%22,%22collection_id%22:"+collection_id+"}}"
              this.http.get(apiSource).map(res => res.json()).subscribe(productData => {
                  this.consolelog('10. Got Products from API:'+apiSource);                   
                  //this.consolelog('PRODUCT DATA:'+JSON.stringify(productData.result));
                  //console.log(JSON.stringify(productData.result));
                  if(mode==0){
                    this.values.products = productData.result;
                    resolve('');
                  }
                  else
                  {
                    resolve(productData.result);
                  }
                  this.consolelog('11. Try delete, then Store in pouchDB');
                  this.deleteItem(record_id).then(() =>{

                    let storeProducts = {'_id':record_id,data:productData.result};
                    this.consolelog('Store Products with wrapper.'); //+ JSON.stringify(this.storeCollection));
                    //this.consolelog(JSON.stringify(storeProducts));
                    //this.storage.set(record_id, JSON.stringify(storeCollection)).then((new_ID) => {
                    let newData = JSON.stringify(storeProducts);
                    console.log('Store products:'+record_id);
                    //console.log('DATA:'+newData)
                    this.storage.set(record_id, newData).then(() => {
                      console.log('Products Stored:'+record_id);
                      if (productData.result.length>0){
                      //  cache or delete the images
                        if(force>0){
                          this.productCache(productData.result,force)                        
                        }
                      }
                    }).catch(function(err){
                        console.log(err);
                        let idn='';
                        resolve(idn);
                    }) 
                    
                  })                   
                
              });
              }               
            };
        }).catch(function(err){
          console.log(err);
          let idn='';
          resolve(idn);
        });
      });
    }

   productCache(products,force){
      //designer logos not passively cached
      //http://ordre.kineticmedia.com.au/app/get_image.php?image=/media/prod_images/t/t/tt1.jpg&w=320&h=150&zc=1&xtype=designer
      this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'+this.values.designer.logo_image+'&w=320&h=150&zc=1&xtype=designer',force);
      console.log('Product Cache');
      //  mode
      //  1 = just try and cache
      //  2 = delete then cache
      //  3 = just delete
      products.forEach((product, pindex) => {
        this.values.debug = 'Processing products' 
        if(product.variants[0]){
          //  cache the main product image and slider images
          if(product.variants[0].variant_images[0]){
            //if(product.variants[0].variant_images[0].variant_image){
              //this.consolelog('Cached feature image:'+this.values.APIRoot + '/app/get_image.php?image=/'+product.variants[0].variant_images[0].variant_image+'&w=342&h=509')
              //this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'+product.variants[0].variant_images[0].variant_image+'&w=342&h=509&xtype=prodimage');
            //}
            
              if ((product.variants.length>0)&&(this.values.cancel==0)){
                product.variants.forEach((variant) => {
                  //  product hero image
                  if(variant.variant_images[0].variant_image){
                    //this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'+variant.variant_images[0].variant_image+'&w=110&h=165&xtype=prodimage',force);  
                    this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'+variant.variant_images[0].variant_image+'&w=342&h=509&xtype=prodimage',force);
                  }
                    //  swatches
                    if((variant.swatch.swatch_image)&&(this.values.cancel==0)){
                      this.cacheMaybe(this.values.APIRoot+'/app/get_image.php?image=/'+variant.swatch.swatch_image+'&w=20&h=20&xtype=prodimage',force); 
                      this.cacheMaybe(this.values.APIRoot+'/app/get_image.php?image=/'+variant.swatch.swatch_image+'&w=100&h=100&xtype=prodimage',force);
                    } 
                    if((variant.variant_images.length>0)&&(this.values.cancel==0)){  
                      variant.variant_images.forEach((imageslide) =>{
                        //  360 left nav
                        //if(imageslide.hasOwnProperty('variant_360')){
                        //  this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'+imageslide.variant_360+'img01.jpg&w=683&h=957&zc=3',force);  
                        //}
                        //  variant images
                        if((imageslide.variant_image.length>0)&&(this.values.cancel==0)){ 
                          //  item?
                          this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'+imageslide.variant_image+'&w=683&h=980&zc=2&xtype=prodimage',force);  
                          //  linesheet
                          this.cacheMaybe(this.values.APIRoot + '/app/get_image.php?image=/'+imageslide.variant_image+'&w=110&h=165&xtype=prodimage',force); 
                        }
                        //  cache 360 frames                                 
                        if ((imageslide.variant_360)&&(this.values.cancel==0)){
                          this.values.imageFrames.forEach((frame) => {
                            this.consolelog('Cached 360 image:'+this.values.APIRoot+'/app/get_image.php?image=/'+imageslide.variant_360+'img'+frame+'.jpg&w=480&h=670&zc=3&xtype=360');
                            this.cacheMaybe(this.values.APIRoot+'/app/get_image.php?image=/'+imageslide.variant_360+'img'+frame+'.jpg&w=480&h=670&zc=3&xtype=360',force);
                          });
                        }
                      })  
                    }
                });
              }              
          }
        }
      });
   }

  getDownloads() {
    return new Promise((resolve, reject) => {
      this.values.downloadedCollections = []
      this.storage.get('collection_index').then((response) => {
          if(response!=null){
            this.values.downloadedCollections = response.data;
          }
          let nv='';   
          resolve(nv);
      })
    })
  }
  
  // all collections for the selected designer

  getThisCollections(designer_id,device_token,user_token){
    return new Promise((resolve, reject) => {
      this.getCollections(designer_id,device_token,user_token,0).then(response => {
        this.values.collections = response;
        //this.consolelog('Values.Collections:'+JSON.stringify(this.values.collections))
        this.consolelog('Got Collections... ');
        if(this.values.hasOwnProperty('collections')){
          //current collection ID
          this.currentCollectionID = this.setThisCollection();
          this.consolelog('Set Current Collection... ');
          
          this.selectedCollection = this.filterCollections(this.currentCollectionID)[0]; 
        }
        //this.consolelog('Getting Products for:'+designer_id);
        resolve(response);       
      });
    });
  }

  //  manage caching a collection (cache index / log / get products / mode)

  cacheCollection(collection_id,designer_id,designer_title,collection_title,mode){
    return new Promise((resolve, reject) => {
      console.log('Cache processing mode:'+mode+' Collection ID:'+collection_id);
      //  set the specific collection with an offline property status
      this.values.downloadTarget = 0;
      this.values.downloadQueue = 0;
      this.values.cancel=0;
      //  mode logic
      //  mode
      //  0 = no cache
      //  1 = just try and cache
      //  2 = delete then cache
      //  3 = just delete     
      let abort=false;
      for (let cindex = 0, len = this.values.collections.length; cindex < len && !abort; cindex++) {
        if (this.values.collections[cindex].collection_id == collection_id){
          abort = true;
          console.log('Set collection status');
          this.values.collections[cindex].offline = 'Downloading';
          
          //this.values.collections[cindex].designer = designer_title;
          //this.values.collections[cindex].size = this.values.collections[cindex].app_total_bytes
          //this.data.consolelog('3. Status set to "downloading" - updating collections obj for this designer')
          
          let record_id = 'collections_'+designer_id;

          //  log entry
          //  0 = just get products
          //  1 = just try and cache
          //  2 = delete then cache
          //  3 = just delete   
          //  4 = update 
          //  5 = update all images     
          let action='';
          if(mode==1){action='Downloaded'};
          if(mode==2){action='Downloaded (all images)'};
          if(mode==3){action='Remove'};
          if(mode==4){action='Updated'};
          if(mode==5){action='Updated (all images)'};
          this.storeCollections(record_id,this.values.collections)
          this.consolelog('7. Save Collection');          
          this.getProduct(collection_id,this.values.user_profile.device_token,this.values.user_profile.user_token,mode,0).then((data) => {
            //this.values.products = data;
            if(mode==3){
              this.delCindex(collection_title,collection_id,designer_title,designer_id)
            }
            else
            {
              if(mode>0){
                this.addCindex(action,collection_title,collection_id,designer_title,designer_id,this.values.collections[cindex].app_total_bytes);   
              }
            }   
            resolve('');       
          });          
        }
      }
    });

  }

  // Collection Caching Index

  addCindex(action,collection_title,collection_id,designer_title,designer_id,sizebytes){
    console.log('Add to cache index');
    let sizeMb = Math.round(parseInt(sizebytes)/1024/1000);
    let entry_date = new Date();
    let index_entry = {'collection_id':collection_id,'designer':designer_title, 'designer_id':designer_id,'collection':collection_title,'download_date':entry_date,'size':sizeMb}
    this.addDownlog(action,collection_title,collection_id,designer_title,designer_id);
    this.storage.get('collection_index').then((response) => {
      let cIndex = [];
      if(response!=null){
        let GcIndex = response.data;
        //console.log('Cache Index:'+JSON.stringify(cIndex));
        cIndex = this.removeCIndexItem(GcIndex,collection_id);
      }
      cIndex.push(index_entry);
      let newCindex = {'data':cIndex}
      this.storage.set('collection_index', newCindex)
    })       
  }

  delCindex(collection_title,collection_id,designer_title,designer_id){
    console.log('Delete from cache pindex:'+collection_id);
    this.addDownlog('Remove',collection_title,collection_id,designer_title,designer_id);
    this.storage.get('collection_index').then((response) => {
      let cIndex = response.data;
      //remove collection_id from cIndex
      let cIndexData = this.removeCIndexItem(cIndex,collection_id);
      let newCindex = {'data':cIndexData}
      //save collection index
      this.storage.set('collection_index', newCindex)

      //update collection offline property
      this.getCollections(designer_id,this.values.user_profile.device_token,this.values.user_profile.user_token,0).then(response => {
        this.values.collections = response;
        let abort=false;
        console.log('Looking to delete:'+collection_id)
        for (let i = 0, len = this.values.collections.length; i < len && !abort; i++) {
          if (this.values.collections[i].collection_id==collection_id){
            abort=true;
            delete this.values.collections[i].offline 
            console.log('Offline property removed')
          }
        }
        let record_id = 'collections_'+designer_id;
        this.storeCollections(record_id,this.values.collections)
      });
    }); 
  }

  removeCIndexItem(cIndex,collection_id){
    //console.log('Remove '+collection_id+' from:'+JSON.stringify(cIndex));
    let abort = false;
    for (let i = 0, len = cIndex.length; i < len && !abort; i++) {  
      console.log('Item:'+i);
      //console.log('Cache Index:'+JSON.stringify(cIndex[i]));
      if(cIndex[i].collection_id==collection_id){
        abort=true;
        console.log('Removed')
        //console.log('Cache Index:'+JSON.stringify(cIndex));
        //remove it
        cIndex.splice(i,1);
        return cIndex;
      }
    }  
    return cIndex;
  }

  //  Log File

  addDownlog(action,collection_title,collection_id,designer_title,designer_id){
      console.log('Add to log');
      let log_date = new Date();
      let log_entry = {'action':action,'collection_id':collection_id,'designer':designer_title, 'designer_id':designer_id,'collection':collection_title,'date':log_date}
      this.storage.get('download_log').then((response) => {
        let ulog = [];
        if(response!=null){
          console.log('Updating existing log')
          ulog = response.data;
        }
        ulog.push(log_entry);
        let newdlog = {'data':ulog}
        this.storage.set('download_log', newdlog);
        console.log('Log saved')
        this.dlog = ulog
        //console.log(JSON.stringify(this.dlog))
      });
  }

  //  get a single collection profile

  filterCollections(collection_id){
    this.values.search='';
    return this.values.collections.filter((collection) => { 
      return collection.collection_id == collection_id; 
    }); 
  }

  //  set default collection on collection page on first entry
  
  setThisCollection(){
    if(this.designer.hasOwnProperty("currentCollectionID")){    
      return this.designer.currentCollectionID;
    }
    else
    {
      this.designer.currentCollectionID = this.values.collections[0].collection_id
      return this.designer.currentCollectionID;
    }

  }

  getRetailers(device_token,user_token){
    return new Promise((resolve, reject) => {
      if(!this.values.online){
        this.offlineManager();
        reject(null);
      };
      this.consolelog('Get All Retailers');
      let gPapiSource = this.values.APIRoot + "/app/api.php?json={%22action%22:%22retail_buyers%22,%22request%22:{%22device_token%22:%22"+device_token+"%22,%22user_token%22:%22"+user_token+"%22}}";
      //this.http.get(apiSource).map(res => res.json()).subscribe(data => {
      this.http.get(gPapiSource).map(res => res.json()).subscribe(data => {
        this.consolelog('Got retailers');
        resolve(data.result);
      })  
    });
  }

  getDesignerCurrency(region_id, designer_id){
    
    this.consolelog('Getting currency profile for Region ID:'+region_id+' Designer ID:'+designer_id)
    //this.consolelog(JSON.stringify(this.values.designers));
    //if design_id then look up the designer
    if ((designer_id>0)&&(this.values.designers)){
      let abort = false;
      for (let i = 0, len = this.values.designers.length; i < len && !abort; i++) {
        if (this.values.designers[i].seller_account_id == designer_id) {
          this.designer = this.values.designers[i];
          abort = true;
          this.consolelog('Design profile set for currency:'+designer_id)
        }
      }   
    } 
    else
    {
      this.designer = this.values.designer;
    }
    //this.consolelog('Designer profile:'+JSON.stringify(this.data.designer));
    //find region in designer
    console.log('Set currency')
    let abort = false;
    for (let i = 0, len = this.values.designer.region_currency.length; i < len && !abort; i++) {
      if (this.values.designer.region_currency[i].region_id == region_id){
        abort = true;
        this.consolelog('Currency code:'+this.values.designer.region_currency[i].currency_code);
        this.consolelog('Currency symbol:'+this.values.designer.region_currency[i].currency_symbol);
        this.designer.buyer_code = this.values.designer.region_currency[i].currency_code;
        this.designer.buyer_symbol = this.values.designer.region_currency[i].currency_symbol;
      }
      else
      {
        console.log('Skip')
      }
    }
    //set currency string  
  }

  cacheMaybe(url,force){
      //  cache force
      //  1 = just try and cache
      //  2 = delete then cache
      //  3 = just delete
      //this.consolelog('Cache Maybe:'+url)  
      this.values.downloadTarget = this.values.downloadTarget + 1;
      this.values.downloadQueue = this.values.downloadQueue + 1;
      if(force>1){
        console.log('Delete from cache:'+url)
        this.deleteItem(url).then(() => {     
          if(force==3){
            this.values.downloadQueue = this.values.downloadQueue - 1;
          }    
          if(force==2){
            this.cacheImage(url)  
          }
        });
      }
      if(force==1){
        console.log('Cache:'+url)  
        this.cacheImage(url);
      }
  }

  cacheImage(url){
    //cache if not already cached
    this.storage.get(url).then((data) => {  
          if(data!=null){     
            //this.consolelog('Skipped - found in cache');
            this.values.downloadQueue = this.values.downloadQueue - 1;
            if(this.values.downloadQueue<0){this.values.downloadQueue=0}
          }else{
            if(!this.values.online){
              this.offlineManager();
              return false;
            };
            //this.consolelog('Need to get and store:'+url);
            this.putImage(url).then(() => {
              this.values.downloadQueue = this.values.downloadQueue - 1;  
              if(this.values.downloadQueue<0){this.values.downloadQueue=0}
              //this.storage.get('user_profile')
            });
          }
        });
    }



  //post image from URL into dB
  putImage(url){
      return new Promise((resolve, reject) => {
        //this.consolelog('Get to put:'+url);
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
        this.http.get(url,options).subscribe(response => {
            let blob = new Blob([response.blob()])
            //  image id
            let imageID = this.values.cacheImageID
            this.values.cacheImageID = this.values.cacheImageID + 1;

            //  image type
            let suffix='.jpg'
            let imageType='jpeg'
            if (url.indexOf('png')){
              suffix='.png';
              imageType='png'
            }

            // date 
            let d = new Date()
            let n = d.getTime()
            let filename = 'img_'+imageID+'_'+n+suffix;    
            //file or dB storage for cache       
            if(this.platform.is('cordova!')){
              this.getImageCordova(blob,filename,url).then((nr1) => {
                let nr='';
                resolve(nr);
              })
            }
            else
            {
              //console.log('Image Cache Get Blob:'+url)
              this.getImage64(blob,filename,url,imageType).then((nr1) =>{
                let nr='';
                resolve(nr);
              })
            }
        });
      });    
  }

  getImageCordova(blob,filename,url){    
      return new Promise((resolve, reject) => {     
        this.file.writeFile(this.values.fs + this.values.imageCacheFolder, filename, blob, true).then((nr1)=>{
          let nr='';
          resolve(nr);
          this.cacheIndex(url,filename) 
        })
      })
  }

  getImage64(blob,filename,url,imageType) {
    //console.log('Get As Image 64:'+url)
    return new Promise((resolve, reject) => {   
      let image64='';
      var myReader:FileReader = new FileReader();
      myReader.onloadend = (e) => {
          image64 = myReader.result;
          let nr='';
          resolve(nr);
          //this.cacheIndex(url,'data:image/'+imageType+';base64,'+image64);
          this.cacheIndex(url,image64);
      }
      myReader.readAsDataURL(blob);
    });        
  }

  cacheIndex(url,filename){
    this.storage.set(url,filename)
  }

  //fetch the blob from the dB; returns blob
  getImage(img_src){
      //this.consolelog('Get image from Cache:'+img_src);
      return new Promise((resolve, reject) => { 
          this.storage.get(img_src).then((data) => {
            //let image = JSON.parse(data);  
            resolve(data);
          }).catch(function(err){
            //console.log(err);
            let idn='../assets/images/tinyplaceholder.png';
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




  presentLoadingCustom() {
    //return new Promise((resolve, reject) => {
      console.log('Loading spinner');
      this.loading = this.loadingCtrl.create({
        dismissOnPageChange: false,
        spinner: 'crescent',
        content: `
          <div id="loading" class="loading_container">
            <div class="loading_spinner"></div>
          </div>`
      });

      this.loading.onDidDismiss(() => {
        this.consolelog('Dismissed loading');
      })
      this.loading.present()//.then(() =>{
       // let nlt='';
       // resolve(nlt);
      //})
    //})
  }

  consolelog(str){
    if(this.values.debug){
      console.log('LOG:'+str);
    }
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