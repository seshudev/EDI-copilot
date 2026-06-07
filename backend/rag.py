from langchain.document_loaders import PyPDFLoader

def load_documents():

    loader = PyPDFLoader(
        "../data/837_guide.pdf"
    )

    docs = loader.load()

    return docs