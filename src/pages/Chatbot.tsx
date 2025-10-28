import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bienvenue ! Je suis votre conseiller spirituel basé sur la Bible. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const searchKnowledgeBase = async (query: string) => {
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("*")
      .limit(5);

    if (error) {
      console.error("Error fetching knowledge base:", error);
      return [];
    }

    // Simple keyword matching
    const keywords = query.toLowerCase().split(" ");
    const scored = data.map((entry) => {
      const contentLower = (entry.title + " " + entry.content + " " + entry.tags.join(" ")).toLowerCase();
      const score = keywords.reduce((acc, keyword) => {
        return acc + (contentLower.includes(keyword) ? 1 : 0);
      }, 0);
      return { ...entry, score };
    });

    return scored
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const generateResponse = (query: string, relevantEntries: any[]) => {
    if (relevantEntries.length === 0) {
      return "Je suis désolé, je n'ai pas trouvé d'information pertinente dans ma base de connaissances bibliques. Pourriez-vous reformuler votre question ?";
    }

    let response = "Voici ce que j'ai trouvé :\n\n";
    relevantEntries.forEach((entry, index) => {
      response += `${index + 1}. **${entry.title}**\n${entry.content}\n\n`;
    });

    return response;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Search knowledge base
      const relevantEntries = await searchKnowledgeBase(input);
      
      // Generate response
      const response = generateResponse(input, relevantEntries);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement de votre message.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Conseiller Spirituel</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col max-w-4xl">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Chat Biblique</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4 mb-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <p className="text-sm">En train de réfléchir...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Posez votre question..."
                disabled={loading}
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
