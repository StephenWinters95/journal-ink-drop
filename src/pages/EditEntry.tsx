
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, PenTool } from "lucide-react";

interface JournalEntryType {
  id: string;
  content: string;
  date: string;
  title?: string;
}

const EditEntry = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entry, setEntry] = useState<JournalEntryType | null>(null);

  useEffect(() => {
    // Load the specific entry from localStorage
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries && id) {
      const entries: JournalEntryType[] = JSON.parse(savedEntries);
      const foundEntry = entries.find(entry => entry.id === id);
      if (foundEntry) {
        setEntry(foundEntry);
        setTitle(foundEntry.title || '');
        setContent(foundEntry.content);
      } else {
        toast({
          title: "Entry not found",
          description: "The journal entry could not be found.",
          variant: "destructive",
        });
        navigate('/journal');
      }
    }
  }, [id, navigate, toast]);

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

    if (!entry) return;

    setIsSubmitting(true);

    const updatedEntry = {
      ...entry,
      title: title.trim() || undefined,
      content: content.trim(),
    };

    // Update the entry in localStorage
    const existingEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const updatedEntries = existingEntries.map((e: JournalEntryType) => 
      e.id === entry.id ? updatedEntry : e
    );
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));

    toast({
      title: "Entry updated!",
      description: "Your journal entry has been successfully updated.",
    });

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/journal');
    }, 500);
  };

  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/journal">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Journal
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Edit Entry</h1>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-purple-600" />
              Edit Your Thoughts
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
                  {isSubmitting ? 'Updating...' : 'Update Entry'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditEntry;
