import { 
  Component, 
  inject, 
  input, 
  output,
  viewChild,
  ChangeDetectionStrategy,
  effect
} from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';

import { Budget, BudgetRecord } from '@app/model/finance/planning/budgets';

import { ShareBudgetModalComponent } from '../share-budget-modal/share-budget-modal.component';
import { CreateBudgetModalComponent } from '../create-budget-modal/create-budget-modal.component';
import { ChildBudgetsModalComponent } from '../../modals/child-budgets-modal/child-budgets-modal.component';

interface BudgetData {
  overview: BudgetRecord[];
  budgets: any[];
}

@Component({
  selector: 'app-budget-table',
  templateUrl: './budget-table.component.html',
  styleUrls: ['./budget-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetTableComponent {
  private _router = inject(Router);
  private _dialog = inject(MatDialog);

  
  budgets = input<BudgetData>({ overview: [], budgets: [] });
  canPromote = input(false);

  doPromote = output<void>();

  
  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['name', 'status', 'startYear', 'duration', 'actions'];

  constructor() {
    
    effect(() => {
      const budgetData = this.budgets();
      this.dataSource.data = budgetData.budgets;
    });

  
    effect(() => {
      const pag = this.paginator();
      const srt = this.sort();
      if (pag && srt) {
        this.dataSource.paginator = pag;
        this.dataSource.sort = srt;
      }
    });
  }

  access(requested: string): boolean {
    switch (requested) {
      case 'view':
      case 'clone':
        return true;
      case 'edit':
        return true;
    }
    return false;
  }

  filterAccountRecords(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  promote() {
    if (this.canPromote()) {
      this.doPromote.emit();
    }
  }

  
  openShareBudgetDialog(parent: Budget | false): void {
    this._dialog.open(ShareBudgetModalComponent, {
      panelClass: 'no-pad-dialog',
      width: '600px',
      data: parent != null ? parent : false
    });
  }


  openCloneBudgetDialog(parent: Budget | false): void {
    this._dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent != null ? parent : false
    });
  }

  openChildBudgetDialog(parent: Budget): void {
    const budgetData = this.budgets();
    let children: any = budgetData.overview.find(
      (budget) => budget.budget.id === parent.id
    )?.children;

    children = children?.map((child) => child.budget);

    this._dialog.open(ChildBudgetsModalComponent, {
      height: 'fit-content',
      minWidth: '600px',
      data: { parent: parent, budgets: children }
    });
  }

  goToDetail(budgetId: string, action: string) {
    this._router.navigate(['budgets', budgetId, action]).then(() => {
      this._dialog.closeAll();
    });
  }

  deleteBudget(budget: Budget) {
  
  }

  translateStatus(status: number): string {
    switch (status) {
      case 1:
        return 'BUDGET.STATUS.ACTIVE';
      case 0:
        return 'BUDGET.STATUS.DESIGN';
      case 9:
        return 'BUDGET.STATUS.NO-USE';
      case -1:
        return 'BUDGET.STATUS.DELETED';
      default:
        return '';
    }
  }
}