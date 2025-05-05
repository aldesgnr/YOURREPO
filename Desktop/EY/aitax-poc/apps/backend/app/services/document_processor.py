import os
from typing import List, Dict, Any

import fitz  # PyMuPDF
from langchain_core.documents import Document as LangchainDocument
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from sqlmodel import Session, select

from app.core.config import settings
from app.core.database import engine
from app.models.document import Document


async def extract_text_from_pdf(file_path: str) -> List[LangchainDocument]:
    """Extract text from PDF file and create Langchain documents"""
    documents = []
    
    try:
        # Open the PDF file
        pdf_document = fitz.open(file_path)
        
        # Process each page
        for page_num, page in enumerate(pdf_document):
            # Extract text from the page
            text = page.get_text()
            
            # Create a Langchain document
            doc = LangchainDocument(
                page_content=text,
                metadata={
                    "source": os.path.basename(file_path),
                    "page": page_num + 1,
                    "total_pages": len(pdf_document)
                }
            )
            
            documents.append(doc)
        
        pdf_document.close()
        
    except Exception as e:
        # Create a document with error information
        error_doc = LangchainDocument(
            page_content=f"Error extracting text from PDF: {str(e)}",
            metadata={
                "source": os.path.basename(file_path),
                "error": True
            }
        )
        documents.append(error_doc)
    
    return documents


async def extract_text_from_txt(file_path: str) -> List[LangchainDocument]:
    """Extract text from TXT file and create Langchain documents"""
    documents = []
    
    try:
        # Open and read the text file
        with open(file_path, 'r', encoding='utf-8') as file:
            text = file.read()
        
        # Create a Langchain document
        doc = LangchainDocument(
            page_content=text,
            metadata={
                "source": os.path.basename(file_path)
            }
        )
        
        documents.append(doc)
        
    except Exception as e:
        # Create a document with error information
        error_doc = LangchainDocument(
            page_content=f"Error extracting text from TXT: {str(e)}",
            metadata={
                "source": os.path.basename(file_path),
                "error": True
            }
        )
        documents.append(error_doc)
    
    return documents


async def process_document(document_id: int) -> None:
    """Process a document and store in vector database"""
    # Get document from database
    with Session(engine) as session:
        document = session.get(Document, document_id)
        if not document:
            print(f"Document with ID {document_id} not found")
            return
    
    # Extract text based on file type
    if document.file_type.value == "pdf":
        documents = await extract_text_from_pdf(document.file_path)
    elif document.file_type.value == "txt":
        documents = await extract_text_from_txt(document.file_path)
    else:
        print(f"Unsupported file type: {document.file_type}")
        return
    
    # Add document metadata
    for doc in documents:
        doc.metadata["document_id"] = str(document.id)
        doc.metadata["title"] = document.title
        doc.metadata["user_id"] = str(document.user_id)
    
    # Initialize embeddings
    embeddings = OpenAIEmbeddings(model=settings.EMBEDDING_MODEL)
    
    # Define collection name
    collection_name = f"{settings.CHROMA_COLLECTION_PREFIX}__docs__v1"
    
    # Store documents in Chroma
    try:
        vectorstore = Chroma(
            collection_name=collection_name,
            embedding_function=embeddings,
            client_settings={"host": settings.CHROMA_HOST, "port": settings.CHROMA_PORT}
        )
        
        # Add documents to vector store
        vectorstore.add_documents(documents)
        
        print(f"Successfully processed document {document_id} and added to vector store")
        
    except Exception as e:
        print(f"Error storing document in vector database: {str(e)}")
        return
