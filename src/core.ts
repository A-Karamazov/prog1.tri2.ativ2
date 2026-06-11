
// Lydia Hallie : Event Loop

/**
 * @todo
 * known issues:
 * - getItems needs to await loadListFromDisk()
 */

// class Item_ { 
//   public title: string
//   constructor(title: string) {
//     this.title = title
//   }
// }

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

  private async saveListToDisk() {
    const file = Bun.file(this.filePath)
    const data = JSON.stringify(await this.items)
    await file.write(data)
  }

  private async readListFromDisk() {
    const file = Bun.file(this.filePath)
    // const text = await file.text()
    // const data = JSON.parse(text)
    const data = await file.json()
    const items: Item[] = data.map((v: any) => {
      return new Item(v.title)
    })
    return items
  }

  /**
   * Adiciona um novo item na lista de item
   */
  async addItem(item: Item) {
    const items = await this.items
    if (!item) 
      throw 'item não pode ser nulo ou indefinido'
    if (!item.title || !item.title.trim()) 
      throw 'item.title não pode ser nulo ou indefinido'
    items.push(item)
    await this.saveListToDisk()
  }

  /**
   * Remove um item da lista de item pelo indice
   */
  async removeItem(index: number) {
    const items = await this.items
    items.splice(index, 1)
    await this.saveListToDisk()
  }

  /**
   * Retona uma cópia da lista de itens
   */
  async getItems() {
    const items = await this.items
    return Array.from(items)
  }
}

export default TodoList
export { Item, TodoList }
