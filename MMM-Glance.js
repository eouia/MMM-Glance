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
    this.glancing = false
    this.timer = null
    this.defaultAlias = {
      "news" : "newsfeed",
      "weather" : "currentweather",
      "forecast" : "weatherforecast",
      "hello" : "helloworld",
      "test" : ["clock", "newsfeed"]
    }
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
    }
  },

  getCommands: function(register) {
    if (register.constructor.name == 'TelegramBotCommandRegister') {
      register.add({
        command: "glanceables",
        description: this.translate("CMD_GLANCENAMES_DESCRIPTION"),
        callback: "cmd_glancenames"
      })
      register.add({
        command: "glance",
        description: this.translate("CMD_GLANCE_DESCRIPTION"),
        args_pattern: [/.*/],
        args_mapping: ["name"],
        callback: "cmd_glanceon"
      })
      register.add({
        command: "glanceoff",
        description: this.translate("CMD_GLANCEOFF_DESCRIPTION"),
        callback: "cmd_glanceoff"
      })
    }
    if (register.constructor.name == 'AssistantCommandRegister') {
      register.add({
        command: this.translate("CMD_ASSTNT_GLANCEABLENAMES"),
        description: this.translate("CMD_GLANCENAMES_DESCRIPTION"),
        callback: "cmd_glancenames"
      })
      register.add({
        //command: "glance :name",
        command: this.translate("CMD_ASSTNT_GLANCE"),
        description: this.translate("CMD_ASSTNT_GLANCE_DESCRIPTION"),
        callback: "cmd_glanceon"
      })
      register.add({
        command: this.translate("CMD_ASSTNT_GLANCEOFF"),
        description: this.translate("CMD_GLANCEOFF_DESCRIPTION"),
        callback: "cmd_glanceoff"
      })
    }
  },

  cmd_glanceon: function(command, handler) {
    if (handler.args) {
      var ret = this.glanceOn(handler.args.name)
      if (ret) {
        handler.reply("TEXT", this.translate("CMD_GLANCE_SUCCESS"))
      } else {
        handler.reply("TEXT", this.translate("CMD_GLANCE_IMPOSSIBLE"), handler.args.name)
      }
    } else {
      handler.reply("TEXT", this.translate("CMD_GLANCE_NO_ARGS"))
    }

  },
  cmd_glanceoff: function(command, handler) {
    this.glanceOff()
    handler.reply("TEXT", this.translate("CMD_GLANCE_SUCCESS"))
  },

  cmd_glancenames: function(command, handler) {
    var text=""
    text = Object.keys(this.alias).join()
    handler.reply("TEXT", text)
  },

  initialize: function() {
    var self = this
    MM.getModules().enumerate(function(m) {
      if(m.data.position) {
        self.alias[m.name] = m.name
      }
      })
    this.alias = Object.assign({}, this.alias, this.defaultAlias, this.config.alias)
  },

  glanceOn : function (call, time) {
    var filter = []
    var self = this

    if (!time) {
      time = this.config.defaultGlancingTime
    }
    if (Object.keys(this.alias).indexOf(call) >= 0) {
      var modules = this.alias[call]
      if (Array.isArray(modules)) {
        filter = modules
      } else {
        filter.push(modules)
      }
    } else {
      return false
    }

    if (!this.glancing) {
      MM.getModules().enumerate(function(m) {
        if (m.data.position) {
          self.status[m.name] = m.hidden
        }
      })
    }
    MM.getModules().enumerate(function(m) {
      if(Object.values(filter).indexOf(m.name) >= 0) {
        matched = 1
      }
    })


    if (matched == 0) {
      return false
    } else {
      clearTimeout(this.timer)
      this.timer = null
      MM.getModules().enumerate(function(m) {
        if (Object.values(filter).indexOf(m.name) >= 0) {
          m.show(0)
        } else {
          m.hide(0)
        }
      })
      this.glancing = true
      this.sendNotification('GLANCE_STARTED', {modules:filter, time:time})
      this.timer = setTimeout(function(){
        self.glanceOff()
      }, time)
      return true
    }
  },

  glanceOff: function() {
    this.glancing = false
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
      return true
    }
    return false

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
