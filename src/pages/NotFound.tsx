import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Church } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="text-center px-4">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Church className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page non trouvée</h2>
        <p className="text-muted-foreground mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Button onClick={() => navigate("/")}>
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
