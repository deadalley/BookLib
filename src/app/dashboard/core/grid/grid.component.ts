import {
  Component,
  OnInit,
  Input,
  ContentChild,
  TemplateRef,
} from '@angular/core'

@Component({
  moduleId: module.id,
  // tslint:disable-next-line:component-selector
  selector: 'grid',
  templateUrl: 'grid.component.html',
  styleUrls: [],
})
export class GridComponent implements OnInit {
  @Input() items: any[]
  @Input() itemsInRow = 4

  @ContentChild(TemplateRef, { static: false }) contentTemplate

  gridColumns = {}

  ngOnInit() {
    const divider = `col-md-${12 / this.itemsInRow}`
    this.gridColumns[divider] = true
  }
}
