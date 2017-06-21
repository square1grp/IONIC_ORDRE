import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DesignersPage } from '../designers/designers';
import { CollectionPage } from '../collection/collection';
import { Values } from '../../providers/values';
import { Data } from '../../providers/data';
import { CartProvider } from '../../providers/cart';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  
  designersPage = DesignersPage;
  collectionPage = CollectionPage;
  loginForm: FormGroup;
  response: any;
  designers: any;
  designer: any;
  errorMessage: any;
  loggingin: any;
  
  constructor(public navCtrl: NavController, public formBuilder: FormBuilder, public data: Data, public values: Values, public cartProvider: CartProvider, private alertCtrl: AlertController, public loadingCtrl: LoadingController) {
    
    this.loginForm = formBuilder.group({
      user_email: [''],
      user_password: ['']
    });
    this.errorMessage='';

  }

  ngOnInit(){
    this.data.initDB().then(data => {
      if(this.values.APIRoot == "https://ordre.kineticmedia.com.au"){
        let alert = this.alertCtrl.create({
          title: 'WARNING: You are running on the TEST database.',
          subTitle: 'Orders will not be processed.',
          buttons: [
            {
              text: 'Accept',
              handler: () => {
                console.log('Warning about TEST mode');
              }
            }
          ]
        });
        alert.present();  
        if(this.values.hasOwnProperty('user_profile')){
          if (this.values.user_profile.user_id > 0){
            console.log('Returning user');
            //this.logUserIn();
          }
        }
      };
    });
  };



  offlineManager(){
    /*
    if(!this.connectivityService.isOnline()){
      let alert = this.alertCtrl.create({
        title: 'You are offline.',
        subTitle: 'Please check your network settings then click Try Again.',
        buttons: [
          {
            text: 'Try Again',
            handler: () => {
              console.log('Warning about being offline');
              
            }
          }
        ]
      });
      alert.present();  
    } 
    */
  }

  ionViewDidLoad() {
   
    console.log('ionViewDidLoad LoginPage');

  }

  submitLogin(): void {  
    if(!this.values.online){
      this.data.offlineManager();
      //this.data.loading.dismiss().catch((err) => {console.log('Problem with spinner:'+err)});
      return;
    }
    else
    {
      if(this.loggingin==true){return}
      this.loggingin=true;
      console.log('Form Post: Login');

      let logindata = this.loginForm.value;
      console.log('Credentials:' + JSON.stringify(logindata));
      this.data.login(logindata, this.values.device_token).then((response) => {
        console.log('Full Response:' + JSON.stringify(response));
        
        //set user profile
        this.values.user_profile = response;
        this.values.user_profile.masquerade_id = 0;  //whenmasquarading, user id of masquerader
        this.values.user_profile.forcecache = 0;  //don't force update images when recaching
        
        //this.logUserIn();
        //console.log(this.values.designer);

        //this.navCtrl.push(CollectionPage, { designer: this.values.designer, mode:'' });
        if(this.values.user_profile.status=='ok'){
          this.logUserIn();
          //this.navCtrl.push(CollectionPage, { designer: this.values.designer, mode:'' });
        }
        else
        {
          this.loggingin=false;
          let alert = this.alertCtrl.create({
            title: this.values.user_profile.title,
            subTitle: this.values.user_profile.subTitle,
            buttons: ['Dismiss']
          });
          alert.present();
        }
      });
    }
  }

  logUserIn(){
    //this.data.presentLoadingCustom();
    let loading = this.loadingCtrl.create({
        dismissOnPageChange: false,
        spinner: 'crescent',
        content: "<div id='loading' class='loading_container'><div class='loading_spinner'></div></div>"}
    );
    loading.present().then(() => {
    //if(this.values.online){
      this.values.device_token = this.values.user_profile.device_token
      this.cartProvider.emptyOrder();
      this.values.user_profile.masquarade_id = 0;
      delete this.values.user_profile._rev
      this.data.saveUser(this.values.user_profile);

      if (this.values.user_profile.seller_account_id){

        //  get the designer object from the list of designers
        //  so get all designers
        //  iterate through to find this one
        this.data.getDesigners(this.values.device_token,this.values.user_profile.user_token,0).then((response) => {
          this.designers = response;
          let abort = false;
          for (let i = 0, len = this.designers.length; i < len && !abort; i++) { 
            if(this.designers[i].seller_account_id == this.values.user_profile.seller_account_id){
              this.values.designer =  this.designers[i];
              abort = true; 
            }
          }
          this.data.getDesignerCurrency(this.values.user_profile.user_region_id,0);

          //  get first collection for designer / check collection is downloaded if offline

          this.data.getThisCollections(this.values.designer.seller_account_id,this.values.device_token,this.values.user_profile.user_token).then((data) => { 

            //check collection is downloaded if we're offline
            if(!this.values.online){
              if(this.values.collections[0].offline!='Downloaded'){
                this.data.offlineManager();
                //this.data.loading.dismiss().catch((err) => {console.log('Problem with spinner:'+err)});
                loading.dismissAll();
                return false;
              }
            };      
            console.log('Online:'+this.values.online)

            this.values.products = null;
            this.data.getProduct(this.data.currentCollectionID,this.values.device_token,this.values.user_profile.user_token,0,0).then(data => {
              this.data.consolelog('Set products from download after init')
              this.data.consolelog('Got product JSON:'+this.data.currentCollectionID)
              console.log('Loading init items');
              //this.data.loading.dismiss().catch((err) => {});
              loading.dismissAll();
              this.navCtrl.push(CollectionPage, { designer: this.values.designer, mode:'' });
            }).catch(function(err){
                console.log(err);
            });            

          })
        });
      }
      else
      {
        //this.data.loading.dismiss().catch((err) => {});
        loading.dismissAll();
        this.navCtrl.push(DesignersPage);
        //this.navCtrl.push(TestPage);
      }   
    //}
    //else
    //{
    //  this.loggingin=false;
    //} 
    });
  }

}
