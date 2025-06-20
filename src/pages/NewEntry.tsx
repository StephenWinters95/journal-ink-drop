
import React from 'react';
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import JournalEntryForm from "@/components/JournalEntryForm";

const NewEntry = () => {
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
          <h1 className="text-3xl font-bold text-gray-800">Write New Entry</h1>
        </div>

        <JournalEntryForm />
      </div>
    </div>
  );
};

export default NewEntry;
