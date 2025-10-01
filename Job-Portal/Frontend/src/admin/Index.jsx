import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import  Logo  from "@/components/Shared/Logo";

function Index(){
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-admin-bg to-white">
      <div className="text-center space-y-6 p-8 rounded-lg">
        <h1 className="text-4xl font-bold text-[#249885]">
        <div className='flex justify-center items-center mb-5 '>
           <Logo  />
        </div>
           </h1>
        <p className="text-xl text-gray-600 max-w-md">
          Find your dream job or post new opportunities.
        </p>
        <div className="space-x-4">
          <Button 
            className="bg-[#249885] hover:bg-[#30b8a1] text-white"
            onClick={() => navigate('/admin/login')}
          >
            Admin Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
