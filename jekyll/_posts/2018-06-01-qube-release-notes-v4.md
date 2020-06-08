---
layout: post
title:  "qube v4 Release Notes"
date:   2018-06-01 09:23:45 -0700
summary: "MASS TELEPORTATION. Enough said."
author: nikhila
tags: release-notes
---

A new version of qube is available! This version features *streamlined meetings*.

## GUEST USERS
View interviewees, board members, customers, and other non-qube personnel<sup>1</sup>.

## JOIN MEETING SYNCHRONIZATION
Joining a qube hosted Zoom meeting (for example, when joining a customer support call by clicking on an external Zoom link) will update your location in qube. Now everyone can see that you’re already taken!

## LEAVE MEETING SYNCHRONIZATION
Leaving a meeting in Zoom now sends you home automatically. Sorry, this means no more ducking out of meetings discreetly!

## INTERVENTION NEEDED WARNINGS
We’re not always able to start your Zoom meeting on your behalf - usually resulting from your browser/OS security settings or application focus. When this happens, we’ll send you a notification indicating that you should click the ‘join meeting’ button to start the meeting.

## LOW-BANDWIDTH FRIENDLY CONFERENCE ROOMS
We will now wait for meeting hosts on super slow Internet connections (◔_◔) to start Zoom meetings before pulling in meeting participants. This means no more annoying ‘The meeting has ended’ messages’ when joining standup!

## INVITE ALL
There’s an invite all button for the auditorium/cafeteria so the CEO can invite everyone who’s available to company meetings with a single click, and we can get started quicker. Plus, apparently not everyone appreciates receiving a flood of notifications, so…

## MASS TELEPORTATION
Okay, not really. But meetings are automatically moved from offices to an available conference room if your room becomes overly crowded. And if that’s not mass teleportation, I’m not sure what is.

## WRONG MEETING ROOM FORGIVENESS
Did you start a scheduled meeting in your office accidentally? Now, Meetings move with you when you jump into an open conference room.

Other notable features/bugfixes:

- We’ve added official support for multiple browsers, so people who regularly switch computers don’t end up in weird states. You will be automatically logged you out of previous sessions.
- Back by reminders when you’re busy, because it seems a great many people need them *cough cough*
- Now you can watch people who are offline, because pouncing on someone as soon as they come back from vacation is a sign of respect. At least that’s what I’ve learned from pet cats.
- We’ve finally addressed the triple notifications issue. We think. I mean, we couldn’t reproduce it anymore, so it’s probably gone. (Let us know if it’s not). p
When switching from busy to available, your status will clear itself for you #laziness
- Back by times pulled from scheduled meeting times in Zoom are now correct (Sigh. DateTime math never gets any easier)
- We’ve added a modal to judge you harshly for attempting to use qube on a phone - just in case you try

If you’ve read this far into the release notes, you might be a developer! So quick note on the app from a development perspective - qube has been completely re-written from Angular to React and refactored for performance. Although we have rigorously manual tested the application to maintain feature parity, we may have missed something. So please make sure to let me and Birgit know if you notice anything suspicious. Thanks!

<sup>1</sup>_Disclaimer: Note that guest user support is best effort only. No guarantees are made to ensure the consistency or correctness of guest users. In fact, all guest users will magically disappear on refresh. Surprise!_
