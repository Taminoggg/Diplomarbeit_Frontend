import { Routes } from '@angular/router';
import { FunctionOverviewPageComponent } from './function-overview-page/function-overview-page.component';
import { ContainerRequestPageComponent } from './conainter-request/container-request-page/container-request-page.component';
import { NewContainerOrderPageComponent } from './conainter-request/new-order-page-cs/new-container-request-order-page.component';
import { EditContainerOrderPageComponent } from './conainter-request/edit-order-page-cs/edit-container-request-order-page.component';
import { EditShippmentOrderPageComponent } from './conainter-request/edit-order-page-tl/edit-shippment-request-order-page.component';
import { ChatForOrderComponent } from './chat-for-order/chat-for-order.component';
import { ShippmentRequestComponent } from './shippment-request/shippment-request-page/shippment-request-page.component';


export const routes: Routes = [
  { path: '', redirectTo: '/function-overview-age', pathMatch: 'full' },
  { path: 'container-request-page/:showCs', component: ContainerRequestPageComponent },
  { path: 'new-container-order-page', component: NewContainerOrderPageComponent },
  { path: 'edit-container-order-page/:id', component: EditContainerOrderPageComponent },
  { path: 'edit-shippment-order-page/:id', component: EditShippmentOrderPageComponent },
  { path: 'function-overview-age', component: FunctionOverviewPageComponent },
  { path: 'shippment-request-page', component: ShippmentRequestComponent },
  { path: 'chat-for-order/:id', component: ChatForOrderComponent },
];
