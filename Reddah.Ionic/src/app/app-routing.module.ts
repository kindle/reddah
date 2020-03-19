import { NgModule } from '@angular/core';
import { PreloadAllModules, Routes, RouterModule } from '@angular/router';
import { SelectiveStrategyService } from './selective-strategy.service';
import { MyTimeLinePage } from './mytimeline/mytimeline.page';
import { AuthGuard } from './AuthGuard.service';
import { SearchPage } from './common/search/search.page';
import { SurfacePage } from './surface/surface.page';

const routes: Routes = [
    { 
        path: '', 
        loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
        //canActivateChild: [AuthGuard]
        //canActivate: [AuthGuard],
    },
    { 
        path: 'surface', 
        loadChildren: () => import('./surface/surface.module').then(m => m.SurfacePageModule),
        component: SurfacePage 
    },
    { 
        path: 'mytimeline', 
        //loadChildren: () => import('./mytimeline/mytimeline.module').then(m => m.MyTimeLinePageModule),
        component: MyTimeLinePage,
        canActivate: [AuthGuard],
    },
    { 
        path: 'search', 
        //loadChildren: () => import('./common/search/search.module').then(m => m.SearchPageModule),
        component: SearchPage,
        canActivate: [AuthGuard],
    },
    /*{ 
        path: 'scan',
        component: ScanPage,
    },
    { 
        path: 'post',
        component: AddTimelinePage,
    },*/
  
];
@NgModule({
    imports: [
        //RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
        RouterModule.forRoot(routes, { 
            preloadingStrategy: SelectiveStrategyService,
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
