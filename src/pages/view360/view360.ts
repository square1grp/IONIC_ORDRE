import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { Values } from '../../providers/values';
//import circlr from 'circlr';
import circlr from '../../dev/circlr';  /* based on https://github.com/andrepolischuk/circlr/  */

@Component({
    templateUrl: 'view360.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class View360Page {
  productVariants: any;
  imageFrames: any;
  myImageFrames: any;
  ThreeSixtyFrames = [];
  currentItem360: any;
  instanceOfCirclr: any;

  @ViewChild('test3d') view3D: ElementRef;

  constructor(public el: ElementRef, private cd: ChangeDetectorRef, public navParams: NavParams, public viewCtrl: ViewController, public values: Values) {}

  ngOnInit(){
    this.productVariants = this.navParams.get("productVariants");
    this.currentItem360 = this.navParams.get("default360");
    this.ThreeSixtyFrames = [];
    this.myImageFrames = this.values.imageFrames;
    this.change360(this.currentItem360);
  }
  init360(){
    let delayMillis = 500;
    setTimeout(() => {
       this.instanceOfCirclr = circlr(this.view3D.nativeElement)
          .scroll(true)
          .interval(120)
          .reverse(true);
       this.instanceOfCirclr.setCurrent(0).play(23);
    }, delayMillis);
    
  }
  play(n:number){
    let delayMillis = 1;
    setTimeout(() => {
       if(this.instanceOfCirclr) this.instanceOfCirclr.setCurrent(0).play(n);
    }, delayMillis);
    
  }
 
  change360(newitem360){
      if (this.ThreeSixtyFrames.length){
          this.instanceOfCirclr.format();
      }
      let currentItem360 = newitem360;
      // if (this.currentItem360 == newitem360)
      // {
          this.build360(currentItem360);
      // }
      if(this.instanceOfCirclr === undefined)
      {
        this.init360();
      }
      else
      {
        this.play(23);
      }
  }

  build360(currentItem360){
      this.values.imageFrames.forEach((frame,index) => {
          this.ThreeSixtyFrames[index] = this.values.APIRoot + '/app/get_image.php?image=/' + currentItem360 + 'img' + frame + '.jpg&w=480&h=670&zc=3&xtype=360';
      });
  }

  close360(){
    this.viewCtrl.dismiss().catch((err) => {console.log('Problem with spinner:'+err)});
  }

}