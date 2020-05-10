import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';
import { AuthGuard } from '../AuthGuard.service';
import { PublisherPage } from './publisher/publisher.page';

const routes: Routes = [
    {
        path: 'tabs',
        component: TabsPage,
        children: [
            {
                path: '',
                redirectTo: '/tabs/home',
                pathMatch: 'full',
            },
            {
                path: 'home',
                //outlet: 'home',
                children: [
                    {
                    path: '',
                    loadChildren: () =>
                        import('../tabs/home/home.module').then(m => m.HomePageModule)
                    }
                ],
                canActivate: [AuthGuard],
            },
            {
                path: 'contact',
                //outlet: 'contact',
                children: [
                    {
                    path: '',
                    loadChildren: () =>
                        import('../tabs/contact/contact.module').then(m => m.ContactPageModule)
                    }
                ],
                canActivate: [AuthGuard],
            },
            {
                path: 'find',
                //outlet: 'find',
                children: [
                    {
                    path: '',
                    loadChildren: () =>
                        import('../tabs/find/find.module').then(m => m.FindPageModule)
                    }
                ],
                canActivate: [AuthGuard],
            },
            {
                path: 'about',
                //outlet: 'about',
                children: [
                    {
                    path: '',
                    loadChildren: () =>
                        import('../tabs/about/about.module').then(m => m.AboutPageModule)
                    }
                ],
                canActivate: [AuthGuard],
            },
            {
                path: 'publisher',
                outlet: 'publisher',
                component: PublisherPage,
                canActivate: [AuthGuard],
            }
        ]
    },
    {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TabsPageRoutingModule {}
