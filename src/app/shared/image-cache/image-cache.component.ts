import { Component, OnInit, ElementRef, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'; 
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { fail } from 'assert';
import { Values } from '../../values.service';
import { Data } from '../../data.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,  
  selector: 'lazy-img',
  templateUrl: './image-cache.component.html',
  styleUrls: ['./image-cache.component.scss'],
})

export class ImageCacheComponent implements OnInit {
 
    @Input() src: string;

    public img: HTMLImageElement;
    public hidden: boolean = true;
    public w_value: string = "0px";
    public h_value: string = "0px";
    public img_src: string = "";

    constructor(
        private storage: Storage,
        private cd: ChangeDetectorRef,
        private platform: Platform,
        public el: ElementRef,
        private data: Data,
        private ds: DomSanitizer,
        public values:Values) {
    }

    ngOnInit() {
        let imageURL = this.src
        let sizeStrArry = imageURL.substr(imageURL.indexOf("&w=") + 1).split("&");

        this.storage.get(imageURL).then((image) => {
            if (image != null) {
                    //   file or dB cache 
                    //   if (this.platform.is('cordova')) {
                    //       let url = URL.createObjectURL(image);
                    //       let fixedUrl: SafeUrl = this.ds.bypassSecurityTrustUrl(url)
                    //       this.img_src = <string>fixedUrl;
                    //       this.hidden = false 
                    //       this.cd.markForCheck();
                    //   } else {
                    let fixedUrl: SafeUrl = this.ds.bypassSecurityTrustUrl(<string>image);
                    this.img_src = <string>fixedUrl;
                    this.hidden = false;
                    this.cd.markForCheck();             
                    //   }
                    if (this.values.onescreen_total_imgages_num > 0) {
                        this.values.onescreen_image_index ++;
                        if (this.values.onescreen_image_index >= this.values.onescreen_total_imgages_num) {
                            this.data.dismissLoadingSpiner();
                            this.values.onescreen_image_index = 0;
                            this.values.onescreen_total_imgages_num = 0;
                        }
                    }
            }
            else {
                if (this.values.online) {
                    this.img_src = imageURL;
                    this.cd.markForCheck();
                    this.data.putImage(imageURL).then(() => {
                        this.hidden = false;
                        if (this.values.onescreen_total_imgages_num > 0) {
                            this.values.onescreen_image_index ++;
                            if (this.values.onescreen_image_index >= this.values.onescreen_total_imgages_num) {
                                this.data.dismissLoadingSpiner();
                                this.values.onescreen_image_index = 0;
                                this.values.onescreen_total_imgages_num = 0;
                            }
                        }
                    }).catch((err) => {
                        let blankImageURL = this.values.APIRoot + "/app/get_image.php?image=/app/images/placeholder.png&" + sizeStrArry[0] + "&" + sizeStrArry[1];
                        this.storage.get(blankImageURL).then((image) => {
                            if(image!=null)
                            {
                                if(this.platform.is('cordova')) {
                                    let url = URL.createObjectURL(image);
                                    let fixedUrl: SafeUrl = this.ds.bypassSecurityTrustUrl(url)
                                    this.img_src = <string>fixedUrl;
                                    this.hidden = false 
                                    this.cd.markForCheck();
                                }
                                else {
                                    let fixedUrl: SafeUrl = this.ds.bypassSecurityTrustUrl(<string>image)
                                    this.img_src = <string>fixedUrl;
                                    this.hidden = false;
                                    this.cd.markForCheck();             
                                }
                                if (this.values.onescreen_total_imgages_num > 0) {
                                    this.values.onescreen_image_index ++;
                                    if (this.values.onescreen_image_index >= this.values.onescreen_total_imgages_num) {
                                        this.data.dismissLoadingSpiner();
                                        this.values.onescreen_image_index = 0;
                                        this.values.onescreen_total_imgages_num = 0;
                                    }
                                }
                            }
                            else {
                                this.img_src = blankImageURL;
                                this.data.putImage(blankImageURL).then(() => {
                                    this.hidden = false;
                                    if (this.values.onescreen_total_imgages_num > 0) {
                                        this.values.onescreen_image_index ++;
                                        if (this.values.onescreen_image_index >= this.values.onescreen_total_imgages_num) {
                                            this.data.dismissLoadingSpiner();
                                            this.values.onescreen_image_index = 0;
                                            this.values.onescreen_total_imgages_num = 0;
                                        }
                                    }
                                }).catch((err) => {
                                    this.w_value = sizeStrArry[0].substr(2) + "px";
                                    this.h_value = sizeStrArry[1].substr(2) + "px";
                                    this.hidden = true;
                                    if (this.values.onescreen_total_imgages_num > 0) {
                                        this.values.onescreen_image_index ++;
                                        if (this.values.onescreen_image_index >= this.values.onescreen_total_imgages_num) {
                                            this.data.dismissLoadingSpiner();
                                            this.values.onescreen_image_index = 0;
                                            this.values.onescreen_total_imgages_num = 0;
                                        }
                                    }
                                });     
                            }
                        });                   
                    }); 
                }
            }   
        
        }).catch((error) => {
            console.log(error);
        });
    }

    load(): void {
        this.hidden = false;
    }

    error(): void {
        this.hidden = true;
    }
}