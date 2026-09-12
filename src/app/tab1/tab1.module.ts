import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { Tab1Page } from './tab1.page';
import { Tab1RoutingModule } from './tab1-routing.module';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

@NgModule({
  declarations: [Tab1Page],
  imports: [CommonModule, IonicModule, Tab1RoutingModule, ExploreContainerComponentModule]
})
export class Tab1PageModule {}
