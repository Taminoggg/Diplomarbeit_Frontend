import { Routes } from '@angular/router';
import { ContainerToolFunctionComponent } from './container-tool-function/container-tool-function.component';
import { FunctionOverviewPageComponent } from './function-overview-page/function-overview-page.component';
import { ShippmentRequestComponent } from './shippment-request/shippment-request.component';
import { ContainerRequestPageComponent } from './container-request-page/container-request-page.component';

export const routes: Routes = [
  {path:'', redirectTo: '/function-overview-age', pathMatch: 'full'},
  {path:'container-request-page', component: ContainerRequestPageComponent},
  {path:'function-overview-age', component: FunctionOverviewPageComponent},
  {path:'shippment-request-page', component: ShippmentRequestComponent}
];
