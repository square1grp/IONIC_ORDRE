import { Component, ElementRef, Input, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core'; 
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Platform } from 'ionic-angular';
import { Data } from './data';
import { Values } from './values';
import { Storage } from '@ionic/storage';

 
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,  
  selector: 'lazy-img',
  template: `
 
    <div [ngClass]="{ 'placeholder': hidden }">
        <img [ngClass]="{ 'active': !hidden }" [src]="src" (load)="load()" (error)="error()" />
    </div>
 
  `
})

export class OrdreImageCache {
 
    @Input() src: string;

    public img: HTMLImageElement;
    public hidden: boolean;

    constructor(private storage: Storage, private cd: ChangeDetectorRef, private platform: Platform, public el: ElementRef, private data: Data, private ds: DomSanitizer, public values:Values) {
        this.hidden = true;
    };

    ngOnInit() {
        //this.src = "../assets/images/tinyplaceholder.png"   
        //this.src = this.src;
        let imageURL = this.src
        //console.log('Element triggered cache check:'+imageURL)
        this.storage.get(imageURL).then((image) => {
        //this.data.getImage(imageURL).then((image) => {
            if(image!=null)
            {
                //  file or dB cache 
                if(this.platform.is('cordova!'))
                {
                    console.log('Write Cordova File');
                    let url = URL.createObjectURL(image);
                    let fixedUrl: SafeUrl = this.ds.bypassSecurityTrustUrl(url)
                    this.src = <string>fixedUrl;
                    this.hidden = false 
                    this.cd.markForCheck();
                }
                else
                {
                    console.log('Write Image');
                    let fixedUrl: SafeUrl = this.ds.bypassSecurityTrustUrl(<string>image)
                    this.src = <string>fixedUrl;
                    this.hidden = false   
                    this.cd.markForCheck();             
                }
            }
            else
            {
                //console.log(imageURL + ' not found in cache')
                if(this.values.online){
                    this.src = imageURL //this.src;
                    this.hidden = false;
                    this.cd.markForCheck();
                    //console.log('Cache the image:'+imageURL)    
                    this.data.putImage(imageURL).then(() => {
                        //this.hidden = false;
                    }); 
                }
            }   
        
        });
    }

    load(): void {
        this.hidden = false;
        //console.log('image loaded')
    }

    error(): void {
        //this.img.remove(); 
        this.hidden = true;
        //console.log('image error')
    }
}

// (c) Copyright 2016-2017 Netambition Pty Ltd