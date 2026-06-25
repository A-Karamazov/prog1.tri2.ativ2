import TodoList, { Item } from './core'
const todolist = new TodoList('todolist.json')

async function requestTest(req: Bun.BunRequest) {
    return Response.json({
        method: req.method,
        time: new Date().toLocaleString('pt-BR'),
        body: await req.body?.text(),
        key: crypto.randomUUID()
    });
}

const server = Bun.serve({
    port: 3000,
    routes: {
        '/': () => new Response(Bun.file('./public/index.html')),
        '/api-debugger': (req) => new Response(Bun.file('./public/api-debugger.html')),
        '/test': requestTest,
        '/todo': {
            GET: async () => {
                const items = await todolist.getItems()
                return Response.json(items)
            },
            POST: async (req) => {
                let data
                try {
                    data = await req.body?.json()
                } catch (e) {
                    return new Response('json inválido', { status: 400 })
                }
                if (!data?.title)
                    return new Response('É preciso informar title', { status: 400 })
                let index
                try {
                    index = await todolist.addItem(new Item(data.title))
                } catch (error) {
                    return new Response('Erro ao adicionar item', { status: 500 })
                }
                return Response.json({ index }, { status: 201 })
            }
        },

        '/todo/:index': {
            GET: () => {
                // @todo: DEVE RETORNAR A INFORMAÇÃO DE UM ITEM ESPECÍFICO
                return new Response('Not Implemented yet!', { status: 501 })
            },
            DELETE: async (req) => {
                const indexStr = req.params.index
                const index = parseInt(indexStr)
                if (isNaN(index))
                    return new Response('index precisa ser um número inteiro', { status: 400 })
                try {
                    await todolist.removeItem(index)
                } catch (e) {
                    return Response.json(e, { status: 400 })
                }
                return new Response(`Item de indice ${index}, removido com sucesso`)
            },
            PUT: async (req) => {
                const indexStr = req.params.index
                const index = parseInt(indexStr)
                if (isNaN(index))
                    return new Response('index precisa ser um número inteiro', { status: 400 })
                let data 
                try {
                    data = await req.json() as Item
                } catch {
                    return new Response('json inválido', { status: 400 })
                }
                try {
                    await todolist.updateItem(index, data)
                    return new Response('Item atualizado')
                }
                catch (e) {
                    return Response.json(e, { status: 400 })
                }
            }
        }
    },
    fetch(req) {
        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Server running at http://localhost:${server.port}`);