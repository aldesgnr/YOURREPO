import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Alert,
  Box, 
  Button,
  Card, 
  CardActionArea,
  CardContent, 
  Chip,
  CircularProgress, 
  Container, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid, 
  IconButton,
  Snackbar,
  TextField,
  Typography 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';

import { Document, DocumentType, DocumentUpload } from '@/types/document';
import { getAllDocuments, uploadDocument, deleteDocument } from '@/api/documents';

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<DocumentUpload>();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const data = await getAllDocuments();
        setDocuments(data);
      } catch (err) {
        setError('Failed to load documents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDocumentClick = (documentId: number) => {
    navigate(`/documents/${documentId}`);
  };

  const handleOpenUploadDialog = () => {
    reset();
    setSelectedFile(null);
    setUploadDialogOpen(true);
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const onSubmitUpload = async (data: Omit<DocumentUpload, 'file'>) => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    // Check file type
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !['pdf', 'txt'].includes(fileExtension)) {
      setUploadError('Only PDF and TXT files are supported');
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      setUploadError('File size exceeds the 10MB limit');
      return;
    }

    setUploading(true);
    setUploadError(null);
    
    try {
      const uploadData: DocumentUpload = {
        ...data,
        file: selectedFile,
      };
      
      const newDocument = await uploadDocument(uploadData);
      setDocuments([...documents, newDocument]);
      setUploadSuccess(true);
      handleCloseUploadDialog();
    } catch (err) {
      console.error(err);
      setUploadError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDeleteDialog = (document: Document, event: React.MouseEvent) => {
    event.stopPropagation();
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    setDeleting(true);
    setDeleteError(null);
    
    try {
      await deleteDocument(documentToDelete.id);
      setDocuments(documents.filter(doc => doc.id !== documentToDelete.id));
      setDeleteSuccess(true);
      handleCloseDeleteDialog();
    } catch (err) {
      console.error(err);
      setDeleteError('Failed to delete document. Please try again.');
    } finally {
      setDeleting(false);
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Documents
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenUploadDialog}
        >
          Upload Document
        </Button>
      </Box>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Upload and analyze your tax documents. You can ask questions about your documents using the chat feature.
      </Typography>
      
      <Divider sx={{ mb: 4 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {documents.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 5 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No documents uploaded yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Upload your first document to get started
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleOpenUploadDialog}
            >
              Upload Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {documents.map((document) => (
            <Grid item xs={12} sm={6} md={4} key={document.id}>
              <Card>
                <CardActionArea onClick={() => handleDocumentClick(document.id)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {document.file_type === DocumentType.PDF ? (
                          <DescriptionIcon color="error" sx={{ mr: 1, fontSize: 32 }} />
                        ) : (
                          <TextSnippetIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
                        )}
                        <Chip 
                          label={document.file_type.toUpperCase()} 
                          size="small" 
                          color={document.file_type === DocumentType.PDF ? 'error' : 'primary'} 
                        />
                      </Box>
                      <IconButton 
                        size="small" 
                        color="default" 
                        onClick={(e) => handleOpenDeleteDialog(document, e)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="h6" component="h2" noWrap gutterBottom>
                      {document.title}
                    </Typography>
                    
                    {document.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {document.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(document.file_size)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(document.created_at), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitUpload)}>
          <DialogContent>
            <DialogContentText paragraph>
              Upload a PDF or TXT file (max 10MB) to analyze and ask questions about.
            </DialogContentText>
            
            {uploadError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {uploadError}
              </Alert>
            )}
            
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Document title is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Document Title"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  disabled={uploading}
                />
              )}
            />
            
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description (Optional)"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                  disabled={uploading}
                />
              )}
            />
            
            <Box sx={{ mt: 2 }}>
              <input
                accept=".pdf,.txt"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={uploading}
                >
                  Select File
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUploadDialog} disabled={uploading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={uploading || !selectedFile}
            >
              {uploading ? <CircularProgress size={24} /> : 'Upload'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{documentToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteDocument} 
            color="error" 
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbars */}
      <Snackbar 
        open={uploadSuccess} 
        autoHideDuration={6000} 
        onClose={() => setUploadSuccess(false)}
      >
        <Alert onClose={() => setUploadSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Document uploaded successfully
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={deleteSuccess} 
        autoHideDuration={6000} 
        onClose={() => setDeleteSuccess(false)}
      >
        <Alert onClose={() => setDeleteSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Document deleted successfully
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DocumentsPage;
