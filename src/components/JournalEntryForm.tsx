
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Save, PenTool } from "lucide-react";

const JournalEntryForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something in your journal entry.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const newEntry = {
      id: Date.now().toString(),
      title: title.trim() || undefined,
      content: content.trim(),
      date: new Date().toISOString(),
    };

    // Save to localStorage (will be replaced with Supabase later)
    const existingEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const updatedEntries = [newEntry, ...existingEntries];
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));

    toast({
      title: "Entry saved!",
      description: "Your journal entry has been successfully saved.",
    });

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/journal');
    }, 500);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="w-5 h-5 text-purple-600" />
          Write Your Thoughts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              type="text"
              placeholder="Give your entry a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your Journal Entry *</Label>
            <Textarea
              id="content"
              placeholder="Write as much as you'd like... Share your thoughts, feelings, experiences, or anything that's on your mind."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] text-base leading-relaxed resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/journal')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JournalEntryForm;
