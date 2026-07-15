# GoalOS
## Product Requirements Document (PRD)

Version: 1.0

---

# 1. Overview

GoalOS is a **local-first desktop productivity application** that combines task management with automatic computer activity tracking.

Unlike traditional task managers, GoalOS automatically records how the user spends their day and compares actual work against planned work.

The application runs completely offline and stores all data locally.

No user account.
No cloud.
No backend.
No telemetry.

---

# 2. Vision

Help users answer three questions every day.

- What did I plan?
- What did I actually do?
- How can I improve tomorrow?

---

# 3. Goals

- Fast task management
- Automatic activity tracking
- Daily productivity analytics
- Focus measurement
- Privacy-first architecture
- Cross-platform support
- Zero configuration

---

# 4. Target Users

- Software Developers
- Students
- Designers
- Freelancers
- Writers
- Researchers
- Remote Workers

---

# 5. Core Principles

## Local First

Everything remains on the user's computer.

## Offline First

Internet connection is never required.

## Privacy First

No user data leaves the machine.

## Automatic

No manual timers.

## Lightweight

Memory usage should stay minimal.

---

# 6. Technology Stack

## UI

- React
- TypeScript
- Vite
- TailwindCSS

## Desktop

Electron

## State Management

Zustand

## Local Database

SQLite

## ORM

Drizzle ORM

## Charts

Recharts

## Validation

Zod

## Forms

React Hook Form

---

# 7. Architecture

```
+------------------------------------------------------+
|                  Electron Application                |
|------------------------------------------------------|
|                                                      |
|  React Renderer                                      |
|      │                                               |
|      │ IPC                                           |
|      ▼                                               |
|  Electron Main Process                               |
|      │                                               |
|      ├── Activity Tracker                            |
|      ├── Idle Monitor                                |
|      ├── Notification Service                        |
|      ├── Database Layer                              |
|      └── Settings Manager                            |
|                                                      |
|              SQLite Database                         |
+------------------------------------------------------+
```

---

# 8. Modules

- Dashboard
- Tasks
- Goals
- Activity Tracking
- Focus Analytics
- Reports
- Settings

---

# 9. Functional Requirements

---

# Dashboard

Display

- Today's Date
- Greeting
- Tasks Remaining
- Tasks Completed
- Daily Progress
- Screen Time
- Focus Time
- Idle Time
- Productivity Score
- Active Goal
- Today's Timeline

Dashboard updates automatically.

---

# Tasks Module

Task properties

- ID
- Title
- Description
- Due Date
- Due Time
- Priority
- Estimated Duration
- Actual Duration
- Category
- Tags
- Status
- Created Date
- Modified Date
- Completed Date
- Reminder
- Repeat Rule
- Goal Association
- Color
- Notes

Operations

- Create Task
- Edit Task
- Delete Task
- Archive Task
- Complete Task
- Duplicate Task
- Reorder Task
- Filter
- Search
- Sort

---

# Daily Planner

Users can plan today's work.

Support

Morning Planning

```
□ Build API

□ Exercise

□ Read Book

□ Meeting

□ Grocery
```

Completion percentage updates instantly.

---

# Goals

Each goal contains

- Name
- Description
- Start Date
- Target Date
- Color
- Icon
- Status
- Progress
- Linked Tasks
- Hours Invested

Example

```
Goal

Become React Expert

Progress

62%

Hours Invested

142

Tasks Completed

54
```

---

# Activity Tracking

Automatically monitor

- Active Window
- Active Application
- Window Title
- Process Name
- Process ID
- Start Time
- End Time
- Duration

Example

```
09:10

Visual Studio Code

Employee.ts

09:42

Google Chrome

StackOverflow

09:51

Terminal

npm run dev
```

Tracking occurs automatically.

No user interaction required.

---

# Window Change Detection

Tracker polls every 2–5 seconds.

If active window changes

- End previous session
- Create new session

---

# Screen Time

Calculate

Daily Screen Time

Weekly Screen Time

Monthly Screen Time

Yearly Screen Time

---

# Application Usage

Track

- Application Name
- Total Duration
- Number of Opens
- Average Session
- Longest Session

Example

```
VS Code

5h 12m

Chrome

2h 11m

Terminal

45m

Slack

22m
```

---

# Focus Detection

Focus starts

- User is active
- Same application
- Same task

Focus ends

- Idle
- Application switch
- Lock screen
- Sleep
- Shutdown

Metrics

- Longest Focus Session
- Average Focus
- Deep Work Time
- Context Switch Count

---

# Idle Detection

Detect

- Mouse inactivity
- Keyboard inactivity

Store

Start Time

End Time

Duration

Reason

---

# Away Detection

Track

- Lock Screen
- Sleep
- Shutdown
- Manual Pause

---

# Timeline

Generate chronological timeline.

Example

```
09:00 VS Code

09:35 Chrome

09:42 Terminal

10:10 Idle

10:18 VS Code
```

---

# Reports

Daily

Weekly

Monthly

Yearly

Include

- Screen Time
- Focus Time
- Idle Time
- App Usage
- Task Completion
- Productivity Score

---

# Search

Global search

Search

- Tasks
- Goals
- Applications
- Reports

---

# Notifications

Support

- Due Reminder
- Break Reminder
- Daily Planning Reminder
- Goal Reminder

---

# Settings

General

Appearance

Theme

Tracking

Privacy

Notifications

Database

Backup

Restore

Shortcuts

Startup

---

# Backup

Manual Export

SQLite Database

JSON

CSV

---

# Import

SQLite

JSON

CSV

---

# Analytics

Calculate

Daily Productivity

Task Completion %

Focus %

Average Session

Longest Session

Context Switches

Most Used Software

Least Used Software

Most Productive Hour

Most Distracted Hour

---

# Productivity Score

Formula

```
Completed Tasks

Focus Time

Idle Time

Distraction Time

Goal Progress

↓

Final Score

0-100
```

---

# Charts

Bar

Pie

Area

Timeline

Heatmap

Calendar

---

# Filters

Today

Yesterday

This Week

Last Week

This Month

Custom Range

---

# Tags

Unlimited tags

Examples

```
Work

Personal

Study

Coding

Meeting
```

---

# Categories

Examples

- Work
- Learning
- Health
- Finance
- Personal

---

# Keyboard Shortcuts

New Task

Search

Toggle Tracker

Quick Add

Daily Planner

Settings

---

# System Tray

Minimize to tray

Start tracking

Pause tracking

Quit

Open Dashboard

---

# Auto Start

Option

Start GoalOS when operating system starts.

---

# Activity Tracking Engine

Runs continuously.

Frequency

2 seconds

Workflow

```
Current Window

↓

Compare Previous

↓

Changed?

↓

Yes

↓

Store Previous Session

↓

Create New Session
```

---

# Database Schema

Tables

```
tasks

goals

activity_sessions

focus_sessions

idle_sessions

daily_stats

weekly_stats

monthly_stats

application_usage

categories

tags

settings

notifications
```

---

# Non Functional Requirements

---

## Performance

Cold startup

< 2 seconds

Memory

< 200 MB

CPU

< 2% while idle

Database queries

< 100 ms

---

## Reliability

No data loss after crash.

Automatic database recovery.

Atomic transactions.

---

## Security

No internet access required.

No analytics.

No telemetry.

Encrypted local backups (optional).

---

## Privacy

Never upload data.

Everything stored locally.

No tracking by third parties.

---

## Scalability

Support

100,000+ activity records

50,000+ tasks

Without noticeable slowdown.

---

## Maintainability

Modular architecture.

Strict TypeScript.

ESLint.

Prettier.

Unit tests.

---

## Accessibility

Keyboard navigation.

Screen reader compatibility.

High contrast mode.

Adjustable font size.

---

## Compatibility

Windows 10+

Windows 11

macOS 13+

Ubuntu 22+

Other Linux distributions where supported.

---

## Error Handling

Recover from

Database corruption

Unexpected shutdown

Power failure

OS sleep

Permission denial

---

# Future Features

- AI Daily Summary
- Calendar Integration
- Git Integration
- Browser History Analysis
- Website Categorization
- Pomodoro Timer
- Habit Tracker
- Notes
- Markdown Editor
- Time Blocking
- Screenshot Timeline
- OCR
- Plugin Marketplace
- Browser Extension
- Mobile Companion App
- Cross-device Sync (optional)

---

# Out of Scope (v1)

- User Accounts
- Cloud Sync
- Team Collaboration
- Online Storage
- Subscription Features
- AI Processing
- Mobile App
- Web Version

---

# Success Metrics

- Startup under 2 seconds
- Tracker accuracy >99%
- CPU usage <2%
- Memory <200 MB
- Zero internet dependency
- No data loss during unexpected shutdown
- Accurate activity timeline
- Responsive UI (<16 ms interactions)
- Support for 100k+ activity records without noticeable lag