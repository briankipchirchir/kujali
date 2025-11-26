
export class AddNoteToBudgetCommand {
  constructor(
    public readonly budgetId: string,
    public readonly content: string,
    public readonly userId: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
