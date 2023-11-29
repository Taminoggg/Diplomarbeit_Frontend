import { Routes } from '@angular/router';
import { ContainerToolFunctionComponent } from './container-tool-function/container-tool-function.component';
import { FunctionOverviewPageComponent } from './function-overview-page/function-overview-page.component';
import { ShippmentRequestComponent } from './shippment-request/shippment-request.component';
import { ContainerRequestPageComponent } from './container-request-page/container-request-page.component';
import { NewOrderPageComponent } from './new-order-page/new-order-page.component';
import { EditOrderPageComponent } from './edit-order-page/edit-order-page.component';

export const routes: Routes = [
  {path:'', redirectTo: '/function-overview-age', pathMatch: 'full'},
  {path:'container-request-page', component: ContainerRequestPageComponent},
  {path:'new-order-page', component: NewOrderPageComponent},
  {path:'edit-order-page/:id', component: EditOrderPageComponent},
  {path:'function-overview-age', component: FunctionOverviewPageComponent},
  {path:'shippment-request-page', component: ShippmentRequestComponent}
];
