import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { Tab3Page } from './tab3.page';
import { Tab3RoutingModule } from './tab3-routing.module';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

@NgModule({
  declarations: [Tab3Page],
  imports: [CommonModule, IonicModule, Tab3RoutingModule, ExploreContainerComponentModule]
})
export class Tab3PageModule {}
