import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab3listPage } from './tab3list.page';

const routes: Routes = [
  {
    path: '',
    component: Tab3listPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab3listPageRoutingModule {}
