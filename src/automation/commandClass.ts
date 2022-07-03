export abstract class CommandClass {
  protected name: string
  protected description: string

  constructor() {
    this.name = null
    this.description = null
  }

  abstract exec(interaction) : any

  getName() : string {
    return this.name
  }

  toJSON() : Object {
    return {
        name: this.name,
        description: this.description
    }
  }
}
