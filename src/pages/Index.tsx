
import React from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            My Personal Journal
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Capture your thoughts, memories, and reflections in your digital journal
          </p>
        </div>
        
        <div className="flex justify-center gap-4">
          <Link to="/journal">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
              <BookOpen className="w-5 h-5 mr-2" />
              View Journal
            </Button>
          </Link>
          <Link to="/journal/new">
            <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3">
              <Plus className="w-5 h-5 mr-2" />
              New Entry
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
