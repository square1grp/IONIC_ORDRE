import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { Values } from '../../providers/values';

import circlr from 'circlr';

@Component({
    templateUrl: 'view360.html',
    changeDetection: ChangeDetectionStrategy.OnPush 
})

export class View360Page {
  productVariants: any;
  imageFrames: any;
  myImageFrames: any;
  ThreeSixtyFrames: any;
  currentItem360: any;

  @ViewChild('test3d') view3D: ElementRef;

  constructor(public el: ElementRef, private cd: ChangeDetectorRef, public navParams: NavParams, public viewCtrl: ViewController, public values: Values) {}

  ngOnInit(){
    this.productVariants = this.navParams.get("productVariants");
    //console.log(JSON.stringify(this.productVariants))
    this.currentItem360 = this.navParams.get("default360");
    this.ThreeSixtyFrames = [];
    this.myImageFrames = this.values.imageFrames;    
    //this.cd.markForCheck();
    this.change360(this.currentItem360);
    console.log('Current:'+this.currentItem360);
  }

  ngAfterViewInit() {
    //  https://www.pincer.io/npm/libraries/circlr
    //console.log('Init circlr')  
    this.init360();

  }

  init360(){
    circlr(this.view3D.nativeElement)
      .scroll(true)
      .interval(150)
      .play(23)
      .reverse(true)
      .on('show', n => {
      });
  }

  change360(newitem360){
    //circlr(this.view3D.nativeElement).unbind();
    //this.ThreeSixtyFrames = [];
    //this.cd.markForCheck();
    console.log('360 Changed to:'+newitem360)  
    //this.myImageFrames = [];
    //this.cd.markForCheck();
    this.currentItem360 = newitem360;

    //this.cd.markForCheck();
    let delayMillis = 1000;
    this.build360(newitem360) 
    setTimeout(() => {    
        this.init360();
      //this.cd.markForCheck();
    }, delayMillis);
    
    //this.cd.markForCheck();
    //console.log('Make New')
  }

  build360(currentItem360){
    this.ThreeSixtyFrames = [];
    this.values.imageFrames.forEach((frame) => {
      this.ThreeSixtyFrames.push(this.values.APIRoot + '/app/get_image.php?image=/' + currentItem360 + 'img' + frame + '.jpg&w=480&h=670&zc=3&xtype=360')
      //{{values.APIRoot}}/app/get_image.php?image=/{{currentItem360}}img{{image}}.jpg&w=480&h=670&zc=3&xtype=360
    });  
    console.log(JSON.stringify(this.ThreeSixtyFrames))
    this.cd.markForCheck();
  }

  close360(){
    this.viewCtrl.dismiss().catch((err) => {console.log('Problem with spinner:'+err)});
  }

  /*
  range1(j){
    let x=[];
    let i=1;
    while(x.push(i++)<j){};
    return x
  }
  */
}
