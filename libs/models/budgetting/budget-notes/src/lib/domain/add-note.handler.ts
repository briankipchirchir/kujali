import { AddNoteToBudgetCommand } from './add-note.command';

export interface ICommandHandler<TCommand> {
  execute(command: TCommand): Promise<void>;
}


export interface AddNoteToBudgetResult {
  success: boolean;
  noteId?: string;
  error?: string;
}


export class AddNoteToBudgetHandler {
  async execute(command: AddNoteToBudgetCommand): Promise<AddNoteToBudgetResult> {
    
    if (!command.content || command.content.trim().length === 0) {
      return {
        success: false,
        error: 'Note content cannot be empty'
      };
    }

    
    if (!command.budgetId || command.budgetId.trim().length === 0) {
      return {
        success: false,
        error: 'Budget ID is required'
      };
    }

    
    if (!command.userId || command.userId.trim().length === 0) {
      return {
        success: false,
        error: 'User ID is required'
      };
    }

    try {
      
      const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
