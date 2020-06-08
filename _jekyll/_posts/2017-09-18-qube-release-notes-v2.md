---
layout: post
title:  "qube v2 Release Notes"
date:   2017-09-18 01:13:22 -0700
summary: "People watching and extra darkness, because we care."
author: nikhila
tags: release-notes
---


A new update of qube is available, and we have some exciting new features for you!

## Scheduled Zoom Meeting Support
- For customer support and sales especially! When you schedule a Zoom meeting with a (potential) customer, qube will automatically update your state to ‘busy’ and your status with relevant details.
- Offices can now host scheduled meetings. That means if you get stuck in a customer call and need developer support, you can invite a developer to your office (instead of copying/pasting the Zoom link or forwarding a meeting invite).

## Stronger Slack Integration
- Forgot to update your qube status before stepping away? Update your status through slack using the new /qube command. Example: `/qube emergency ice cream break`

![watching]({{site.baseurl}}/pages/watching.png)

- Need to slack everyone in your office with notes at the end of a productive meeting? Use the new slack icons in the sidebar to open direct messages to the people you’re talking to.
- Is the person you’re trying to chat with available in qube and offline in slack? [rolling eyes] Don’t worry, we took care of it.
Note: Slack integration works best when you have the desktop client installed. Please install from https://slack.com/downloads on your primary computer(s) if you’re still using the browser version. It takes only 30 seconds.

## Zoom to Fit

## Intelligent Back By Times
- You’ll notice a new field for ‘back by’ when you set your state to away or BRB. Enter when you’ll be back in a supported format (such as 1400 or 3pm) in your local timezone. This lets us display all ‘back by’ times in local times in the sidebar. Of course, slack statuses still contain timezones.
- We’ve added a new ‘I’m back!’ button for when you return to the office - just an easier way to clear your status.
- Are you taking reeaaalllly long lunches because you keep forgetting to update your status when you get back? Well, no more! Slack reminders are here to check up on you when you forget.

## People Watching
- You know how some people always seem to be in meetings? (*cough cough*) Some of us have acquired the skill of pouncing exactly in between meetings. For everyone else, we’ve added the ability to “watch” people and be notified when they’re back from breakfast or finished with meetings.
- Watching works in reverse, too - if you’ve just ended a meeting, we’ll (wait a few minutes so you can catch your breath and then) send you a list of people who’re interested in talking to you.
Advanced feature - you can check the list of people you’re watching or who are watching you by running `/qube watching` or `/qube watchers` in slack. (Type `/qube help` if you need reminders of available slack commands).

## New Themes
I’ll call out darkKnight, for those who require absolute darkness to be content, and weather - this one’s built with a few surprises ;)

Other fixes/updates:
- Added new emoticons
- Added notification for all occupants in a room when someone invites a guest
- Added a condensed view of office occupants for popular individuals who invite more than three people to their personal office
- Added ‘under maintenance’/admin-only mode
- Added reconnecting websockets
