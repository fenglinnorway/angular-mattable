import { NgModule } from '@angular/core';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatSortModule } from '@angular/material';

@NgModule({
   imports: [
      MatTableModule,
      MatPaginatorModule,
      MatSortModule
   ],
   exports: [
      MatTableModule,
      MatPaginatorModule,
      MatSortModule
   ]
})

export class AngularMaterialModule { }