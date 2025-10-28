import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Users, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Messages() {
  const [activeTab, setActiveTab] = useState("group");
  const [groupMessages, setGroupMessages] = useState<any[]>([]);
  const [directMessages, setDirectMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentUser();
    loadMembers();
  }, []);

  useEffect(() => {
    if (activeTab === "group") {
      loadGroupMessages();
    } else if (selectedMember) {
      loadDirectMessages(selectedMember.id);
    }
  }, [activeTab, selectedMember]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("eglise_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setCurrentUser(data);
    }
  };

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("eglise_members")
        .select("*")
        .order("full_name");

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadGroupMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("eglise_group_messages")
        .select(`
          *,
          eglise_profiles:sender_id (
            full_name
          )
        `)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setGroupMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadDirectMessages = async (memberId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("eglise_messages")
        .select(`
          *,
          sender:sender_id (
            full_name
          ),
          receiver:receiver_id (
            full_name
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${memberId},receiver_id.eq.${memberId}`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setDirectMessages(data || []);

      // Mark messages as read
      await supabase
        .from("eglise_messages")
        .update({ is_read: true })
        .eq("receiver_id", user.id)
        .eq("sender_id", memberId);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendGroupMessage = async () => {
    if (!newMessage.trim() || !currentUser?.church_id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase.from("eglise_group_messages").insert({
        church_id: currentUser.church_id,
        sender_id: user.id,
        message: newMessage,
      });

      if (error) throw error;

      setNewMessage("");
      loadGroupMessages();
      toast({ title: "Message envoyé !" });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendDirectMessage = async () => {
    if (!newMessage.trim() || !selectedMember) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase.from("eglise_messages").insert({
        sender_id: user.id,
        receiver_id: selectedMember.id,
        message: newMessage,
      });

      if (error) throw error;

      setNewMessage("");
      loadDirectMessages(selectedMember.id);
      toast({ title: "Message envoyé !" });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold">Messagerie</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="group">
              <Users className="h-4 w-4 mr-2" />
              Groupe
            </TabsTrigger>
            <TabsTrigger value="direct">
              <User className="h-4 w-4 mr-2" />
              Messages privés
            </TabsTrigger>
          </TabsList>

          <TabsContent value="group" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Discussion de groupe</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] mb-4 pr-4">
                  <div className="space-y-4">
                    {groupMessages.map((msg) => (
                      <div key={msg.id} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {msg.eglise_profiles?.full_name || "Utilisateur"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(msg.created_at), "HH:mm", { locale: fr })}
                          </span>
                        </div>
                        <p className="text-sm bg-muted p-2 rounded-md">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={2}
                  />
                  <Button onClick={sendGroupMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="direct" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Membres</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {members.map((member) => (
                        <Button
                          key={member.id}
                          variant={selectedMember?.id === member.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedMember(member)}
                        >
                          {member.full_name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm">
                    {selectedMember ? `Conversation avec ${selectedMember.full_name}` : "Sélectionnez un membre"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMember ? (
                    <>
                      <ScrollArea className="h-[300px] mb-4 pr-4">
                        <div className="space-y-4">
                          {directMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex flex-col gap-1 ${
                                msg.sender_id === currentUser?.id ? "items-end" : "items-start"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(msg.created_at), "HH:mm", { locale: fr })}
                                </span>
                              </div>
                              <p
                                className={`text-sm p-2 rounded-md max-w-[80%] ${
                                  msg.sender_id === currentUser?.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                {msg.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Écrivez votre message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && sendDirectMessage()}
                        />
                        <Button onClick={sendDirectMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      Sélectionnez un membre pour commencer une conversation
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
