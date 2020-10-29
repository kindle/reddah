import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab4taskPage } from './tab4task.page';

const routes: Routes = [
  {
    path: '',
    component: Tab4taskPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab5taskPageRoutingModule {}
