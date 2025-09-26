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
import { Skeleton } from "@/components/ui/skeleton";

function Profile() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true)

    const fetchProfile = async () => {
      // Verifica se o usuário está autenticado
      if (!authService.isAuthenticated()) {
        navigate("/");
        return;
      }

      try {
        const profileData = await authService.getProfile();
        await new Promise((resolve) => setTimeout(resolve, 600))
        setUserData(profileData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Profile error:", error);

        // Se o token for inválido, faz logout
        if (error.response?.status === 403) {
          authService.logout();
          toast(error.response?.detail);
        }
      } finally {
        setIsLoading(false)
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
        {isLoading && (
          <>
            <CardHeader className="flex flex-col items-center">
              <Skeleton className="h-4 w-50 rounded-xl" />
              <Skeleton className="h-18 w-18 rounded-xl" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-9 " />
                </div>
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-9 " />
                </div>
              </div>
            </CardContent>
          </>
        )}

        {!isLoading && userData && (
          <>
            <CardHeader className="flex flex-col items-center">
              <p className="text-xs">Profile picture</p>
              <Avatar className="rounded-lg w-16 h-16">
                <AvatarImage src={userData.avatar.high} alt="Profile picture" />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
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
