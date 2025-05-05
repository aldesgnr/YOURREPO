export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system"
}

export interface ChatMessageBase {
  content: string;
  role: MessageRole;
  document_id: number;
  user_id: number;
}

export interface ChatMessage extends ChatMessageBase {
  id: number;
  created_at: string;
}

export interface ChatMessageCreate {
  content: string;
  role: MessageRole;
  document_id: number;
}
