import { CommandClass } from '../automation/commandClass'
import { log } from '../main'

export class Hello extends CommandClass {
  constructor() {
    super()

    this.name = 'hello'
    this.description = 'Say hello'
  }

  exec(interaction) {
    const memberName = interaction.member.displayName
    interaction.reply(`Why hello there, ${memberName}, so nice of you to stop by!`)
  }
}
