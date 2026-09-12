import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreContainerComponent } from './explore-container.component';

@NgModule({
  declarations: [ExploreContainerComponent],
  exports: [ExploreContainerComponent],
  imports: [CommonModule]
})
export class ExploreContainerComponentModule {}
