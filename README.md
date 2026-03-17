# App RAG

Aplicação de **RAG (Retrieval-Augmented Generation)** que permite fazer perguntas em linguagem natural sobre documentos PDF. O sistema processa os arquivos, gera embeddings e armazena em um banco vetorial. As consultas são respondidas com base no contexto recuperado dos documentos.

## Tecnologias utilizadas

- **Node.js** + **TypeScript** — runtime e tipagem
- **Express** — API REST
- **LangChain** — orquestração de LLM, embeddings e processamento de documentos
- **OpenAI** — modelos de linguagem (GPT-4o-mini) e embeddings (text-embedding-3-small)
- **Qdrant** — banco de dados vetorial
- **Multer** — upload de arquivos
- **pdf-parse** — extração de texto de PDFs
- **Docker** — execução do Qdrant

## Como executar

1. Configure as variáveis de ambiente (ex.: `OPENAI_API_KEY`)
2. Suba o Qdrant: `docker compose up -d`
3. Inicie a API: `npm run dev`

## Melhorias a fazer

- [ ] Criação e validação de schemas para rotas com Zod
