import { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardActionArea,
  CardContent, 
  Chip,
  CircularProgress, 
  Container, 
  Divider,
  Grid, 
  Typography 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

import { News, TaxCategory } from '@/types/news';
import { getAllNews } from '@/api/news';

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

const NewsPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await getAllNews();
        setNews(data);
      } catch (err) {
        setError('Failed to load news data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleNewsClick = (newsId: number) => {
    navigate(`/news/${newsId}`);
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

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body1">
            Please try again later or contact support.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Tax News
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Stay updated with the latest tax regulations and changes relevant to your business.
      </Typography>
      
      <Divider sx={{ mb: 4 }} />
      
      {news.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6">
            No news items available at the moment.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {news.map((item) => (
            <Grid item xs={12} key={item.id}>
              <Card sx={{ mb: 2 }}>
                <CardActionArea onClick={() => handleNewsClick(item.id)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {item.title}
                      </Typography>
                      <Chip 
                        label={item.category} 
                        color={getCategoryColor(item.category)} 
                        size="small" 
                        sx={{ ml: 2 }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Published: {format(new Date(item.published_date), 'PPP')}
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      {item.summary}
                    </Typography>
                    
                    <Typography variant="body2" color="primary">
                      Click to view details and personalized insights
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default NewsPage;
