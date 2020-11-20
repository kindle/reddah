import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab5TestPage } from './tab5test.page';

const routes: Routes = [
  {
    path: '',
    component: Tab5TestPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab5TestPageRoutingModule {}
