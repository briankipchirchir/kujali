import { 
  Component, 
  inject, 
  signal, 
  computed, 
  effect,
  ChangeDetectionStrategy 
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { cloneDeep as ___cloneDeep, flatMap as __flatMap } from 'lodash';
import { combineLatest, map } from 'rxjs';

import { Logger } from '@iote/bricks-angular';

import { 
  Budget, 
  BudgetRecord, 
  BudgetStatus, 
  OrgBudgetsOverview 
} from '@app/model/finance/planning/budgets';

import { 
  BudgetsStore, 
  OrgBudgetsStore 
} from '@app/state/finance/budgetting/budgets';

import { CreateBudgetModalComponent } from '../../components/create-budget-modal/create-budget-modal.component';

interface BudgetView {
  overview: BudgetRecord[];
  budgets: any[];
}

@Component({
  selector: 'app-select-budget',
  templateUrl: './select-budget.component.html',
  styleUrls: ['./select-budget.component.scss', 
              '../../components/budget-view-styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectBudgetPageComponent {
  private _orgBudgets$$ = inject(OrgBudgetsStore);
  private _budgets$$ = inject(BudgetsStore);
  private _dialog = inject(MatDialog);
  private _logger = inject(Logger);

  
  overview = signal<OrgBudgetsOverview | null>(null);
  sharedBudgets = signal<any[]>([]);
  allBudgets = signal<BudgetView>({ overview: [], budgets: [] });
  isLoading = signal(true);

  
  budgetCount = computed(() => this.allBudgets().budgets.length);
  hasBudgets = computed(() => this.budgetCount() > 0);
  hasSharedBudgets = computed(() => this.sharedBudgets().length > 0);

  showFilter = signal(false);

  constructor() {
    
    effect(() => {
      this._orgBudgets$$.get().subscribe({
        next: (data) => {
          this.overview.set(data);
        }
      });
    });

    
    effect(() => {
      this._budgets$$.get().subscribe({
        next: (data) => {
          this.sharedBudgets.set(data);
        }
      });
    });

    
    effect(() => {
      combineLatest([
        this._orgBudgets$$.get(),
        this._budgets$$.get()
      ]).pipe(
        map(([overview, budgets]) => ({
          overview: __flatMap(overview),
          budgets: __flatMap(budgets)
        })),
        map((data) => {
          const transformedBudgets = data.budgets.map((budget: any) => ({
            ...budget,
            endYear: budget.startYear + budget.duration - 1
          }));
          return {
            overview: data.overview,
            budgets: transformedBudgets
          };
        })
      ).subscribe({
        next: (data) => {
          this.allBudgets.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this._logger.error(() => `Failed to load budgets: ${err.message}`);
          this.isLoading.set(false);
        }
      });
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
  }

  fieldsFilter(value: (Invoice) => boolean) {    
  }

  toggleFilter(value: boolean) {
    this.showFilter.set(value);
  }

  openDialog(parent: Budget | false): void {
    const dialog = this._dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent != null ? parent : false
    });

    dialog.afterClosed().subscribe(() => {
    });
  }

  canPromote(record: BudgetRecord): boolean {
    return (record.budget as any).canBeActivated;
  }

  setActive(record: BudgetRecord) {
    const toSave = ___cloneDeep(record.budget);

    delete (toSave as any).canBeActivated;
    delete (toSave as any).access;

    toSave.status = BudgetStatus.InUse;

    (<any>record).updating = true;

    this._budgets$$.update(toSave).subscribe({
      next: () => {
        (<any>record).updating = false;
        this._logger.log(() => 
          `Updated Budget with id ${toSave.id}. Set as an active budget for this org.`
        );
      },
      error: (err) => {
        (<any>record).updating = false;
        this._logger.error(() => `Failed to update budget: ${err.message}`);
      }
    });
  }
}