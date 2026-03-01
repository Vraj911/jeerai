import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ProjectCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectCreateModal({ open, onOpenChange }: ProjectCreateModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const generateKey = (val: string) =>
    val.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!key || key === generateKey(name)) {
      setKey(generateKey(value));
    }
  };

  const reset = () => {
    setStep(1);
    setName('');
    setKey('');
    setDescription('');
  };

  const handleSubmit = () => {
    toast({ title: 'Project created', description: name });
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{step === 2 ? 'Create Project — Team' : 'Create Project'}</DialogTitle>
        </DialogHeader>
        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="My Project" autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Key</Label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="PROJ"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">2–6 uppercase characters</p>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project description" rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button size="sm" onClick={() => setStep(2)} disabled={!name.trim() || key.length < 2}>Next</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Team assignment can be configured after project creation.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>Back</Button>
              <Button size="sm" onClick={handleSubmit}>Create Project</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
