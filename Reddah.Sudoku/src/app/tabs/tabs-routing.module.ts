import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1home',
        loadChildren: () => import('../tab1home/tab1home.module').then(m => m.Tab1homePageModule)
      },
      {
        path: 'tab2level',
        loadChildren: () => import('../tab2level/tab2level.module').then(m => m.Tab4PageModule)
      },
      {
        path: 'tab3list',
        loadChildren: () => import('../tab3list/tab3list.module').then(m => m.Tab3listPageModule)
      },
      {
        path: 'tab4task',
        loadChildren: () => import('../tab4task/tab4task.module').then(m => m.Tab5taskPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/tab1home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
