from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

def build_vectorstore(documents):

    embeddings = OpenAIEmbeddings()

    vector_db = FAISS.from_documents(
        documents,
        embeddings
    )

    return vector_db