import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { ImageCacheComponent } from './image-cache/image-cache.component';

@NgModule({
	declarations: [
		HeaderComponent,
		ImageCacheComponent
	],
	exports: [
		HeaderComponent,
		ImageCacheComponent
	],
	imports: [
		CommonModule,
		IonicModule
	]
})
export class SharedModule { }
