import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxButtonComponent, DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxTreeListComponent, DxTreeListModule } from 'devextreme-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GridComponent } from './grid/grid.component';
import { SecurityNodeComponent } from './security-node/security-node.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoinSaleComponent } from './coin-sale/coin-sale.component';

@NgModule({
  declarations: [
    AppComponent,
    GridComponent,
    SecurityNodeComponent,
    ContactUsComponent,
    CoinSaleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DxDataGridModule,
    DxTreeListModule,
    DxCheckBoxModule,
    DxButtonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
