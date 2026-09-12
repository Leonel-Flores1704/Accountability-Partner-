import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { Tab2Page } from './tab2.page';
import { Tab2RoutingModule } from './tab2-routing.module';

@NgModule({
  declarations: [Tab2Page],
  imports: [CommonModule, IonicModule, Tab2RoutingModule]
})
export class Tab2PageModule {}
