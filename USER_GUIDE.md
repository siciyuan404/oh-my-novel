# User Guide for oh-my-novel

Comprehensive guide to using oh-my-novel for AI-powered novel generation.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Usage](#basic-usage)
3. [Advanced Features](#advanced-features)
4. [Long-Running Generation](#long-running-generation)
5. [Search and Research](#search-and-research)
6. [Session Management](#session-management)
7. [Configuration](#configuration)
8. [Best Practices](#best-practices)
9. [Examples](#examples)

---

## Getting Started

### First Time Setup

1. **Open OpenCode:**
   ```bash
   opencode
   ```

2. **Start Your First Novel:**
   ```
   Create a fantasy novel about a young wizard who discovers an ancient power
   ```

3. **Follow the Workflow:**
   The Novelist agent will automatically:
   - Consult the Plot Designer for story structure
   - Work with Character Developer to create characters
   - Collaborate with World Builder to establish the setting
   - Begin writing chapter by chapter

### Understanding the Workflow

```
User Request
    ↓
Novelist (Orchestrator)
    ↓
    ├─→ Plot Designer (Story structure)
    ├─→ Character Developer (Characters)
    ├─→ World Builder (Setting)
    └─→ Writer/Editor (Prose & Refinement)
```

### Project Structure

When you create a novel, the following structure is automatically created:

```
./novels/{title}/
├── metadata.json              # Novel metadata
├── plot-outline.md           # Story outline
├── chapters/
│   ├── chapter-1.md
│   ├── chapter-2.md
│   └── index.json            # Chapter index
├── characters/
│   ├── character-name.md
│   └── index.json
├── world-building/
│   ├── category-name.md
│   └── main.md
├── drafts/                     # Auto-saved drafts
└── progress-log.md           # Progress tracking
```

---

## Basic Usage

### Creating a Novel

#### Method 1: Direct Prompt

```
Create a fantasy novel about a dragon rider who must save their kingdom
```

#### Method 2: Use the Built-in Skill

```
Use the novel-generation-skill to create a science fiction novel set in a dystopian future
```

#### Method 3: Detailed Specification

```
Create a novel with these specifications:
- Genre: Urban fantasy
- Setting: Modern-day New York with magic
- Protagonist: A detective who can see spirits
- Antagonist: A secret society of dark wizards
- Plot: Solve a series of supernatural murders
```

### Writing Chapters

#### Write a Single Chapter

```
Write chapter 3 where the protagonist discovers the ancient artifact
```

#### Write Multiple Chapters

```
Write chapters 4-6, focusing on the protagonist's training
```

#### Continue from Last Chapter

```
Continue writing the novel from where we left off
```

#### Specify Chapter Length

```
Write chapter 7 (2000 words) about the battle scene
```

### Managing Characters

#### View All Characters

```
Show me all characters in this novel
```

#### Create a Character

```
Create a character named "Elena" - a skilled archer with a mysterious past
```

#### Update Character Details

```
Update Elena's backstory: She was trained by an ancient order of shadow hunters
```

#### Add Character Traits

``
Add these traits to Elena: Brave, resourceful, secretly fears losing control
```

### Plot Development

#### View Plot Outline

```
Show me the plot outline
```

#### Update Plot Point

```
Update the climax of the story: The protagonist discovers they are the heir to an ancient magical lineage
```

#### Add Plot Twist

```
Add a plot twist to chapter 10: The villain was actually trying to protect the protagonist all along
```

#### Reorganize Plot Structure

```
Reorganize the plot to move the confrontation earlier
```

### World Building

#### View World Notes

```
Show me all world-building notes
```

#### Add World Details

```
Add to the magic system: Fire magic requires emotional intensity; stronger emotions create more powerful flames
```

#### Create New Category

```
Create a world-building category for "Geography" with details about the kingdoms and landscapes
```

### Exporting Your Novel

#### Export as Markdown

```
Export the novel as a markdown file named "My Novel.md"
```

#### Export Specific Chapters

```
Export chapters 1-5 as a separate file
```

#### Export with Formatting

```
Export the novel with chapter numbers and section headers
```

---

## Advanced Features

### Using Categories

Categories apply optimized settings (model, temperature, tools) to specific tasks.

#### View Available Categories

```
List all categories
```

#### Apply a Category

```
Apply the "plotting" category to the novelist agent
```

#### Get Category Recommendation

```
Recommend the best category for "designing a magic system"
```

### Permission System

Control what agents can do with fine-grained permissions.

#### View Agent Permissions

```
Show me the permissions for the novelist agent
```

#### Modify Permissions

```jsonc
// In .opencode/oh-my-novel.jsonc
{
  "agents": {
    "novelist": {
      "permission": {
        "edit": "ask",
        "bash": {
          "git": "allow",
          "rm": "deny"
        }
      }
    }
  }
}
```

#### Permission Levels

- `ask`: Requires user confirmation before action
- `allow`: Allow action without confirmation
- `deny`: Block the action entirely

### Custom Skills

Create custom skills for specific workflows.

#### Create a Skill Template

```
Create a skill template for "romance writing"
```

This generates a skill file in `.claude/skills/` or `.opencode/skills/`.

#### Load a Custom Skill

```
Load the skill "romance-writing"
```

#### View Available Skills

```
List all skills
```

#### Skill Format

```markdown
---
name: romance-writing
description: Specialized skill for writing romance novels
model: openai/gpt-5.2
category: writing
temperature: 0.8
author: User
version: 1.0.0
enabled: true
skills:
---

# Romance Writing Skill

Focus on emotional depth, character chemistry, and relationship development.

## Key Elements

- Slow-burn romance
- Emotional tension
- Character growth through relationships
- Meaningful conflicts
- Satisfying resolutions

## Instructions

- Focus on internal monologues
- Build tension through dialogue and actions
- Show, don't tell emotions
- Create obstacles that test the relationship
- Ensure character growth is tied to romance
```

### Background Tasks

Run long-running tasks in the background while continuing to work.

#### Create a Background Task

```
Create a background task: Generate chapters 11-20 using the long-running-skill
```

#### List Background Tasks

```
List all background tasks
```

#### Check Task Status

```
Get the status of task task_abc123
```

#### Pause a Task

```
Pause task task_abc123
```

#### Resume a Task

```
Resume task task_abc123
```

#### Cancel a Task

```
Cancel task task_abc123
```

---

## Long-Running Generation

Generate novels with 100+ chapters with automatic recovery and checkpoints.

### Start Long-Running Generation

```
Start long-running generation for "Eternal Quest" with 100 chapters
```

### Configure Generation Parameters

```
Start long-running generation with:
- Total chapters: 50
- Batch size: 10
- Max retries: 3
- Retry delay: 5 seconds
- Checkpoint interval: 1 chapter
```

### Monitor Progress

```
Check progress for generation "eternal-quest-001"
```

Expected output:
```
Generation: eternal-quest-001
Status: running
Progress: 45/100 chapters (45%)
Failed chapters: 0
Last update: 2 minutes ago
```

### Pause and Resume

```
Pause generation "eternal-quest-001"
```

Later:
```
Resume generation "eternal-quest-001" from checkpoint
```

### Handle Failures

If a chapter fails to generate:

1. Automatic retry (up to max retries)
2. Check progress:
   ```
   Check progress for generation "eternal-quest-001"
   ```

3. If retries exhausted, manually fix:
   ```
   Manually write chapter 23 based on the outline
   ```

4. Resume generation:
   ```
   Resume generation "eternal-quest-001"
   ```

### Export State

Backup or transfer generation state:

```
Export state for "eternal-quest-001" to backup/
```

### List All Generations

```
List all generation tasks
```

Expected output:
```
Active Generations:
1. eternal-quest-001 (running) - 45/100 chapters
2. dragon-pact-002 (paused) - 30/50 chapters

Completed Generations:
3. star-wars-legacy (completed) - 100/100 chapters
```

---

## Search and Research

### Search Novel Content

```
Search for "magic sword" in the novel
```

This searches across:
- Chapters
- Character descriptions
- Plot outline
- World-building notes

### Advanced Search Patterns

#### Search for Dialogue

```
Search for dialogue containing "I will never leave you"
```

#### Search in Specific Files

```
Search for "protagonist" in chapters/ only
```

#### Search with Context

```
Search for "ancient artifact" with 5 lines of context
```

### Use grep for File Search

```
Use grep to find all files containing "dragon"
```

### Use glob for Pattern Matching

```
Find all files matching "chapters/*.md"
```

---

## Session Management

### List Recent Sessions

```
List sessions from the last 7 days
```

### Read Session History

```
Read session ses_abc123
```

### Search Across Sessions

```
Search sessions for "dragon pact"
```

### Get Session Metadata

```
Get info for session ses_abc123
```

Expected output:
```
Session: ses_abc123
Messages: 45
Date Range: 2026-01-15 to 2026-01-18
Duration: 3 days
Agents Used: novelist, plot-designer, editor
Has Todos: Yes (12 items, 8 completed)
```

---

## Configuration

### View Current Configuration

```
Show me the current oh-my-novel configuration
```

### Edit Configuration

Edit `.opencode/oh-my-novel.jsonc`:

```jsonc
{
  "$schema": "./oh-my-novel.schema.json",

  // Novel defaults
  "novelSettings": {
    "defaultGenre": "fantasy",
    "chapterLength": 3000,
    "autoSave": true
  },

  // Override agent models
  "agents": {
    "novelist": {
      "model": "anthropic/claude-opus-4-5",
      "temperature": 0.7
    },
    "plot-designer": {
      "model": "openai/gpt-5.2",
      "temperature": 0.3
    }
  },

  // Long-running settings
  "longRunning": {
    "maxRetries": 5,
    "retryDelay": 5000,
    "batchSize": 10,
    "checkpointInterval": 1
  },

  // Disable specific hooks
  "hooks": {
    "disabled": ["comment-checker"]
  }
}
```

### Reload Configuration

After editing configuration files, the changes are automatically detected and applied.

---

## Best Practices

### 1. Start with a Clear Vision

Before generating, have a clear idea of:
- Genre and tone
- Main characters and their arcs
- Key plot points
- Setting and world details

### 2. Use Categories Wisely

Different tasks benefit from different settings:

| Task | Recommended Category |
|------|---------------------|
| Plot outlining | `plotting` |
| Character creation | `character-development` |
| World building | `world-building` |
| Chapter writing | `writing` |
| Editing and refining | `editing` |

### 3. Check Progress Regularly

For long-running generation:
```
Check progress every 10 chapters
```

### 4. Review and Edit

AI-generated content benefits from human review:
- Read each chapter
- Fix inconsistencies
- Refine prose
- Add personal touches

### 5. Use Auto-Save

Enable auto-save in configuration:
```jsonc
{
  "novelSettings": {
    "autoSave": true
  }
}
```

### 6. Manage Disk Space

Long-running generation creates many files:
- Export completed novels
- Clean up old generation states
- Archive finished projects

### 7. Use Checkpoints

For long-running tasks:
```jsonc
{
  "longRunning": {
    "checkpointInterval": 5  // Save every 5 chapters
  }
}
```

### 8. Backup Regularly

```
Export generation state for backup regularly
```

### 9. Leverage Agents

Each agent has strengths:
- **Novelist**: Overall orchestration
- **Plot Designer**: Story structure
- **Character Developer**: Deep character work
- **World Builder**: Immersive settings
- **Editor**: Refinement and polish

### 10. Iterate and Refine

- First draft: Focus on getting the story down
- Second draft: Improve pacing and structure
- Third draft: Polish prose and dialogue

---

## Examples

### Example 1: Complete Novel Creation

```
Use the novel-generation-skill to create a fantasy novel about a young wizard

The skill will:
1. Initialize the novel project
2. Design the plot outline
3. Create main characters
4. Build the magic system
5. Write the first 5 chapters
6. Continue with chapters 6-10
7. Review and edit
8. Export the novel
```

### Example 2: Long-Running Novel

```
Start long-running generation for "Dragon Age: Legacy" with 100 chapters
Use batch size 10, max retries 3

Wait for first batch to complete...
Check progress for generation "dragon-age-legacy-001"

If all chapters successful:
Export the novel as "Dragon Age: Legacy.md"

If failures occur:
Review failed chapters
Fix issues manually
Resume generation
```

### Example 3: Character-Driven Novel

```
Create a character-driven romance novel

1. Create protagonists:
   - "Emma": Shy librarian, dreams of adventure
   - "Jack": Reformed pirate, searching for redemption

2. Develop their backstories:
   - Emma: Grew up reading adventure novels, yearns for excitement
   - Jack: Former pirate captain, left the life after a tragedy

3. Outline the plot:
   - Meet-cute in the library
   - Adventure forces them together
   - Fall in love during the journey
   - Face external obstacles
   - Happy ending

4. Write chapter by chapter:
   Apply "writing" category for prose
   Apply "editing" category for refinement

5. Export and polish
```

### Example 4: World-Building Focus

```
Create a science fiction novel with detailed world-building

1. Build the world first:
   - Technology level: Advanced spacefaring
   - Political system: Galactic federation
   - Alien species: Multiple civilizations
   - Conflict: Resource scarcity

2. Document world details:
   Create categories: Technology, Politics, Species, History

3. Outline plot:
   - Protagonist: Diplomat caught in interstellar crisis
   - Conflict: Ancient threat emerging
   - Stakes: Galaxy at war

4. Write with world in mind:
   Apply "world-building" category for consistency
   Ensure details align throughout

5. Export novel
```

### Example 5: Multi-Agent Collaboration

```
Create a fantasy epic with complex plot

1. Use Plot Designer:
   Apply "plotting" category
   Create detailed story arc with subplots

2. Use Character Developer:
   Apply "character-development" category
   Create multi-dimensional protagonists and antagonists

3. Use World Builder:
   Apply "world-building" category
   Build detailed magic system and geography

4. Write chapters with Novelist:
   Apply "writing" category
   Generate engaging prose

5. Refine with Editor:
   Apply "editing" category
   Polish for consistency and quality
```

---

## Troubleshooting

### Novel generation stuck

**Solution:**
```
Pause the generation
Check progress
Resume from checkpoint
```

### Character inconsistency

**Solution:**
```
Update character notes
Use Character Developer to refine profiles
Regenerate problematic chapters
```

### Plot holes

**Solution:**
```
Use Plot Designer to outline missing scenes
Add connecting chapters
Review and edit flow
```

### Loss of creative direction

**Solution:**
```
Review plot outline
Clarify the story's core theme
Realign chapters with the outline
```

---

## Next Steps

1. **Practice** with short stories before attempting novels
2. **Experiment** with different categories and settings
3. **Iterate** on your workflow to find what works best
4. **Share** your novels and get feedback
5. **Contribute** improvements to the plugin

---

## Support

- **Documentation:** [README.md](./README.md)
- **Installation:** [INSTALLATION.md](./INSTALLATION.md)
- **Agent Details:** [AGENTS.md](./AGENTS.md)
- **Quick Reference:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **Issues:** https://github.com/mxrain/oh-my-novel/issues
- **Discussions:** https://github.com/mxrain/oh-my-novel/discussions

---

**Happy Writing! 📚✨**
