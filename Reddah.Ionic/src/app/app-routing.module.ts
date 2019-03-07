import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SelectiveStrategyService } from './selective-strategy.service';
import { LoginPage } from './login/login.page';

const routes: Routes = [
  { 
    path: '', 
    loadChildren: './tabs/tabs.module#TabsPageModule',
    //canActivateChild: [AuthGuard]
    //canActivate: [AuthGuard],
  },
  { path: 'login', component: LoginPage },
  
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: SelectiveStrategyService })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
