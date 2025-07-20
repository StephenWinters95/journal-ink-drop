
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Budget Calendar App
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage your finances with ease
          </p>
        </div>
        
        <div className="flex justify-center gap-4">
          <Link to="/budget-dashboard">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
              <span className="w-5 h-5 mr-2 font-bold text-lg">€</span>
              Budget Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
