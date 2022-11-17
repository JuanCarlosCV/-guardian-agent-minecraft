const mineflayer = require('mineflayer')


const options = {
    host: 'localhost', // Change this to the ip you want.
    port: 60464, // Change this to the port you want.
    username: 'AgentBenjamin'
  }



  function lookAtNearestPlayer () {
    const playerFilter = (entity) => entity.type === 'Carlos'
    const playerEntity = bot.nearestEntity(playerFilter)
    
    if (!playerEntity) return
    
    const pos = playerEntity.position.offset(0, playerEntity.height, 0)
    bot.lookAt(pos)
  }
  const bot = mineflayer.createBot(options)
  bot.on('physicTick', lookAtNearestPlayer)
