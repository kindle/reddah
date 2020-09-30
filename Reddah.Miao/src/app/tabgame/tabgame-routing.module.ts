import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabGamePage } from './tabgame.page';

const routes: Routes = [
  {
    path: '',
    component: TabGamePage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabGamePageRoutingModule {}
