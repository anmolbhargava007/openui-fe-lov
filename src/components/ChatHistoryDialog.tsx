
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { History, MessageSquare } from "lucide-react";
import { ChatPrompt } from "@/types/api";
import { promptHistoryApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface ChatHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: number;
  onSelectPrompt: (prompt: ChatPrompt) => void;
}

interface SessionGroup {
  sessionId: string;
  prompts: ChatPrompt[];
  firstPromptTime: string;
  documents: string[];
}

const ChatHistoryDialog = ({ 
  isOpen, 
  onClose, 
  workspaceId, 
  onSelectPrompt 
}: ChatHistoryDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sessionGroups, setSessionGroups] = useState<SessionGroup[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && workspaceId && user?.user_id) {
      loadHistory();
    }
  }, [isOpen, workspaceId, user?.user_id]);

  const loadHistory = async () => {
    if (!user?.user_id) return;
    
    try {
      setLoading(true);
      const response = await promptHistoryApi.getAllSessionsForWorkspace(workspaceId, user.user_id);
      
      if (response.success && Array.isArray(response.data)) {
        // Group prompts by session_id
        const groupedBySession: Record<string, ChatPrompt[]> = {};
        
        response.data.forEach(prompt => {
          if (!groupedBySession[prompt.session_id]) {
            groupedBySession[prompt.session_id] = [];
          }
          groupedBySession[prompt.session_id].push(prompt);
        });
        
        // Convert to array of session groups and sort each session's prompts by prompt_id
        const groups = Object.entries(groupedBySession).map(([sessionId, prompts]) => {
          // Sort prompts by id within each session
          const sortedPrompts = [...prompts].sort((a, b) => 
            (a.prompt_id || 0) - (b.prompt_id || 0)
          );
          
          // Extract document names from response texts (mock implementation)
          const documents = extractDocumentNames(sortedPrompts);
          
          // Format date from the first prompt as session creation time
          const firstPromptTime = new Date().toLocaleDateString();
          
          return {
            sessionId,
            prompts: sortedPrompts,
            firstPromptTime,
            documents
          };
        });
        
        // Sort sessions by the latest prompt_id in descending order
        const sortedGroups = groups.sort((a, b) => {
          const aLatestId = a.prompts[a.prompts.length - 1]?.prompt_id || 0;
          const bLatestId = b.prompts[b.prompts.length - 1]?.prompt_id || 0;
          return bLatestId - aLatestId;
        });
        
        setSessionGroups(sortedGroups);
        
        // Automatically expand the most recent session
        if (sortedGroups.length > 0) {
          setExpandedSession(sortedGroups[0].sessionId);
        }
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      toast.error("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  // Mock function to extract document names from prompts
  // In a real implementation, you would get this from the session metadata or document API
  const extractDocumentNames = (prompts: ChatPrompt[]): string[] => {
    const documents: string[] = [];
    
    // Look for document mentions in responses
    prompts.forEach(prompt => {
      const responseText = prompt.response_text || "";
      
      // This is a simplified approach - in a real app, you'd have proper metadata
      if (responseText.includes("invoice_") || responseText.includes(".pdf")) {
        const regex = /([a-zA-Z0-9_-]+\.pdf)/g;
        const matches = responseText.match(regex);
        if (matches) {
          matches.forEach(match => {
            if (!documents.includes(match)) {
              documents.push(match);
            }
          });
        }
      }
    });
    
    return documents;
  };

  const handlePromptClick = (prompt: ChatPrompt) => {
    onSelectPrompt(prompt);
    onClose();
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <History className="mr-2 h-5 w-5 text-[#A259FF]" />
            Chat History
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-[#A259FF] rounded-full border-t-transparent"></div>
            </div>
          ) : sessionGroups.length > 0 ? (
            <div className="space-y-4">
              {sessionGroups.map((group) => (
                <div key={group.sessionId} className="bg-gray-800 rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-700"
                    onClick={() => toggleSession(group.sessionId)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Session {group.sessionId.substring(0, 8)}...</span>
                      <span className="text-xs text-gray-400">{group.firstPromptTime} • {group.prompts.length} messages</span>
                    </div>
                    <div className="text-gray-400">
                      {expandedSession === group.sessionId ? "▲" : "▼"}
                    </div>
                  </Button>
                  
                  {expandedSession === group.sessionId && (
                    <div className="p-3 pt-0">
                      {group.documents.length > 0 && (
                        <div className="mb-2 p-2 bg-gray-700 rounded text-xs">
                          <div className="font-medium text-gray-300 mb-1">Documents:</div>
                          {group.documents.map((doc, idx) => (
                            <div key={idx} className="text-[#A259FF]">{doc}</div>
                          ))}
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        {group.prompts.map((prompt) => (
                          <Button
                            key={prompt.prompt_id}
                            variant="ghost"
                            className="w-full justify-start text-left px-3 py-2 text-sm hover:bg-gray-700"
                            onClick={() => handlePromptClick(prompt)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate">{prompt.prompt_text}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <History className="h-12 w-12 mb-4" />
              <p>No chat history found</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ChatHistoryDialog;
