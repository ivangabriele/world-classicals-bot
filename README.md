# World Classicals Bot

A simple bot utilizing Lichess API to auto-generate tournaments for
[World Classicals Team](https://lichess.org/team/world-classicals).

## Setup

### macOS

We can use [launchd](https://www.manpagez.com/man/8/launchd/) to schedule the bot.

First, create a new `plist` file within `~/Library/LaunchAgents` directory:

**`~/Library/LaunchAgents/com.world-classicals-bot.agent.plist`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>Label</key>
        <string>com.world-classicals-bot.agent.plist</string>

        <key>RunAtLoad</key>
        <true/>

        <key>StartInterval</key>
        <integer>60</integer>

        <key>StandardErrorPath</key>
        <string>[WORLD_CLASSICAL_BOT_PATH]/stderr.log</string>

        <key>StandardOutPath</key>
        <string>[WORLD_CLASSICAL_BOT_PATH]/stdout.log</string>

        <key>EnvironmentVariables</key>
        <dict>
            <key>PATH</key>
            <string><![CDATA[/usr/local/bin]]></string>
        </dict>

        <key>WorkingDirectory</key>
        <string>[WORLD_CLASSICAL_BOT_PATH]</string>

        <key>ProgramArguments</key>
        <array>
            <string>/usr/local/bin/node</string>
            <string>src/index.js</string>
        </array>
    </dict>
</plist>
```

> **⚠️ Important**  
> Don't use `~` in your `WORLD_CLASSICAL_BOT_PATH` but the full absolute path.

Then let's load this file into `launchd`:

```sh
launchctl load ~/Library/LaunchAgents/com.world-classicals-bot.agent.plist
```

We can unload this agent later on via a simple `launchctl unload …`.
