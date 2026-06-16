class Item {
  constructor(public title: string) { }
}

class TodoList {
  private items: Promise<Item[]>
  private filePath: string

  constructor(filePath: string) {
    this.filePath = filePath
    this.items = this.readListFromDisk()
  }

  // Salva a lista atual no arquivo, sobrescrevendo o conteúdo
  private async saveListToDisk() {
    const file = Bun.file(this.filePath) // API do Bun para manipular arquivos
    const data = JSON.stringify(await this.items)
    await file.write(data)
  }

  // Lê o arquivo do disco e converte o JSON em instâncias da classe Item
  private async readListFromDisk() {
    const file = Bun.file(this.filePath)
    // const text = await file.text()
    // const data = JSON.parse(text)
    const data = await file.json()
    // file.json() já faz a leitura + JSON.parse em um único passo (equivalente
    // às duas linhas comentadas acima, mas mais direto)
    const items: Item[] = data.map((v: any) => {
      return new Item(v.title)
    })
    // O JSON puro do arquivo vira objetos genéricos { title: "..." };
    // aqui cada objeto é transformado em uma instância real de Item
    return items
  }

  /**
   * Adiciona um novo item na lista de item
   */
  async addItem(item: Item) {
    const items = await this.items
    // Resolve a Promise para obter o array real e poder usar .push()
    if (!item) 
      throw 'item não pode ser nulo ou indefinido'
    if (!item.title || !item.title.trim()) 
      throw 'item.title não pode ser nulo ou indefinido'
      // .trim() remove espaços; garante que um título "   " (só espaços) também seja rejeitado
    items.push(item)
    await this.saveListToDisk()
    // Persiste a alteração no arquivo imediatamente após adicionar
  }

  /**
   * Remove um item da lista de item pelo indice
   */
  async removeItem(index: number) {
    const items = await this.items
    items.splice(index, 1)
    // splice(index, 1) remove exatamente 1 elemento na posição `index`
    // Obs: não há validação de índice fora dos limites aqui; isso é tratado no server.ts
    await this.saveListToDisk()
  }

  /**
   * Retona uma cópia da lista de itens
   */
  async getItems() {
    const items = await this.items
    return Array.from(items)
    // Array.from cria uma cópia nova do array, evitando que quem chamou esse método
    // possa alterar o array interno da classe (encapsulamento/proteção de estado)
  }
}

export default TodoList
export { Item, TodoList }
// Exporta tanto como default (TodoList) quanto nomeado (Item, TodoList),
// permitindo os dois estilos de import usados no server.ts