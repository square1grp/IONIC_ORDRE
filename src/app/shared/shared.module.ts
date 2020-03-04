import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { LinesheetComponent } from './linesheet/linesheet.component';
import { ImageCacheComponent } from './image-cache/image-cache.component';

@NgModule({
	declarations: [
		HeaderComponent,
		ImageCacheComponent,
		LinesheetComponent
	],
	exports: [
		HeaderComponent,
		ImageCacheComponent,
		LinesheetComponent
	],
	imports: [
		CommonModule,
		IonicModule
	]
})
export class SharedModule { }
