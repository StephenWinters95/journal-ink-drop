
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface JournalEntryProps {
  entry: {
    id: string;
    content: string;
    date: string;
    title?: string;
  };
  onDelete: (id: string) => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ entry, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      onDelete(entry.id);
    }
  };

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {format(new Date(entry.date), 'MMMM d, yyyy • h:mm a')}
          </div>
          <div className="flex gap-2">
            <Link to={`/journal/edit/${entry.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {entry.title && (
          <h3 className="text-lg font-semibold text-gray-800 mt-2">{entry.title}</h3>
        )}
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {entry.content}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default JournalEntry;
