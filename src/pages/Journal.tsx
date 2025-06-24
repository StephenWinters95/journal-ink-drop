
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, BookOpen, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import JournalEntry from "@/components/JournalEntry";

interface JournalEntryType {
  id: string;
  content: string;
  date: string;
  title?: string;
}

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntryType[]>([]);

  useEffect(() => {
    // Load entries from localStorage
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">My Journal</h1>
          </div>
          <Link to="/journal/new">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </Link>
        </div>

        {entries.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No entries yet</h3>
            <p className="text-gray-500 mb-6">Start your journaling journey by creating your first entry!</p>
            <Link to="/journal/new">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Write First Entry
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {entries
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry) => (
                <JournalEntry
                  key={entry.id}
                  entry={entry}
                  onDelete={deleteEntry}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
