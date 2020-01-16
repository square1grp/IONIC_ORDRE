import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SharedModule } from '../shared/shared.module';
import { CollectionPage } from './collection.page';
import { ViewloaderComponent } from '../shared/viewloader/viewloader.component';

const routes: Routes = [
    {
        path: '',
        component: CollectionPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        // ReactiveFormsModule,
        IonicModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        CollectionPage,
        ViewloaderComponent
    ]
})
export class CollectionPageModule {}
