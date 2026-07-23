import { Button } from '@app/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/Dialog';
import type { TaskDeleteDialogProps } from '@app/types/tasks';

export function TaskDeleteDialog({ taskId, onOpenChange, onConfirm }: TaskDeleteDialogProps) {
  return (
    <Dialog open={!!taskId} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task?</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (taskId) onConfirm(taskId);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
