const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin
const { pathfinder, Movements, goals} = require('mineflayer-pathfinder')

const armorManager = require('mineflayer-armor-manager')
const navigatePlugin = require('mineflayer-navigate')(mineflayer);
const GoalFollow = goals.GoalFollow
const GoalBlock = goals.GoalBlock
const { GoalXZ, GoalY } = require('mineflayer-pathfinder').goals
/*
Sistemas Inteligentes
Juan Carlos Cabrera Vega
A01702008
*/
var vec3 = mineflayer.vec3;
var v = require('vec3');
var v1 = v(-95, -61, 61);
const options = {
    host: 'localhost', // Change this to the ip you want.
    port: 60894, // Change this to the port you want.
    username: 'AgentIA',
    'spawnPoint': v1,
  }

  const bot = mineflayer.createBot(options)
  bot.loadPlugin(pvp)
  bot.loadPlugin(armorManager)
  bot.loadPlugin(pathfinder)
  navigatePlugin(bot);

  bot.on('kicked', console.log)
bot.on('error', console.log)
  // function lookAtNearestPlayer () {
  //   const playerFilter = (entity) => entity.type === 'player'
  //   const playerEntity = bot.nearestEntity(playerFilter)
    
  //   if (!playerEntity) return
    
  //   const pos = playerEntity.position.offset(0, playerEntity.height, 0)
  //   bot.lookAt(pos)
  // }

  bot.on('login', () => {
    console.log('\n===== Server Minecraft: Begin Agent =====\n');
    bot.chat('Hello player');
    Commands();
  });

  bot.on('end', (reason) => {
    console.log('\n--- Agent quit the server ---\n');
    process.exit(1);
  });
  
  bot.on('health', () => {
    let health = bot.health/2; bot.chat('<Health: ' + health.toFixed(1) + ' hearts>');
  });


bot.on('playerCollect', (collector, itemDrop) => {
    if (collector !== bot.entity) return
  
    setTimeout(() => {
      const sword = bot.inventory.items().find(item => item.name.includes('sword'))
      if (sword) bot.equip(sword, 'hand')
    }, 150)
  })
  
  bot.on('playerCollect', (collector, itemDrop) => {
    if (collector !== bot.entity) return
  
    setTimeout(() => {
      const shield = bot.inventory.items().find(item => item.name.includes('shield'))
      if (shield) bot.equip(shield, 'off-hand')
    }, 250)
  })
  
  let guardPos = null
  
  function guardArea (pos) {
    guardPos = pos.clone()
  
    if (!bot.pvp.target) {
      moveToGuardPos()
    }
  }
  
  function stopGuarding () {
    guardPos = null
    bot.pvp.stop()
    bot.pathfinder.setGoal(null)
  }
  
  function moveToGuardPos () {
    const mcData = require('minecraft-data')(bot.version)
    bot.pathfinder.setMovements(new Movements(bot, mcData))
    bot.chat('Proteger:'+guardPos.x+ ' '+ guardPos.y +' '+guardPos.z) // Protect Position
    bot.pathfinder.setGoal(new goals.GoalBlock(guardPos.x, guardPos.y, guardPos.z))
  }
  
  bot.on('stoppedAttacking', () => {
    if (guardPos) {
      moveToGuardPos()
    }
  })
  
  bot.on('physicTick', () => { //function fisico 
    if (bot.pvp.target) return
    if (bot.pathfinder.isMoving()) return
  
    const entity = bot.nearestEntity()
    if (entity) bot.lookAt(entity.position.offset(0, entity.height, 0))
  })
  
  bot.on('physicTick', () => {//function fisico 
    if (!guardPos) return //checking guard active
  
    const filter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 8 &&
                        e.mobType !== 'Armor Stand' // Mojang classifies armor stands as mobs for some reason?
  
    const entity = bot.nearestEntity(filter)
    if (entity) {
      //bot.chat(entity.displayName)
      bot.pvp.attack(entity)
    }
  })
  function Commands() {
    bot.chat("!!! list    -> list commands")
    bot.chat('guard       -> protect area')
    bot.chat('fight me    -> fight with player')

    bot.chat('arrive      -> follow player')
    bot.chat('follow        -> follow player walk')
   // bot.chat('find [arg]  -> print blocks finds');
    bot.chat('goto [ x y z] or [x y] or [z] > move player to specified location')
    bot.chat('searchBlock   -> find block for agent')
    bot.chat('------Changes mode game ---------')
    bot.chat('peaceful    -> changes mode game a pacific')
    bot.chat('normal      -> changes mode game a normal ')
    bot.chat('stop        -> stop following')
    bot.chat('fin  -> end agent')
}

  bot.on('chat', (username, message) => {
   // const player = bot.players[username]
   // bot.chat(player.entity.position.x)
    if (message === 'guard') {
      const player = bot.players[username]
  
      if (!player) {
        bot.chat("I can't see you.")
        return
      }
  
      bot.chat('I will guard that location.')
      guardArea(player.entity.position)
    }
  
    if (message === 'fight me') {
      const player = bot.players[username]
  
      if (!player) {
        bot.chat("I can't see you.")
        return
      }
  
      bot.chat('Prepare to fight!')
      bot.pvp.attack(player.entity) // agent flight with me
    }
  
    if (message === 'stop') {
      bot.chat('I stay in this area')
      stopGuarding()
    }
    if(message ==='follow'){
        const playerCI = bot.players[username]

        if (!playerCI || !playerCI.entity) {
            bot.chat(`I can t see ${username}`)
            return
        }
    
        const mcData = require('minecraft-data')(bot.version)
        const movements = new Movements(bot, mcData)
        movements.scafoldingBlocks = []
    
        bot.pathfinder.setMovements(movements)
    
        const goal = new GoalFollow(playerCI.entity, 3)
        bot.pathfinder.setGoal(goal, true)
    }
    if(message ==='arrive'){
        const target = bot.players[username].entity;
        bot.chat(`${username}`)
        if (!target) {
            bot.chat(`I can't see ! ${username}` )
            return
        }
        bot.navigate.to(target.position);
    }
      if (message.startsWith('goto')) {
        const cmd = message.split(' ')
  
        if (cmd.length === 4) { // goto x y z
          const x = parseInt(cmd[1], 10)
          const y = parseInt(cmd[2], 10)
          const z = parseInt(cmd[3], 10)
  
          bot.pathfinder.setGoal(new GoalBlock(x, y, z))
        } else if (cmd.length === 3) { // goto x z
          const x = parseInt(cmd[1], 10)
          const z = parseInt(cmd[2], 10)
  
          bot.pathfinder.setGoal(new GoalXZ(x, z))
        } else if (cmd.length === 2) { // goto y
          const y = parseInt(cmd[1], 10)
  
          bot.pathfinder.setGoal(new GoalY(y))
        }
    }
    if( message ==='searchBlock'){
        const mcData = require('minecraft-data')(bot.version) //access data minecraft
        const movements = new Movements(bot, mcData)
        movements.scafoldingBlocks = []
        bot.pathfinder.setMovements(movements)
        //console.log(mcData.blocksByName.stone)
        const Block = bot.findBlock({
            matching: mcData.blocksByName.gold_block.id,
            maxDistance: 32
        })
    
        if (!Block) {
            bot.chat("I can't see any stone blocks!")
            return
        }
    
        const x = Block.position.x
        const y = Block.position.y + 1
        const z = Block.position.z
        const goal = new GoalBlock(x, y, z)
        bot.pathfinder.setGoal(goal)
    
    }

    if (message.startsWith('find')) {
      /**
       * Function for find blocks specific por player
       */
        const name = message.split(' ')[1]
        if (bot.registry.blocksByName[name] === undefined) {
          bot.chat(`${name} is not a block name`)
          return
        }
        const ids = [bot.registry.blocksByName[name].id]
    
        const startTime = performance.now()
        const blocks = bot.findBlocks({ matching: ids, maxDistance: 128, count: 10 })
        const time = (performance.now() - startTime).toFixed(2)
    
        bot.chat(`YEAH!!I found ${blocks.length} ${name} blocks : ID { ${ids} }`)
      }
      if(message === 'peaceful'){
        //change gamemode a peaceful
        bot.chat('/difficulty peaceful')
        bot.chat('/time set day')
      }

      if(message === 'normal'){
        //change gamemode a normal
        bot.chat('/difficulty normal')
        bot.chat('/time set night')
      }
      if(message === 'list'){
        Commands()
      }
      if(message === 'fin'){
        bot.chat('Bye myfriend')
        bot.end()
      }
      
  })