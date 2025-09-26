import { Card, CardContent, CardHeader } from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Toaster } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import Profile from "./Profile";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { authService } from "./services/authService";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

const B2BLogo = "/B2BitLogo.png";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "cliente@youdrive.com",
      password: "password",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({
        email: values.email,
        password: values.password,
      });

      localStorage.setItem("access_token", response.tokens.access);
      localStorage.setItem("refresh_token", response.tokens.refresh);

      navigate("/profile");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Erro ao fazer login. Verifique suas credenciais."
      );

      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full py-10 max-w-sm shadow-xl">
        <CardHeader className="mx-7">
          <img src={B2BLogo} alt="" />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                form.handleSubmit(onSubmit)(event);
              }}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@gmail.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="***********"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {/* Ícone opcional de erro */}
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#02274f] h-10 font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<LoginForm />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
