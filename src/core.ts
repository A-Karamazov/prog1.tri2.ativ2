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
    const data = await file.json()
    const items: Item[] = data.map((v: any) => {
      return new Item(v.title)
    })
    return items
  }

  async addItem(item: Item) {
    const items = await this.items  // Resolve a Promise para obter o array real e poder usar .push()
    if (!item) 
      throw 'item não pode ser nulo ou indefinido'
    if (!item.title || !item.title.trim()) // .trim() remove espaços; garante que um título "   " (só espaços) também seja rejeitado
      throw 'item.title não pode ser nulo ou indefinido'
    items.push(item)
    await this.saveListToDisk()
  }

  async removeItem(index: number) {
    const items = await this.items
    items.splice(index, 1)
    await this.saveListToDisk()
  }

  async getItems() {
    const items = await this.items
    return Array.from(items)
  }
}

export default TodoList
export { Item, TodoList }