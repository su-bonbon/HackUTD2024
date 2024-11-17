from aiohttp import ClientSession
from bs4 import BeautifulSoup
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

class DocumentProcessor:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""],
            length_function=len
        )
        self.vector_store = None

    async def fetch_html(self, url: str) -> str:
        """Fetch HTML content from URL"""
        async with ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    return await response.text()
                else:
                    raise Exception(f"Failed to fetch HTML: {response.status}")

    def clean_html_text(self, html_content: str) -> str:
        """Extract and clean text from HTML content"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        for script in soup(["script", "style"]):
            script.decompose()
        
        text = soup.get_text(separator='\n')

        lines = (line.strip() for line in text.splitlines())
        text = '\n'.join(line for line in lines if line)
        return text

    async def process_earnings_report(self, url: str) -> str:
        """Process HTML and create vector store"""
        try:
            html_content = await self.fetch_html(url)
            clean_text = self.clean_html_text(html_content)
            
            chunks = self.text_splitter.split_text(clean_text)
            
            self.vector_store = FAISS.from_texts(
                chunks,
                self.embeddings,
                metadatas=[{"source": f"section_{i}"} for i in range(len(chunks))]
            )
            
            return "Earnings report processed and indexed successfully."
        except Exception as e:
            return f"Error processing HTML: {str(e)}"

    def search_earnings_report(self, query: str) -> str:
        """Search through the processed earnings report"""
        if not self.vector_store:
            return "Error: Earnings report not processed yet."
        
        results = self.vector_store.similarity_search_with_score(query, k=3)
        
        formatted_results = []
        for doc, score in results:
            formatted_results.append(f"Relevance Score: {1 - score:.2f}\nContent: {doc.page_content}\n")
        
        return "\n".join(formatted_results) 