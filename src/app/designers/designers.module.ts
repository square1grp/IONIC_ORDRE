import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';

import { DesignersPage } from './designers.page';
// import { OrdreHeader } from '../pages/header/header';

const routes: Routes = [
  {
    path: '',
    component: DesignersPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DesignersPage]
})
export class DesignersPageModule {}
