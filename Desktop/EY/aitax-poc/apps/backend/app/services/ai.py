from typing import Dict, List

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

from app.core.config import settings
from app.models.document import Document
from app.models.news import News
from app.models.profile import CompanyProfile


# Initialize OpenAI models
embeddings = OpenAIEmbeddings(model=settings.EMBEDDING_MODEL)
llm = ChatOpenAI(model=settings.CHAT_MODEL)


async def generate_personalized_summary(news: News, profile: CompanyProfile) -> str:
    """Generate a personalized summary of why a news item is relevant to a user"""
    # Create prompt template
    prompt = ChatPromptTemplate.from_template(
        """You are an AI tax advisor for a company with the following profile:
        
        Company Name: {company_name}
        NIP (Tax ID): {nip}
        VAT ID: {vat_id}
        Industry: {industry}
        Company Type: {company_type}
        PKD Code: {pkd_code}
        
        Tax Information:
        - Uses reduced CIT rate (9%): {cit_rate_reduced}
        - Uses Estonian CIT: {estonian_cit}
        - Revenue Range: {revenue_range}
        - Has related party transactions > 10M PLN: {related_party_transactions}
        - Uses R&D tax relief: {rd_relief}
        - Employee Count: {employee_count}
        - Annual Revenue: {annual_revenue} PLN
        
        I want you to explain why the following tax news is relevant to this specific company:
        
        Title: {news_title}
        Category: {news_category}
        Content: {news_content}
        
        Provide a personalized explanation (2-3 paragraphs) of why this news matters to this specific company, 
        considering their profile, tax situation, and business characteristics. Be specific and actionable.
        """
    )
    
    # Prepare input data
    input_data = {
        "company_name": profile.name,
        "nip": profile.nip,
        "vat_id": profile.vat_id or "Not provided",
        "industry": profile.industry or "Not specified",
        "company_type": profile.company_type.value if profile.company_type else "Not specified",
        "pkd_code": profile.pkd_code or "Not specified",
        "cit_rate_reduced": "Yes" if profile.cit_rate_reduced else "No",
        "estonian_cit": "Yes" if profile.estonian_cit else "No",
        "revenue_range": profile.revenue_range.value if profile.revenue_range else "Not specified",
        "related_party_transactions": "Yes" if profile.related_party_transactions else "No",
        "rd_relief": "Yes" if profile.rd_relief else "No",
        "employee_count": profile.employee_count or "Not specified",
        "annual_revenue": profile.annual_revenue or "Not specified",
        "news_title": news.title,
        "news_category": news.category.value,
        "news_content": news.content
    }
    
    # Create and run chain
    chain = prompt | llm | StrOutputParser()
    result = await chain.ainvoke(input_data)
    
    return result


async def generate_document_answer(document: Document, question: str) -> str:
    """Generate an answer to a question about a document using RAG"""
    # Get the ChromaDB collection for the document
    collection_name = f"{settings.CHROMA_COLLECTION_PREFIX}__docs__v1"
    
    try:
        # Load the vector store
        vectorstore = Chroma(
            collection_name=collection_name,
            embedding_function=embeddings,
            client_settings={"host": settings.CHROMA_HOST, "port": settings.CHROMA_PORT}
        )
        
        # Create retriever with document filter
        retriever = vectorstore.as_retriever(
            search_kwargs={
                "k": 5,
                "filter": {"document_id": str(document.id)}
            }
        )
        
        # Create prompt template
        prompt = ChatPromptTemplate.from_template(
            """You are an AI assistant helping with tax document analysis.
            
            Use the following context to answer the question. If you don't know the answer based on the context, 
            say "I don't have enough information to answer this question based on the document."
            
            Context:
            {context}
            
            Question: {question}
            
            Answer:
            """
        )
        
        # Define RAG chain
        def format_docs(docs):
            return "\n\n".join([doc.page_content for doc in docs])
        
        rag_chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        
        # Run the chain
        answer = await rag_chain.ainvoke(question)
        return answer
        
    except Exception as e:
        # Fallback response if something goes wrong
        return f"I'm sorry, I couldn't process your question about this document. Error: {str(e)}"
