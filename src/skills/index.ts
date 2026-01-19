import { Skill } from "opencode";

export const skills: Record<string, Skill> = {
  "novel-generation-skill": {
    description: "Complete end-to-end novel generation workflow",
    enabled: true,
    prompt: `You are executing the complete novel generation workflow. Follow these steps systematically:

## Step 1: Novel Concept Foundation
1. Consult with the Plot Designer to establish:
   - Core concept and premise
   - Genre conventions
   - Target audience
   - Story structure (three-act, hero's journey, etc.)

2. Work with the World Builder to create:
   - Setting and atmosphere
   - World rules (magic system, technology level, etc.)
   - Cultures and societies
   - Geographic details

3. Collaborate with the Character Developer to design:
   - Protagonist(s) with clear goals and flaws
   - Antagonist(s) with believable motivations
   - Supporting cast with distinct roles
   - Character relationships and dynamics

## Step 2: Plot Outline Creation
1. Use the plot_outline tool to create a comprehensive outline:
   - Act structure with key turning points
   - Chapter-by-chapter breakdown
   - Subplot trajectories
   - Climax and resolution planning

## Step 3: Chapter-by-Chapter Writing
For each chapter:
1. Review the plot outline for this chapter's objectives
2. Consult with Plot Designer for story beats
3. Check with Character Developer for character consistency
4. Verify setting details with World Builder
5. Write the chapter using chapter_write tool
6. Track word count and progress

## Step 4: Iterative Refinement
After writing major sections:
1. Use the Editor agent to review:
   - Prose quality and flow
   - Dialogue naturalness
   - Narrative pacing
   - Continuity and consistency
2. Implement suggested improvements
3. Re-read for emotional impact

## Step 5: Final Polish
1. Review all chapters for:
   - Character voice consistency
   - Plot hole resolution
   - Satisfying character arcs
   - Emotional resonance
2. Use export_novel to generate the final manuscript
3. Celebrate completion!

## Best Practices:
- Maintain a separate character profile for each major character
- Update world-building notes as new elements are introduced
- Save plot outline revisions to track story evolution
- Use auto-save features to protect your work
- Take breaks between major story beats to maintain freshness

## Quality Checkpoints:
- After every 5 chapters: Review overall story progression
- At midpoint: Verify plot tension is building appropriately
- Before climax: Ensure all story elements are in place
- Final review: Check that all character arcs resolve satisfactorily

Remember: Great novels are rewritten, not just written. Don't hesitate to revise and refine!`,
    tools: ["novel_create", "chapter_write", "character_manage", "plot_outline", "world_notes", "export_novel"],
    agents: ["novelist", "plot-designer", "character-developer", "world-builder", "editor"]
  }
};
