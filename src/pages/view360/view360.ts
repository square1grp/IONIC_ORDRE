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
  currentItem360: any;
  ThreeSixtyFrames = [];

  @ViewChild('test3d') view3D: ElementRef;

  constructor(public el: ElementRef, private cd: ChangeDetectorRef, public navParams: NavParams, public viewCtrl: ViewController, public values: Values) {}

  ngOnInit(){
    this.productVariants = this.navParams.get("productVariants");
    this.currentItem360 = this.navParams.get("default360");
    this.myImageFrames = this.values.imageFrames;    
    console.log('Current:'+this.currentItem360);
  }

  ngAfterViewInit() {
    //  https://www.pincer.io/npm/libraries/circlr
    this.change360(this.currentItem360,0);
    this.init360(0);
  }

  init360(delay){
    let delayMillis = delay;
    setTimeout(() => {
      circlr(this.view3D.nativeElement)
        .scroll(true)
        .interval(150)
        .play(23)
        .reverse(true)
    }, delayMillis);
  }

  change360(currentItem360,mode){

    this.values.imageFrames.forEach((frame,index) => {
      this.ThreeSixtyFrames[index] = this.values.APIRoot + '/app/get_image.php?image=/' + currentItem360 + 'img' + frame + '.jpg&w=480&h=670&zc=3&xtype=360'
    });  
    this.cd.markForCheck();
    //if(mode){circlr(this.view3D.nativeElement).unbind();} //unbind doesn't do enough
    //this.init360(1000) // re-init breaks it
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
