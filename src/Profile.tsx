import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function Profile() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      // Verifica se o usuário está autenticado
      if (!authService.isAuthenticated()) {
        navigate("/");
        return;
      }

      try {
        const profileData = await authService.getProfile();
        setUserData(profileData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Profile error:", error);

        // Se o token for inválido, faz logout
        if (error.response?.status === 403) {
          authService.logout();
          toast(error.response?.detail);
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  function onSubmit() {
    authService.logout();
    toast("Você desconectou-se da sua conta.")
    navigate("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <div className="min-w-screen min-h-20 px-12 flex items-center justify-end bg-white absolute top-0">
        <Button className="w-60 h-12 bg-[#02274f] text-lg font-extrabold" onClick={onSubmit}>Logout</Button>
      </div>
      <Card className="w-full max-w-sm shadow-xl">
        {userData && (
          <>
            <CardHeader className="flex flex-col items-center">
              <p className="text-xs">Profile picture</p>
              <div>
                <Avatar className="rounded-lg w-16 h-16">
                  <AvatarImage src={userData.avatar.high} alt="Profile picture" />
                  <AvatarFallback>ER</AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Your <span className="font-bold">Name</span>
                  </Label>
                  <Input  className="bg-gray-200" id="name" type="text" value={userData.name} disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    Your <span className="font-bold">E-mail</span>
                  </Label>
                  <Input className="bg-gray-200" 
                    id="email"
                    type="email"
                    value={userData.email}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

export default Profile;
