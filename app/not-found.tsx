"use client";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { FaArrowLeft, FaHeadset } from 'react-icons/fa';
import Header from "@/components/shared/header";
import Footer from "@/components/footer";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#0d0712] transition-colors duration-200 px-4 py-[120px]">
        <div className="text-center max-w-2xl mx-auto">
          {/* Content */}
          <h4 className="text-2xl font-bold text-[#5F1DE8] dark:text-[#B131F8] mb-2 transition-colors duration-200">
            Error 404!
          </h4>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight transition-colors duration-200">
            Page <span className="text-[#5F1DE8] dark:text-[#B131F8] transition-colors duration-200">Not Found</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed transition-colors duration-200">
            We're sorry, but the page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect. Don't worry though - you can easily navigate back to our homepage to continue exploring our services.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
              onClick={() => (window.location.href = "/")}
            >
              <FaArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
              <span>Go Back to Home</span>
            </button>
            
            <button
              className="inline-flex items-center gap-2 bg-white dark:bg-gray-700 border-2 border-[#5F1DE8] dark:border-[#B131F8] text-[#5F1DE8] dark:text-[#B131F8] font-semibold px-8 py-4 rounded-lg hover:bg-[#5F1DE8] hover:text-white dark:hover:bg-[#B131F8] dark:hover:text-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              onClick={() => (window.location.href = "/contact")}
            >
              <FaHeadset className="w-4 h-4" />
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFoundPage;