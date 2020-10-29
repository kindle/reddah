import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab2levelPage } from './tab2level.page';

const routes: Routes = [
  {
    path: '',
    component: Tab2levelPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab4PageRoutingModule {}
