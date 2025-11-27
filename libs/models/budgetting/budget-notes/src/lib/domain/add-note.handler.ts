
import { AddNoteToBudgetCommand } from './add-note.command';



export interface ICommandHandler<TCommand, TResult = void> {
  execute(command: TCommand): Promise<TResult>;
}


export interface AddNoteToBudgetResult {
  success: boolean;
  noteId?: string;
  error?: string;
}


export abstract class FunctionHandler<TCommand, TResult> implements ICommandHandler<TCommand, TResult> {
  abstract execute(command: TCommand): Promise<TResult>;
}


export class AddNoteToBudgetHandler
  extends FunctionHandler<AddNoteToBudgetCommand, AddNoteToBudgetResult> {

  async execute(command: AddNoteToBudgetCommand): Promise<AddNoteToBudgetResult> {

    if (!command.content?.trim()) {
      return { success: false, error: 'Note content cannot be empty' };
    }

  
    if (!command.budgetId?.trim()) {
      return { success: false, error: 'Budget ID is required' };
    }

    
    if (!command.userId?.trim()) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      
      const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      return {
        success: true,
        noteId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
