import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { Values } from '../../values.service';
import circlr from '../../../dev/circlr';  /* based on https://github.com/andrepolischuk/circlr/  */

@Component({
    selector: 'page-view360',
    templateUrl: './view360.component.html',
    styleUrls: ['./view360.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class View360Component implements OnInit {
    productVariants: any;
    imageFrames: any;
    myImageFrames: any;
    ThreeSixtyFrames = [];
    currentItem360: any;
    instanceOfCirclr: any;
    data: any;

    @ViewChild('test3d') view3D: ElementRef;

    constructor(
        public el: ElementRef,
        private cd: ChangeDetectorRef,
        public navParams: NavParams,
        public viewCtrl: PopoverController,
        public values: Values
    ) { }

    ngOnInit() {
        this.productVariants = this.navParams.get("productVariants");
        this.currentItem360 = this.navParams.get("default360");
        this.data = this.navParams.get("data");
        this.ThreeSixtyFrames = [];
        this.myImageFrames = this.values.imageFrames;
        this.change360(this.currentItem360);
    }

    init360() {
        this.instanceOfCirclr = circlr(this.view3D.nativeElement)
            .scroll(true)
            .interval(100)
            .reverse(true);
        let delayMillis = 400;
        setTimeout(() => {
            this.instanceOfCirclr.setCurrent(0).play(23);
        }, delayMillis);

    }

    play(n: number) {
        let delayMillis = 400;
        setTimeout(() => {
            if (this.instanceOfCirclr) this.instanceOfCirclr.setCurrent(0).play(n);
        }, delayMillis);

    }

    change360(newitem360) {
        if (this.ThreeSixtyFrames.length) {
            this.instanceOfCirclr.format();
        }
        let currentItem360 = newitem360;
        this.build360(currentItem360);

        this.data.presentLoadingSpinerSec().then(() => {
            this.data.putThreeSixtyFrames(this.ThreeSixtyFrames).then(res => {
                this.data.dismissLoadingSpiner().then(() => {
                    if (this.instanceOfCirclr === undefined) {
                        this.init360();
                    }
                    else {
                        this.play(23);
                    }                
                }).catch(() => {
                    if (this.instanceOfCirclr === undefined) {
                        this.init360();
                    }
                    else {
                        this.play(23);
                    }
                });;
            })
        });
        
    }

    build360(currentItem360) {
        this.values.imageFrames.forEach((frame, index) => {
            this.ThreeSixtyFrames[index] = this.values.APIRoot + '/app/get_image.php?image=/' + currentItem360 + 'img' + frame + '.jpg&w=480&h=670&zc=3&xtype=360';
        });
    }

    close360() {
        this.viewCtrl.dismiss().catch((err) => { console.log('Problem with spinner:' + err) });
    }
}