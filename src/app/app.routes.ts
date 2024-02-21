import { Routes } from '@angular/router';
import { FunctionOverviewPageComponent } from './function-overview-page/function-overview-page.component';
import { ContainerRequestPageComponent } from './conainter-request/container-request-page/container-request-page.component';
import { NewContainerOrderPageComponent } from './conainter-request/new-order-page-cs/new-container-request-order-page.component';
import { EditCsContainerRequestOrderPageComponent } from './conainter-request/edit-order-page-cr-cs/edit-cs-container-request-order-page.component';
import { ChatForOrderComponent } from './chat-for-order/chat-for-order.component';
import { EditTlContainerRequestOrderPageComponent } from './conainter-request/edit-order-page-cr-tl/edit-tl-container-request-order-page.component';
import { EditCsProductionPlanningOrderPageComponent } from './conainter-request/edit-order-page-pp-cs/edit-cs-production-planning-order-page.component';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EditPPProductionPlanningOrderPageComponent } from './conainter-request/edit-order-page-pp-pp/edit-pp-production-planning-order-page.component';


export const routes: Routes = [
  { path: '', redirectTo: '/function-overview-age', pathMatch: 'full' },
  { path: 'container-request-page/:htmlContent', component: ContainerRequestPageComponent },
  { path: 'new-container-order-page', component: NewContainerOrderPageComponent },
  { path: 'edit-cs-container-order-page/:id', component: EditCsContainerRequestOrderPageComponent },
  { path: 'edit-tl-container-order-page/:id', component: EditTlContainerRequestOrderPageComponent },
  { path: 'edit-cs-production-planning-order-page/:id', component: EditCsProductionPlanningOrderPageComponent },
  { path: 'edit-pp-production-planning-order-page/:id', component: EditPPProductionPlanningOrderPageComponent },
  { path: 'function-overview-age', component: FunctionOverviewPageComponent },
  { path: 'admin-page', component: AdminComponent },
  { path: 'dashboard-page', component: DashboardComponent },
  { path: 'chat-for-order/:id', component: ChatForOrderComponent },
];
