import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UserHomePageRoutingModule } from './user-home-routing.module';
import { UserHomePage } from './user-home.page';

@NgModule({
  declarations: [UserHomePage],
  imports: [CommonModule, IonicModule, UserHomePageRoutingModule]
})
export class UserHomePageModule {}
