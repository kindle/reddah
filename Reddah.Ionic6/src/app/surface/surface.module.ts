import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SurfacePage } from './surface.page';

const routes: Routes = [
  {
    path: '',
    component: SurfacePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  providers:[
        //{ provide: HAMMER_GESTURE_CONFIG, useClass: IonicGestureConfig }
  ]
})
export class SurfacePageModule {}
