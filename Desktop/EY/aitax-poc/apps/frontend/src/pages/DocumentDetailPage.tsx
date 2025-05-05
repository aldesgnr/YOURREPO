import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Alert,
  Avatar,
  Box, 
  Button,
  Card, 
  CardContent, 
  Chip,
  CircularProgress, 
  Container, 
  Divider,
  Grid, 
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  Typography 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { format } from 'date-fns';

import { Document, DocumentType } from '@/types/document';
import { ChatMessage, MessageRole } from '@/types/chat';
import { Note } from '@/types/note';
import { getDocumentById } from '@/api/documents';
import { getChatHistory, askQuestion } from '@/api/chat';
import { createNote } from '@/api/notes';

const DocumentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDocumentAndChat = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const documentId = parseInt(id);
        
        // Fetch document details
        const documentData = await getDocumentById(documentId);
        setDocument(documentData);
        
        // Fetch chat history
        const chatData = await getChatHistory(documentId);
        setChatMessages(chatData);
      } catch (err) {
        setError('Failed to load document data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentAndChat();
  }, [id]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendQuestion = async () => {
    if (!id || !question.trim()) return;
    
    setChatLoading(true);
    const documentId = parseInt(id);
    
    try {
      // Add user message to chat (optimistic update)
      const userMessage: ChatMessage = {
        id: Date.now(), // Temporary ID
        content: question,
        role: MessageRole.USER,
        document_id: documentId,
        user_id: 0, // Will be set by the server
        created_at: new Date().toISOString(),
      };
      
      setChatMessages([...chatMessages, userMessage]);
      
      // Send question to API
      const response = await askQuestion(documentId, question);
      
      // Add AI response to chat
      setChatMessages((prevMessages) => [...prevMessages, response]);
      
      // Clear question input
      setQuestion('');
    } catch (err) {
      console.error(err);
      setError('Failed to send question. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!id || !noteContent.trim()) return;
    
    setSavingNote(true);
    setNoteError(null);
    
    try {
      await createNote({
        content: noteContent,
        document_id: parseInt(id),
      });
      
      setNoteContent('');
      setNoteSuccess(true);
      setShowNoteForm(false);
    } catch (err) {
      setNoteError('Failed to save note');
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !document) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || 'Document not found'}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/documents')}
            sx={{ mt: 2 }}
          >
            Back to Documents
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Button 
        variant="outlined" 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/documents')}
        sx={{ mb: 3 }}
      >
        Back to Documents
      </Button>
      
      <Grid container spacing={3}>
        {/* Document Info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
                  Document Details
                </Typography>
                <Chip 
                  label={document.file_type.toUpperCase()} 
                  color={document.file_type === DocumentType.PDF ? 'error' : 'primary'} 
                />
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                {document.title}
              </Typography>
              
              {document.description && (
                <Typography variant="body1" paragraph>
                  {document.description}
                </Typography>
              )}
              
              <Typography variant="body2" color="text.secondary">
                <strong>File Size:</strong> {formatFileSize(document.file_size)}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Uploaded:</strong> {format(new Date(document.created_at), 'PPP')}
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<NoteAddIcon />}
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  fullWidth
                >
                  {showNoteForm ? 'Hide Note Form' : 'Add Note'}
                </Button>
              </Box>
              
              {showNoteForm && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Your notes about this document"
                    multiline
                    rows={4}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    fullWidth
                    variant="outlined"
                    placeholder="Add your thoughts or important points from this document..."
                    disabled={savingNote}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveNote}
                    disabled={!noteContent.trim() || savingNote}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    {savingNote ? <CircularProgress size={24} /> : 'Save Note'}
                  </Button>
                  
                  {noteError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {noteError}
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Chat */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Ask Questions About This Document
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Use AI to get answers to your questions about this document. The AI will analyze the content and provide relevant information.
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ 
                height: '400px', 
                overflowY: 'auto', 
                bgcolor: 'background.default', 
                p: 2, 
                borderRadius: 1,
                mb: 2
              }}>
                {chatMessages.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary'
                  }}>
                    <SmartToyIcon sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
                    <Typography variant="body1" align="center">
                      No messages yet. Ask a question to get started!
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {chatMessages.map((message) => (
                      <ListItem 
                        key={message.id}
                        alignItems="flex-start"
                        sx={{ 
                          mb: 2,
                          bgcolor: message.role === MessageRole.ASSISTANT ? 'rgba(46, 125, 50, 0.05)' : 'transparent',
                          borderRadius: 2,
                          p: 1
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: message.role === MessageRole.ASSISTANT ? 'success.main' : 'primary.main' 
                          }}>
                            {message.role === MessageRole.ASSISTANT ? <SmartToyIcon /> : <PersonIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={message.role === MessageRole.ASSISTANT ? 'AI Assistant' : 'You'}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body1"
                                color="text.primary"
                                sx={{ display: 'block', mt: 1, whiteSpace: 'pre-line' }}
                              >
                                {message.content}
                              </Typography>
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mt: 1 }}
                              >
                                {format(new Date(message.created_at), 'PPp')}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                  </List>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Ask a question about this document..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={chatLoading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendQuestion();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<SendIcon />}
                  onClick={handleSendQuestion}
                  disabled={!question.trim() || chatLoading}
                >
                  {chatLoading ? <CircularProgress size={24} /> : 'Send'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Success Snackbar */}
      <Snackbar 
        open={noteSuccess} 
        autoHideDuration={6000} 
        onClose={() => setNoteSuccess(false)}
      >
        <Alert onClose={() => setNoteSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Note saved successfully
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DocumentDetailPage;
