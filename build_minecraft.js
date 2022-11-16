const mineflayer = require('mineflayer')


const options = {
    host: '192.168.1.74', // Change this to the ip you want.
    port: 61689, // Change this to the port you want.
    username: 'Agent Benjamin'
  }



  function lookAtNearestPlayer () {
    const playerFilter = (entity) => entity.type === 'player'
    const playerEntity = bot.nearestEntity(playerFilter)
    
    if (!playerEntity) return
    
    const pos = playerEntity.position.offset(0, playerEntity.height, 0)
    bot.lookAt(pos)
  }
  const bot = mineflayer.createBot(options)
  bot.on('physicTick', lookAtNearestPlayer)
