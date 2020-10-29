import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab1homePage } from './tab1home.page';

const routes: Routes = [
  {
    path: '',
    component: Tab1homePage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab1homePageRoutingModule {}
