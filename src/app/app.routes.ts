import { Routes } from '@angular/router';
import { FunctionOverviewPageComponent } from './function-overview-page/function-overview-page.component';
import { ContainerRequestPageComponent } from './conainter-request/container-request-page/container-request-page.component';
import { EditOrAddCsContainerRequestOrderPageComponent } from './conainter-request/edit-or-add-order-page-cr-cs/edit-or-add-cs-container-request-order-page.component';
import { ChatForOrderComponent } from './chat-for-order/chat-for-order.component';
import { EditTlContainerRequestOrderPageComponent } from './conainter-request/edit-order-page-cr-tl/edit-tl-container-request-order-page.component';
import { EditOrAddCsProductionPlanningOrderPageComponent } from './conainter-request/edit-or-add-order-page-pp-cs/edit-or-add-cs-production-planning-order-page.component';
import { AdminComponent } from './admin/admin.component';
import { EditPPProductionPlanningOrderPageComponent } from './conainter-request/edit-order-page-pp-pp/edit-pp-production-planning-order-page.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: '/function-overview-age', pathMatch: 'full' },
  { path: 'container-request-page/:htmlContent', component: ContainerRequestPageComponent },
  { path: 'cs-container-order-page/:actionType/:id', component: EditOrAddCsContainerRequestOrderPageComponent },
  { path: 'edit-tl-container-order-page/:id', component: EditTlContainerRequestOrderPageComponent },
  { path: 'cs-production-planning-order-page/:actionType/:id', component: EditOrAddCsProductionPlanningOrderPageComponent },
  { path: 'edit-pp-production-planning-order-page/:id', component: EditPPProductionPlanningOrderPageComponent },
  { path: 'function-overview-age', component: FunctionOverviewPageComponent },
  { path: 'admin-page', component: AdminComponent },
  { path: 'settings-page/:htmlContent', component: SettingsComponent },
  { path: 'chat-for-order/:htmlContent/:id', component: ChatForOrderComponent },
];
