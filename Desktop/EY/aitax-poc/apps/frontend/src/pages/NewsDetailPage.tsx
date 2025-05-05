import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Alert,
  Box, 
  Button,
  Card, 
  CardContent, 
  Chip,
  CircularProgress, 
  Container, 
  Divider,
  Grid, 
  Paper,
  Snackbar,
  TextField,
  Typography 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';

import { News, PersonalizedNews, TaxCategory } from '@/types/news';
import { getNewsById, getPersonalizedNews } from '@/api/news';
import { createNote } from '@/api/notes';

// Helper function to get color based on tax category
const getCategoryColor = (category: TaxCategory) => {
  switch (category) {
    case TaxCategory.VAT:
      return 'primary';
    case TaxCategory.CIT:
      return 'success';
    case TaxCategory.PIT:
      return 'secondary';
    case TaxCategory.TRANSFER_PRICING:
      return 'error';
    case TaxCategory.TAX_PROCEDURE:
      return 'warning';
    case TaxCategory.INTERNATIONAL_TAX:
      return 'info';
    default:
      return 'default';
  }
};

const NewsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<News | null>(null);
  const [personalizedInsight, setPersonalizedInsight] = useState<PersonalizedNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const newsId = parseInt(id);
        const data = await getNewsById(newsId);
        setNews(data);
        
        // Automatically fetch personalized insight
        setInsightLoading(true);
        try {
          const insightData = await getPersonalizedNews(newsId);
          setPersonalizedInsight(insightData);
        } catch (insightErr) {
          console.error('Failed to load personalized insight:', insightErr);
          // We don't set the main error here as the news content still loaded
        } finally {
          setInsightLoading(false);
        }
      } catch (err) {
        setError('Failed to load news data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  const handleSaveNote = async () => {
    if (!id || !noteContent.trim()) return;
    
    setSavingNote(true);
    setNoteError(null);
    
    try {
      await createNote({
        content: noteContent,
        news_id: parseInt(id),
      });
      
      setNoteContent('');
      setNoteSuccess(true);
    } catch (err) {
      setNoteError('Failed to save note');
      console.error(err);
    } finally {
      setSavingNote(false);
    }
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

  if (error || !news) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || 'News not found'}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/news')}
            sx={{ mt: 2 }}
          >
            Back to News
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
        onClick={() => navigate('/news')}
        sx={{ mb: 3 }}
      >
        Back to News
      </Button>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {news.title}
            </Typography>
            <Chip 
              label={news.category} 
              color={getCategoryColor(news.category)} 
              sx={{ ml: 2 }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Published: {format(new Date(news.published_date), 'PPP')}
            {news.source_url && (
              <> | Source: <a href={news.source_url} target="_blank" rel="noopener noreferrer">Link</a></>
            )}
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 4 }}>
            {news.content}
          </Typography>
        </CardContent>
      </Card>
      
      <Typography variant="h5" gutterBottom>
        Why is this important for your business?
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: 'rgba(46, 125, 50, 0.05)',
          border: '1px solid rgba(46, 125, 50, 0.2)',
          borderRadius: 2
        }}
      >
        {insightLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : personalizedInsight ? (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {personalizedInsight.personalized_summary}
          </Typography>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Complete your company profile to receive personalized insights about how this news affects your business.
          </Typography>
        )}
      </Paper>
      
      <Typography variant="h5" gutterBottom>
        Add Notes
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            label="Your notes about this news item"
            multiline
            rows={4}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Add your thoughts, questions, or action items related to this news..."
            disabled={savingNote}
          />
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveNote}
            disabled={!noteContent.trim() || savingNote}
            sx={{ mt: 2 }}
          >
            {savingNote ? <CircularProgress size={24} /> : 'Save Note'}
          </Button>
        </CardContent>
      </Card>
      
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
      
      {/* Error Snackbar */}
      <Snackbar 
        open={!!noteError} 
        autoHideDuration={6000} 
        onClose={() => setNoteError(null)}
      >
        <Alert onClose={() => setNoteError(null)} severity="error" sx={{ width: '100%' }}>
          {noteError}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewsDetailPage;
