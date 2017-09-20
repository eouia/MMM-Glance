/*********************************
  Magic Mirror Module:
  MMM-Glance
  By eouia

  MIT Licensed

*********************************/

Module.register("MMM-Glance", {


  defaults: {
    defaultGlancingTime : 10000,
    alias: {}
  },

  start: function() {
    this.status = {}
    this.alias = {}
    this.timer = null
    this.defaultAlias = {
      "news" : "newsfeed",
      "weather" : "currentweather",
      "forecast" : "weatherforecast",
      "hello" : "helloworld",
      "test" : ["clock", "newsfeed"]
    }
  },

  getCommands: function(register) {
    if (register.constructor.name == 'TelegramBotCommandRegister') {
      register.add({
        command: "glancenames",
        description: "List of all available glancable names.",
        callback: "cmd_glancenames"
      })
      register.add({
        command: "glance",
        description: "glance specific module(s) for a while.\n`/glance NAME` or `/glance NAME SECONDS`\ne.g)`/glance clock 5`",
        args_pattern: ["(.*)(?:\s([0-9]+))?"],
        callback: "cmd_glance"
      })
    }
  },

  cmd_glance: function(handler) {
    console.log("here???")
    if (handler.constructor.name == 'TelegramBotMessageHandler') {
      console.log(handler.args)
    }
  },

  cmd_glancenames: function(handler) {
    var text=""
    text = Object.keys(this.alias).join()
    handler.reply("TEXT", text)
  },

  initialize: function() {
    var self = this
    MM.getModules().enumerate(function(m) {
      self.alias[m.name] = m.name
    })
    this.alias = Object.assign({}, this.alias, this.defaultAlias, this.config.alias)
    console.log(this.alias)
  },

  glanceOn : function (call, time) {
    var filter = []
    var self = this
    if (Object.keys(this.alias).indexOf(call) >= 0) {
      var modules = this.alias[call]
      if (Array.isArray(modules)) {
        filter = modules
      } else {
        filter.push(modules)
      }
    }


    if (Object.keys(self.status).length == 0) {
      MM.getModules().enumerate(function(m) {
        if (m.data.position) {
          self.status[m.name] = m.hidden
        }
      })
    }
    console.log('status', self.status)
    MM.getModules().enumerate(function(m) {
      if (Object.values(filter).indexOf(m.name) >= 0) {
        m.show(0)
      } else {
        m.hide(0)
      }
    })
    this.sendNotification('GLANCE_STARTED', {modules:filter, time:time})
    this.timer = setTimeout(function(){
      self.glanceOff()
    }, time)
  },

  glanceOff: function() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
      var self = this
      MM.getModules().enumerate(function(m) {
        if (typeof self.status[m.name] !== 'undefined') {
          if (self.status[m.name]) {
            m.hide(0)
          } else {
            m.show(0)
          }
        }
      })
      this.status = {}
      this.sendNotification('GLANCE_ENDED')
    }
  },

  notificationReceived: function(notification, payload, sender) {
    switch(notification) {
      case 'DOM_OBJECTS_CREATED':
        this.initialize()
        break
      case 'GLANCE_ON':
        this.glanceOn(payload.name, payload.time)
        break
      case 'GLANCE_OFF':
        this.glaceOff()
        break
    }
  },
})
