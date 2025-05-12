
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-sm"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">React App</h1>
          <p className="text-gray-500">Your empty React application is ready.</p>
        </div>

        <div className="flex justify-center pt-4">
          <Button className="transition-all hover:scale-105">
            Get Started
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
