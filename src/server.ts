import TodoList, { Item } from './core' 
const todolist = new TodoList('todolist.json') 

async function requestTest(req: Bun.BunRequest) {
  return Response.json({
    method: req.method, 
    time: new Date().toLocaleString('pt-BR'), 
    body: await req.body?.text(),
  });
}

const server = Bun.serve({
  port: 3000,
  routes: {
    '/api-debugger': (req) => new Response(Bun.file('./public/api-debugger.html')),

    '/test': {
      GET: requestTest,
      POST: requestTest,
      PUT: requestTest,
      DELETE: requestTest,
      PATCH: requestTest,
      OPTIONS: requestTest,
    },

    '/todo': {
        // Lista todos os itens da TodoList em formato JSON
        GET: async () => {
            const items = await todolist.getItems()
            return Response.json(items)
        },
        // Cria um novo item a partir do corpo da requisição
        POST: async (req) => {
            let data

            try {
                data = await req.body?.json()  // Tenta interpretar o corpo da requisição como JSON
            } catch (e) {
                return new Response('json inválido', { status: 400 })
            }
            if (!data?.title)   // "?." evita erro se data for undefined; valida se o campo title existe
                return new Response('É preciso informar title', { status: 400 })
            try {
                await todolist.addItem(new Item(data.title))  // Cria um novo objeto Item e delega a inserção para a classe TodoList    
            } catch (error) {
                return new Response('Erro ao adicionar item', { status: 500 })
            }

            return new Response('Created', { status: 201 })
        }
    },

    // Deleta um item da lista de tarefas pelo índice, passado como parâmetro na URL
    '/todo/:index': async (req) => {
        const indexStr = req.params.index
        const index = parseInt(indexStr)
        if (isNaN(index)) 
            return new Response('index precisa ser um número inteiro', { status: 400 })
        await todolist.removeItem(index)
        return new Response(`Item de indice ${index}, removido com sucesso`)
    } 
  },
  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);