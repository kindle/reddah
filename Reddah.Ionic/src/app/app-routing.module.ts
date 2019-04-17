import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SelectiveStrategyService } from './selective-strategy.service';
import { LoginPage } from './login/login.page';
import { ScanPage } from './scan/scan.page';
import { TimeLinePage } from './timeline/timeline.page';
import { AuthGuard } from './AuthGuard.service';
import { UserPage } from './user/user.page';

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
      path: 'timeline', 
      component: TimeLinePage,
      canActivate: [AuthGuard],
  },
  { 
      path: 'scan', 
      component: ScanPage,
  },
  { 
      path: 'user', 
      component: UserPage,
  },
  { 
      path: 'post', 
      loadChildren: './add-timeline/add-timeline.module#AddTimelinePageModule',
      canActivate: [AuthGuard],
  },
  
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: SelectiveStrategyService })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
