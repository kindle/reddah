import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';
import { HomePage } from './home/home.page';
import { AboutPage } from './about/about.page';
import { FindPage } from './find/find.page';
import { ContactPage } from './contact/contact.page';
//import { MessagePage } from './message/message.page';
import { AuthGuard } from '../AuthGuard.service';
import { PublisherPage } from './publisher/publisher.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: '/tabs/(home:home)',
        pathMatch: 'full',
      },
      /*{
        path: 'message',
        outlet: 'message',
        component: MessagePage,
        canActivate: [AuthGuard],
      },*/
      {
        path: 'home',
        outlet: 'home',
        component: HomePage,
        canActivate: [AuthGuard],
      },
      {
        path: 'contact',
        outlet: 'contact',
        component: ContactPage,
        canActivate: [AuthGuard],
      },
      {
        path: 'find',
        outlet: 'find',
        component: FindPage,
        canActivate: [AuthGuard],
      },
      {
        path: 'about',
        outlet: 'about',
        component: AboutPage,
        canActivate: [AuthGuard],
      },
      {
        path: 'publisher',
        outlet: 'publisher',
        component: PublisherPage,
        canActivate: [AuthGuard],
      },
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/(home:home)',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
