# MMM-Glance
To glance specific module and hide others.
You can use this to reveal some module(s) and hide others for a short time. It could be convenient when you are using too many modules or using background image modules.

## Installation
```sh
cd <Your MagicMirror Directory>/modules
git clone https://github.com/eouia/MMM-Glance
```


## Configuration
Add below codes in your `config.js`.
```javascript
{
  module: 'MMM-Glance',
}
```

You can use more detailed configuration like these; See the below section.
```javascript
{
  module: 'MMM-Glance',
  config: {
    defaultGlancingTime: 10000,
    alias: {
      "news" : "newsfeed",
      "party mode" : ["clock", "helloworld", "MMM-Something"],
      ...
    }  
  }
}
```

### Configuration values

|name |default value |description
|--- |---|---
|defaultGlancingTime | 10000 |Duration time(milliseconds) for glancing mode. After this time, previous screen will be back.
|alias | {`name` : `module name` or array of `module name`} | - You can use this field for glancing multi modules at a same time. <br>e.g) `{"party mode":["clock", "MMM-DropboxWallpaper"}` => You can reveal these 2 modules by calling `party mode`<br> - For easy use with `MMM-TelegramBot` or `MMM-Assistant`. When you feel the difficutly to type or to pronounce `MMM-BlahBlahModule`, you can use this field for changing easier name. <br>e.g) `{"sensor":"MMM-HDC1080"}`

## How to use
### with Notification
```javascript
this.sendNotification("GLANCE_ON", {name:"helloworld", time:10000)
this.sendNotification("GLANCE_OFF")
```
|notification |payload |description
|--- |--- |---
|GLANCE_ON | {name: "`<module name>`", time:`<milliseconds>`} | reveal some module(s). alias for module name is available.
|GLANCE_OFF | | back to previous screen.

### with `MMM-TelegramBot`
|command | description
|--- |---
|`/glance` name| reveal some module(s). alias for module name is available.
|`/glanceoff` | back to previous screen.
|`/glanceables` | list of glanceable modules and aliases.


### with `MMM-Assistant`
|command | description
|--- |---
|`glance at :name`| reveal some module(s). alias for module name is available.
|`glance mode off` | back to previous screen.
|`list of glance` | list of glanceable modules and aliases.

If you have a trouble of pronouncing command or module name, you can use `alias` of `MMM-Assistant` for command and `alias` of `MMM-Glance` for module.

