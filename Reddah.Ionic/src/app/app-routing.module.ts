import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SelectiveStrategyService } from './selective-strategy.service';
import { LoginPage } from './login/login.page';
import { ScanPage } from './scan/scan.page';
import { MyTimeLinePage } from './mytimeline/mytimeline.page';
import { AddTimelinePage } from './add-timeline/add-timeline.page';
import { AuthGuard } from './AuthGuard.service';

const routes: Routes = [
    { 
        path: '', 
        loadChildren: './tabs/tabs.module#TabsPageModule',
        //canActivateChild: [AuthGuard]
        //canActivate: [AuthGuard],
    },
    { 
        path: 'login', 
        component: LoginPage 
    },
    { 
        path: 'mytimeline', 
        component: MyTimeLinePage,
        canActivate: [AuthGuard],
    },
    { 
        path: 'scan',
        component: ScanPage,
    },
    /*{ 
        path: 'post',
        component: AddTimelinePage,
    },*/
  
];
@NgModule({
    imports: [RouterModule.forRoot(routes, { 
        preloadingStrategy: SelectiveStrategyService,
    })],
    exports: [RouterModule]
})
export class AppRoutingModule {}
