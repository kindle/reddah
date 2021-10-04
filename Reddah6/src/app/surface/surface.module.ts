import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SurfacePageRoutingModule } from './surface-routing.module';

import { SurfacePage } from './surface.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SurfacePageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [SurfacePage]
})
export class SurfacePageModule {}
