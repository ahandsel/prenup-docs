---
name: thinking-first-draft
description: Before drafting a blog post, report, review, or design, interview the author for the "thinking material" (motive, audience, the one key point, project context) and write with that thinking injected. Use this to avoid output that reads as "AI-like" (AI っぽい) - hollow, generic, and unaccountable. Trigger when asked to draft, write up, summarize, or review content from scratch and the purpose or audience has not been stated.
---

# Thinking-first draft

Output reads as "AI-like" (AI っぽい) not because of its writing style, but because no one's thinking went through it. This skill puts a short interview before drafting so the thinking is captured first.

Adapted from RIO's essay [「AI っぽい」の正体は文体じゃない][src]. The diagnosis: surface fixes (cutting connectives, varying sentence endings) only treat symptoms. The real cause is the absence of three processes:

- **咀嚼 (digest)** - chewing the information over, not just passing it through. "So what this means is..."
- **判断 (judgment)** - deciding what matters and what to cut. "Use this, drop that."
- **責任 (responsibility)** - being able to answer "why this conclusion?" in your own words when challenged.

When work is handed to an AI, the human tends to skip these too, and the result is output no one has thought through. Readers notice ("これ、誰も考えてないな"). The fix is not to stop using AI - it is to feed the thinking material into the workflow up front.

## The three layers of "AI-ness"

| Layer | Symptom | Where it is fixed |
| --- | --- | --- |
| 表層 (surface) - style | Stock phrases, overused connectives, monotone endings | Prompt tweaks |
| 中層 (middle) - information design | Exhaustive but no priority, too long, no payoff up top | Output structure |
| 深層 (deep) - absent thinking | Not digested, no judgment, cannot answer pushback | **This skill** |

Most "remove AI smell" tactics stop at the surface. This skill targets the deep layer.

## When to use

Use before drafting from scratch when the purpose or audience has not been stated: blog posts, reports, summaries, code reviews, design proposals. If the author has already supplied the thinking material, skip straight to drafting and just confirm you captured it.

Do not use for mechanical edits (linting, formatting, translation of already-decided content) - those carry the author's thinking already.

## The interview

Ask the author the questions for the matching content type **before** writing. Keep it short - two or three questions, not an interrogation. If the author cannot answer a question, that gap is itself the signal that the piece is not ready to draft.

- **Blog post / article**: Why are you writing this (the motive)? What is the one thing you most want to convey? What did the team actually struggle with or learn?
- **Report / summary**: Who is the reader, and what decision are they trying to make? What is the critical answer the summary must lead with? What level of detail do they need?
- **Code review**: What are this project's own rules and its "things we deliberately do not do"? What was the implementer's intent and the flow of the change? (Aim for review that follows the sequence and asks about real edge cases, not generic advice like "add error handling" or "follow DRY" that fits any project and therefore none.)
- **Design**: Who is the target user and what feels comfortable to them? Any reference images or an established world / tone for this product? (Bias the input toward this product's direction rather than the statistically safe default.)

For any other content type, ask the general form: **why** this piece, **for whom**, and **what one thing** must land.

## Draft, then self-check

1. Draft using the answers as the spine. Lead with the critical point; cut what the reader does not need to decide.
2. Self-check against the deep layer before returning:
   - Could the author answer "why this conclusion?" from this draft? If not, the judgment is missing.
   - Is anything in here so generic it would fit any project, any reader? Cut or specialize it.
   - Does the motive show, or only the information? Add the digested point, not more facts.
3. Note briefly which thinking material shaped the draft, so the author can see their input landed.

## Relationship to other skills

This skill governs the **deep** layer (was it thought through). For the **surface** layer once a draft exists, hand off to `avoid-ai-writing` (AI-ism vocabulary and rhythm) or, for Japanese manuscripts, `ja-tech-writing`. Order: think first with this skill, then polish style with those.

[src]: https://github.com/rioX432/zenn-article/blob/master/articles/ai-likeness-not-about-writing-style.md
