# Demo video — shot script

Two minutes, hard cap. The brief splits it for you:

> "Use minute one to demo the project as a citizen. Use minute two to explain how you built it and why you
> made those choices."

Treat that as a rule, not a suggestion. Minute one is **only** the citizen experience — no architecture talk.
Minute two is **only** build and reasoning.

Also from the brief: *"Every feature you demo must work."* Everything below is verified working. Do not
improvise a screen that is not in this list.

---

## Before you hit record

1. **Reset the demo.** Sidebar → **Reset**. The passport card must be unread and the count must read
   *"2 things need your attention."*
2. **Light theme.** It survives video compression better than dark. Sidebar → **Light mode**.
3. **Window at 1440×900 or wider.** The rail collapses under 1024px and `/before` stops being two columns.
4. **Close the AI conversation history** if you have old conversations — Reset does not clear them. Delete
   them from the rail so the sidebar looks clean.
5. **Open these tabs in order** so you are never waiting on a page load:
   `/before` · `/` · `/home` · `/architecture` · `/passport` · `/schemes/medcs`
6. **Do one silent dry run.** The passport journey takes about 25 seconds at a comfortable pace. Learn the
   clicks so you are not hunting for buttons on the take.
7. **Warm the AI once.** Open AI mode, ask anything, close it. The first model call of a session is slower.
8. **Check the two live numbers.** "46 days" is computed from today's date, and the composed journey lists
   five items across four departments. Both were correct when this was written — glance at the screen and
   say whatever it actually shows.

---

## The script

Narration is written to be spoken at a normal, unhurried pace. Roughly 320 words in 120 seconds. Where a
row says *hold*, stop clicking and let the screen breathe.

| Time | On screen — what you do | What you say |
|---|---|---|
| **0:00–0:11** | Open on **`/before`**, annotations already on. Slow scroll down the left column so the orange *"government already holds this"* tags stream past. | "Renewing an Indian passport asks seventy-eight questions. Government already knows the answer to forty-one of them — in eleven different systems. That isn't a form problem. It's an architecture problem." |
| **0:11–0:22** | Cut to **`/`**. One beat on the ten tiles each labelled *Separate login*. Click **Continue as demo citizen**. Land on `/home`. *Hold* on the greeting. | "So I didn't redesign a portal. I built the layer underneath. One identity for all of government — and because it's one relationship, it opens by telling me my passport expires in forty-six days." |
| **0:22–0:38** | Click **Renew passport**. Move through step 1 → 2. Cursor **hover the source labels** under the prefilled values so the judge sees *Verified government profile*. Then *hold* on the consent card. | "Nothing here was typed by me. Every value shows which department it came from. And Passport Seva asks permission for exactly one thing — my parents' details — for one stated reason." |
| **0:38–0:50** | Allow. Continue. Pick a centre, pick a slot, continue past the fee, land on Review, click **Submit**. Land on the case page. *Hold* on the progress rail. | "A slot, held the moment I pick it. Review. Submit. That's a case I can follow from anywhere in Gov.in. Four minutes and four answers, instead of seventy-eight fields." |
| **0:50–1:00** | Back to `/home`. Type **`I am moving to Bangalore next month`** into the bar. Let the result card land. *Hold* on the composed step list. | "And it isn't one service. There's no government service called *moving house*. There are five things to update, across four departments. So the system composes one journey." |
| **1:00–1:13** | Cut to **`/architecture`**. Scroll to the stack diagram. *Hold* on it — do not scroll while talking. | "Here's how. Ten departments on one registry. Identity, consent, cases and notifications are built once, at the bottom. A journey is a config file, not a codebase — so the eleventh department is a registry entry, not a rebuild." |
| **1:13–1:26** | Cut to **`/passport`**. *Hold* two seconds on the strip along the top, then scroll once through the department's own navigation and its appointment centres. | "Departments still own what matters. Passport Seva has its own domain, its own colour, its own navigation, its own appointment inventory. What it doesn't have is its own login — I was never asked to make an account." |
| **1:26–1:38** | Cut to **AI mode**, already showing the PF exchange. Point at the refusal, then the consent card, then the answer with the balance. | "Two choices I'd defend. AI only where it earns its place — naming a service runs no model at all. And it opens knowing my first name and nothing else. Ask it my PF balance and it refuses until I share it." |
| **1:38–1:47** | Cut to **`/schemes/medcs`**. *Hold* on the *"We have not checked whether you qualify"* panel. | "Same rule for schemes. Government can tell me one exists — but it checks whether I qualify only if I let it. That's easier for the citizen and cheaper for the department." |
| **1:47–1:56** | Back to `/architecture`, scroll to **What this prototype actually is** — the real / simulated split. *Hold*. | "What's real: the registry, the journey engine, the consent ledger, live state. What's simulated: every citizen is fictional, and department processing is a triggered event. That line is on the site, not just in this video." |
| **1:56–2:00** | Full screen on the Gov.in wordmark, or the architecture diagram. | "I didn't redesign ten portals. I redesigned what they sit on." |

---

## Why the script is shaped this way

The six judging criteria are published. Each beat is aimed at one:

| Criterion | Where it lands |
|---|---|
| Problem — real and important | 0:00, stated as a number rather than an opinion |
| Working build — the main journey actually works | 0:22–0:50, uncut, start to finish |
| Usability — simpler, clearer, accessible | 0:22–0:50, and the four-answers line |
| Product thinking — choices well explained | 1:26–1:47, the two choices and the scheme rule |
| **End-to-end thinking — backend, infrastructure and processes, not just the interface** | 1:00–1:26. This is the criterion the whole project was built for. Do not rush it. |
| Honesty — limitations and mock data disclosed | 1:47, and it is on the site itself |

The brief allows either "one specific problem" **or** "rethink the entire experience". You are doing the
second, which is riskier to explain in ten seconds — so the video opens on one concrete, countable problem
and only reveals the architecture in minute two, once the judge already believes the thing works.

---

## Delivery notes

- **Do not read this aloud verbatim if it makes you sound stiff.** Learn the beat, say it your way. The
  numbers are the only part that must be exact.
- **Say numbers slowly.** "Seventy-eight" and "forty-one" are the whole opening argument.
- **Never say "as you can see".** Show it instead.
- **Do not narrate clicks.** "Now I'll click submit" wastes a second you do not have.
- **One take per minute is fine.** Record minute one and minute two separately and join them. Nobody
  requires a single take.
- **Silence beats filler.** If you fumble, stop, breathe, restart the sentence. You can cut it.

## If something misbehaves on the take

- **AI mode is slow to answer** — you pre-warmed it, but if it stalls, cut to the exchange you already have
  on screen rather than waiting. It is the same screen either way.
- **The model returns something odd in AI mode** — re-run it. It is non-deterministic; the deterministic
  parts of the demo are not.
- **You mistype in the intent bar** — leave it. It still resolves, and a real typo resolving correctly is a
  better demo than a clean one.

## Recording setup

Loom or OBS, whichever you already have. Screen at 1440×900 or larger, 30fps is plenty. Record system audio
off and microphone on — no background music. Export at 1080p.

Upload somewhere that opens **without requesting access**. Test the link in a private window before you
submit it, the same way you test the deployment link.

---

## For the written submission, not the video

The FAQ is explicit: *"Codex should be meaningfully involved in the build. You may use other development
tools and libraries, but your submission should explain how Codex contributed."*

State plainly in the description what you actually used and in what role. Judges score **Honesty** as its own
criterion, and an accurate tool disclosure costs you far less than a discrepancy someone finds later.

The 250-word project summary is in [SUBMISSION.md](SUBMISSION.md).
